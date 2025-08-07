# -*- coding: utf-8 -*-
# Standard library logging for consistent merge behavior
import logging
import unicodedata
from difflib import SequenceMatcher
from django.http import JsonResponse, HttpResponse
from django.contrib.auth import authenticate, login as django_auth_login, logout as django_auth_logout
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.shortcuts import get_object_or_404, render
from django.utils.decorators import method_decorator
from django.template.loader import render_to_string
import json
import io
from xhtml2pdf import pisa
from .models import Cliente, ProyectoCatalog, ClienteFile, OpenAIConfig
import base64
import os
from django.conf import settings

logger = logging.getLogger(__name__)

@ensure_csrf_cookie  # Para que Django envíe el cookie CSRF en la primera petición GET si es necesario
def main_app_view(request):
    """
    Sirve el archivo HTML principal.
    """
    return render(request, 'ia_fast_track_model.html')

@csrf_exempt  # Para desarrollo. En producción, el frontend debe enviar el token CSRF.
def api_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'message': 'JSON invalido'}, status=400)

        user = authenticate(request, username=username, password=password)
        if user is not None and user.is_staff:  # Asumimos que solo usuarios 'staff' pueden loguearse
            django_auth_login(request, user)
            return JsonResponse({'success': True, 'message': 'Login exitoso'})
        else:
            return JsonResponse({'success': False, 'message': 'Credenciales incorrectas o usuario no autorizado'}, status=401)
    return JsonResponse({'error': 'Metodo POST requerido'}, status=405)

def api_get_clients(request):
    # Aquí deberías añadir autenticación si es necesario
    # if not request.user.is_authenticated or not request.user.is_staff:
    #     return JsonResponse({'error': 'No autorizado'}, status=401)
    clientes = Cliente.objects.all().order_by('nombre_cliente')
    data = [{"id": cliente.id, "name": cliente.nombre_cliente} for cliente in clientes]
    return JsonResponse(data, safe=False)

@csrf_exempt  # Para desarrollo. En producción, el frontend debe enviar el token CSRF.
def api_get_client_diagnostico(request, client_id):
    # if not request.user.is_authenticated or not request.user.is_staff:
    #     return JsonResponse({'error': 'No autorizado'}, status=401)
    cliente = get_object_or_404(Cliente, id=client_id)
    return JsonResponse(cliente.diagnostico_json)

@csrf_exempt  # Para desarrollo. En producción, el frontend debe enviar el token CSRF.
def api_get_client_resume(request, client_id):
    # if not request.user.is_authenticated or not request.user.is_staff:
    #     return JsonResponse({'error': 'No autorizado'}, status=401)
    cliente = get_object_or_404(Cliente, id=client_id)
    return JsonResponse(cliente.resumen_json or {}, safe=False)

@csrf_exempt  # Para desarrollo. En producción, el frontend debe enviar el token CSRF.
def api_get_project_catalog(request):
    # if not request.user.is_authenticated or not request.user.is_staff:
    #     return JsonResponse({'error': 'No autorizado'}, status=401)
    try:
        catalogo = ProyectoCatalog.objects.latest('version')
        return JsonResponse(
            catalogo.datos_catalogo,
            json_dumps_params={'ensure_ascii': False}
        )
    except ProyectoCatalog.DoesNotExist:
        return JsonResponse({'error': 'Catalogo de proyectos no encontrado'}, status=404)

@csrf_exempt
def api_ai_search_projects(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Metodo POST requerido'}, status=405)
    try:
        data = json.loads(request.body)
        prompt = data.get('prompt', '')
    except Exception as e:
        logger.exception("Error al leer el JSON de la solicitud: %s", e)
        return JsonResponse({'error': 'JSON invalido'}, status=400)
    if not prompt:
        return JsonResponse({'error': 'Prompt vacio'}, status=400)
    try:
        catalogo = ProyectoCatalog.objects.latest('version')
        catalog = catalogo.datos_catalogo
    except ProyectoCatalog.DoesNotExist as e:
        logger.exception("Catalogo de proyectos no disponible: %s", e)
        return JsonResponse({'error': 'Catalogo no disponible'}, status=500)

    def catalog_for_ai(cat):
        light = {"categories": []}
        for c in cat.get("categories", []):
            light_cat = {"categoryName": c.get("categoryName"), "subcategories": []}
            for s in c.get("subcategories", []):
                light_sub = {"subcategoryName": s.get("subcategoryName"), "projects": []}
                for p in s.get("projects", []):
                    light_sub["projects"].append({
                        "projectName": p.get("projectName"),
                        "description": p.get("description", ""),
                    })
                light_cat["subcategories"].append(light_sub)
            light["categories"].append(light_cat)
        return light

    catalog_json = json.dumps(catalog_for_ai(catalog), ensure_ascii=False)

    config = OpenAIConfig.objects.first()
    api_base = config.endpoint if config else settings.OPENAI_ENDPOINT
    api_key = config.api_key if config else settings.OPENAI_API_KEY
    api_version = config.api_version if config else settings.OPENAI_API_VERSION
    api_type = config.api_type if config else settings.OPENAI_API_TYPE
    model_name = config.model_name if config else settings.OPENAI_MODEL

    try:
        from openai import OpenAI, AzureOpenAI

        if api_type == 'azure':
            client = AzureOpenAI(api_key=api_key, api_version=api_version, azure_endpoint=api_base)
        else:
            client = OpenAI(api_key=api_key, base_url=api_base)

        def chat_complete(messages):
            params = {'model': model_name, 'messages': messages}
            return client.chat.completions.create(**params)

    except ImportError:  # Fallback for older openai versions
        import openai

        openai.api_key = api_key
        if api_type == 'azure':
            openai.api_type = 'azure'
            openai.api_base = api_base
            openai.api_version = api_version

            def chat_complete(messages):
                return openai.ChatCompletion.create(engine=model_name, messages=messages)
        else:
            openai.api_base = api_base

            def chat_complete(messages):
                return openai.ChatCompletion.create(model=model_name, messages=messages)

    def extract_content(resp):
        try:
            return resp.choices[0].message.content
        except (AttributeError, TypeError, KeyError, IndexError):
            return resp['choices'][0]['message']['content']

    system_msg = 'Eres un asistente que recomienda proyectos del catalogo.'
    user_msg = (
        f"Catalogo de proyectos en formato JSON: {catalog_json}\n"
        'Devuelve los projectName de los proyectos del catalogo que se ajusten a la necesidad del usuario. '
        'Responde solo con JSON {"projects": ["nombre1", "nombre2"], '
        '"new_project": {"projectName": "...", "description": "...", "technology": "..."}}. '
        'Si encuentras proyectos del catalogo, la propiedad new_project debe omitirse o ser null. '
        'Si no hay coincidencias, projects debe ser una lista vacia y new_project debe incluir un nuevo proyecto '
        'con categoryName "Otros" y subcategoryName "Otro".'
    )
    try:
        messages = [
            {'role': 'system', 'content': system_msg},
            {'role': 'user', 'content': prompt + '\n' + user_msg},
        ]
        logger.info("Solicitando proyectos a OpenAI: %s", messages)
        ai_resp = chat_complete(messages)
        logger.info("Respuesta de OpenAI: %s", ai_resp)
        text = extract_content(ai_resp)
        logger.debug("Contenido textual de OpenAI: %s", text)
        ai_data = json.loads(text)
        logger.info("JSON de OpenAI parseado: %s", ai_data)
    except Exception as e:
        logger.exception("Error al obtener proyectos desde OpenAI: %s", e)
        ai_data = {'projects': [], 'new_project': None}

    import re

    def normalize_text(text):
        return re.sub(r'\W+', '', unicodedata.normalize('NFD', text or '').encode('ascii', 'ignore').decode('utf-8').lower())

    def is_close_match(a, b):
        return a == b or SequenceMatcher(None, a, b).ratio() > 0.8

    results = []
    for idx, item in enumerate(ai_data.get('projects', [])):
        logger.debug("Procesando item %s: %s", idx, item)
        pid = None
        pname = None

        if isinstance(item, dict):
            pid = item.get('id')
            pname = item.get('projectName') or item.get('name') or pid
        else:
            pname = str(item)

        found = False
        target = normalize_text(pname) if pname else None
        logger.debug("Buscando coincidencias para pid=%s pname=%s", pid, pname)
        for cat in catalog.get('categories', []):
            for sub in cat.get('subcategories', []):
                for proj in sub.get('projects', []):
                    proj_name_norm = normalize_text(proj.get('projectName'))
                    if (
                        pid and str(proj.get('id')) == str(pid)
                    ) or (
                        target and proj_name_norm and is_close_match(proj_name_norm, target)
                    ):
                        results.append({
                            'id': proj.get('id'),
                            'projectName': proj.get('projectName'),
                            'description': proj.get('description'),
                            'technology': proj.get('technology'),
                            'categoryName': cat.get('categoryName'),
                            'subcategoryName': sub.get('subcategoryName'),
                        })
                        logger.debug("Match encontrado: %s", results[-1])
                        found = True
                        break
                if found:
                    break
            if found:
                break
        if not found:
            logger.debug("Sin coincidencias para item %s", item)

    new_proj = ai_data.get('new_project')
    if not results and new_proj:
        logger.debug("Evaluando nuevo proyecto sugerido: %s", new_proj)
        potential = new_proj.get('projectName') or new_proj.get('name')
        target_new = normalize_text(potential) if potential else None
        matched = None
        if target_new:
            for cat in catalog.get('categories', []):
                for sub in cat.get('subcategories', []):
                    for proj in sub.get('projects', []):
                        proj_name_norm = normalize_text(proj.get('projectName'))
                        if proj_name_norm and is_close_match(proj_name_norm, target_new):
                            matched = {
                                'id': proj.get('id'),
                                'projectName': proj.get('projectName'),
                                'description': proj.get('description'),
                                'technology': proj.get('technology'),
                                'categoryName': cat.get('categoryName'),
                                'subcategoryName': sub.get('subcategoryName'),
                            }
                            logger.debug("Nuevo proyecto coincidió con catálogo: %s", matched)
                            break
                    if matched:
                        break
                if matched:
                    break
        if matched:
            results.append(matched)
        else:
            logger.debug("Agregando nuevo proyecto sin coincidencias: %s", new_proj)
            results.append({
                'id': new_proj.get('id') or 'suggested_0',
                'projectName': new_proj.get('projectName') or new_proj.get('name'),
                'description': new_proj.get('description', ''),
                'technology': new_proj.get('technology', ''),
                'categoryName': 'Otros',
                'subcategoryName': 'Otro',
            })

    logger.info("Resultados finales: %s", results)

    return JsonResponse({'projects': results}, json_dumps_params={'ensure_ascii': False})

@csrf_exempt
def api_save_summary(request, client_id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            # Aquí deberías guardar el resumen en el modelo correspondiente
            # Por ejemplo:
            cliente = get_object_or_404(Cliente, id=client_id)
            cliente.resumen_json = data
            cliente.save()
            return JsonResponse({'success': True})
        except Exception:
            return JsonResponse({'success': False, 'message': 'Error al guardar el resumen'}, status=500)
    return JsonResponse({'error': 'Metodo POST requerido'}, status=405)

def api_upload_file(request, client_id):
    if request.method == 'POST' and request.FILES:
        cliente = get_object_or_404(Cliente, id=client_id)
        files_info = []
        for f in request.FILES.getlist('files'):
            cliente_file = ClienteFile.objects.create(
                cliente=cliente,
                file=f,
                nombre_original=f.name
            )
            files_info.append({
                'nombre': cliente_file.nombre_original,
                'url': cliente_file.file.url
            })
        return JsonResponse({'success': True, 'files': files_info})
    return JsonResponse({'success': False, 'message': 'No files uploaded'}, status=400)

def descargar_pdf(request, client_id):
    try:
        cliente = get_object_or_404(Cliente, id=client_id)
        resumen_json = cliente.resumen_json or {}
        from django.contrib.staticfiles import finders
        try:
            from cairosvg import svg2png
        except Exception:
            svg2png = None

        def icon_b64(filename):
            try:
                png_path = finders.find(f"model/icons/{filename}.png")
                if png_path:
                    with open(png_path, "rb") as f:
                        return base64.b64encode(f.read()).decode()

                svg_path = finders.find(f"model/icons/{filename}.svg")
                if svg_path and svg2png:
                    try:
                        png_bytes = svg2png(url=svg_path)
                        return base64.b64encode(png_bytes).decode()
                    except Exception as e:
                        logger.error(f"Error converting SVG {filename}: {e}")
            except Exception as e:
                print(f'Error loading icon {filename}: {str(e)}')
            return '' 

        icons = {
            "icon_problema": icon_b64("shield-exclamation"),
            "icon_solucion": icon_b64("rocket-launch"),
            "icon_valor": icon_b64("sparkles"),
            "icon_fases": icon_b64("arrow-path-rounded-square"),
            "icon_kpi": icon_b64("presentation-chart-line"),
            "icon_roi": icon_b64("currency-dollar"),
            "icon_pitch": icon_b64("megaphone"),
        }

        # Logos
        def logo_b64(filename):
            try:
                path = finders.find(filename)
                if path:
                    with open(path, "rb") as f:
                        return base64.b64encode(f.read()).decode()
            except Exception as e:
                print(f"Error loading logo {filename}: {str(e)}")
            return ""

        logos = {
            "logo_fast_track": logo_b64("logo-fast-track.png"),
            "logo_synergia": logo_b64("logo_synergia.png"),
            "logo_edge": logo_b64("logo-edge.png"),
        }

        context = {
            "cliente": cliente,
            "resumen": resumen_json,
            **icons,
            **logos,
        }

        html = render_to_string("pdf_template.html", context)
        result = io.BytesIO()
        pisa_status = pisa.CreatePDF(html, dest=result)
        if pisa_status.err:
            return HttpResponse("Error al generar PDF", status=500)
        response = HttpResponse(result.getvalue(), content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{cliente.nombre_cliente}_resumen.pdf"'
        return response
    except Exception as e:
        return HttpResponse(f"Error al generar PDF: {str(e)}", status=500)
