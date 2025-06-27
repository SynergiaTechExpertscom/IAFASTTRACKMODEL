# encoding: utf-8 
from django.http import JsonResponse, HttpResponse
from django.contrib.auth import authenticate, login as django_auth_login, logout as django_auth_logout
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.shortcuts import get_object_or_404, render
from django.utils.decorators import method_decorator
from django.template.loader import render_to_string
import json
import io
from xhtml2pdf import pisa
from .models import Cliente, ProyectoCatalog, ClienteFile

# ---- Utilidades para PDF ----
CATEGORY_COLOR_STYLES = {
    "Finanzas y Contabilidad": {"bg": "#059669", "text": "#D1FAE5", "iconFill": "#6EE7B7", "border": "#047857"},
    "Recursos Humanos": {"bg": "#0284C7", "text": "#E0F2FE", "iconFill": "#7DD3FC", "border": "#0369A1"},
    "Atención al Cliente": {"bg": "#D97706", "text": "#FEF3C7", "iconFill": "#FDBA74", "border": "#B45309"},
    "Operaciones y Cadena de Suministro": {"bg": "#BE185D", "text": "#FCE7F3", "iconFill": "#F9A8D4", "border": "#9D174D"},
    "Ventas y Marketing": {"bg": "#A21CAF", "text": "#FAE8FF", "iconFill": "#F0ABFC", "border": "#86198F"},
    "Analítica y Datos": {"bg": "#4F46E5", "text": "#EEF2FF", "iconFill": "#A5B4FC", "border": "#4338CA"},
    "Sugeridos": {"bg": "#F59E0B", "text": "#FFFBEB", "iconFill": "#FCD34D", "border": "#D97706"},
    "Otros": {"bg": "#475569", "text": "#E2E8F0", "iconFill": "#94A3B8", "border": "#334155"},
    "Default": {"bg": "#374151", "text": "#D1D5DB", "iconFill": "#9CA3AF", "border": "#1F2937"},
}

ICONS = {
    "finance": "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M12 6V18M9 15.1818L9.87887 15.841C11.0504 16.7197 12.9498 16.7197 14.1214 15.841C15.2929 14.9623 15.2929 13.5377 14.1214 12.659C13.5355 12.2196 12.7677 12 11.9999 12C11.275 12 10.5502 11.7804 9.99709 11.341C8.891 10.4623 8.891 9.03772 9.9971 8.15904C11.1032 7.28036 12.8965 7.28036 14.0026 8.15904L14.4175 8.48863M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z' stroke='#FFFFFF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></svg>",
    "hr": "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M20.25 14.1499V18.4C20.25 19.4944 19.4631 20.4359 18.3782 20.58C16.2915 20.857 14.1624 21 12 21C9.83757 21 7.70854 20.857 5.62185 20.58C4.5369 20.4359 3.75 19.4944 3.75 18.4V14.1499M20.25 14.1499C20.7219 13.7476 21 13.1389 21 12.4889V8.70569C21 7.62475 20.2321 6.69082 19.1631 6.53086C18.0377 6.36247 16.8995 6.23315 15.75 6.14432M20.25 14.1499C20.0564 14.315 19.8302 14.4453 19.5771 14.5294C17.1953 15.3212 14.6477 15.75 12 15.75C9.35229 15.75 6.80469 15.3212 4.42289 14.5294C4.16984 14.4452 3.94361 14.3149 3.75 14.1499M3.75 14.1499C3.27808 13.7476 3 13.1389 3 12.4889V8.70569C3 7.62475 3.7679 6.69082 4.83694 6.53086C5.96233 6.36247 7.10049 6.23315 8.25 6.14432M15.75 6.14432V5.25C15.75 4.00736 14.7426 3 13.5 3H10.5C9.25736 3 8.25 4.00736 8.25 5.25V6.14432M15.75 6.14432C14.5126 6.0487 13.262 6 12 6C10.738 6 9.48744 6.0487 8.25 6.14432M12 12.75H12.0075V12.7575H12V12.75Z' stroke='#FFFFFF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></svg>",
    "clientes": "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M17.9999 18.7191C18.2474 18.7396 18.4978 18.75 18.7506 18.75C19.7989 18.75 20.8054 18.5708 21.741 18.2413C21.7473 18.1617 21.7506 18.0812 21.7506 18C21.7506 16.3431 20.4074 15 18.7506 15C18.123 15 17.5403 15.1927 17.0587 15.5222M17.9999 18.7191C18 18.7294 18 18.7397 18 18.75C18 18.975 17.9876 19.1971 17.9635 19.4156C16.2067 20.4237 14.1707 21 12 21C9.82933 21 7.79327 20.4237 6.03651 19.4156C6.01238 19.1971 6 18.975 6 18.75C6 18.7397 6.00003 18.7295 6.00008 18.7192M17.9999 18.7191C17.994 17.5426 17.6494 16.4461 17.0587 15.5222M17.0587 15.5222C15.9928 13.8552 14.1255 12.75 12 12.75C9.87479 12.75 8.00765 13.8549 6.94169 15.5216M6.94169 15.5216C6.46023 15.1925 5.87796 15 5.25073 15C3.59388 15 2.25073 16.3431 2.25073 18C2.25073 18.0812 2.25396 18.1617 2.26029 18.2413C3.19593 18.5708 4.2024 18.75 5.25073 18.75C5.50307 18.75 5.75299 18.7396 6.00008 18.7192M6.94169 15.5216C6.35071 16.4457 6.00598 17.5424 6.00008 18.7192M15 6.75C15 8.40685 13.6569 9.75 12 9.75C10.3431 9.75 9 8.40685 9 6.75C9 5.09315 10.3431 3.75 12 3.75C13.6569 3.75 15 5.09315 15 6.75ZM21 9.75C21 10.9926 19.9926 12 18.75 12C17.5074 12 16.5 10.9926 16.5 9.75C16.5 8.50736 17.5074 7.5 18.75 7.5C19.9926 7.5 21 8.50736 21 9.75ZM7.5 9.75C7.5 10.9926 6.49264 12 5.25 12C4.00736 12 3 10.9926 3 9.75C3 8.50736 4.00736 7.5 5.25 7.5C6.49264 7.5 7.5 8.50736 7.5 9.75Z' stroke='#FFFFFF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></svg>",
    "operations": "<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' d='M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.39 1.024 0 1.414l-.527.737c-.25.35-.272.806-.108 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.11v1.093c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.142.854.108 1.204l.527.738c.39.39.39 1.024 0 1.414l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.78.93l-.15.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.149-.894c-.07-.424-.384-.764-.78-.93-.398-.164-.854-.142-1.204.108l-.738.527a1.125 1.125 0 01-1.45-.12l-.773-.774a1.125 1.125 0 010-1.414l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.11v-1.094c0-.55.398-1.019.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.142-.854-.108-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.93l.15-.894z'/><path stroke-linecap='round' stroke-linejoin='round' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' /></svg>",
    "campaign": "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M10.3404 15.8398C9.65153 15.7803 8.95431 15.75 8.25 15.75H7.5C5.01472 15.75 3 13.7353 3 11.25C3 8.76472 5.01472 6.75 7.5 6.75H8.25C8.95431 6.75 9.65153 6.71966 10.3404 6.66022M10.3404 15.8398C10.5933 16.8015 10.9237 17.7317 11.3246 18.6234C11.5721 19.1738 11.3842 19.8328 10.8616 20.1345L10.2053 20.5134C9.6539 20.8318 8.9456 20.6306 8.67841 20.0527C8.0518 18.6973 7.56541 17.2639 7.23786 15.771M10.3404 15.8398C9.95517 14.3745 9.75 12.8362 9.75 11.25C9.75 9.66379 9.95518 8.1255 10.3404 6.66022M10.3404 15.8398C13.5 16.1124 16.4845 16.9972 19.1747 18.3749M10.3404 6.66022C13.5 6.3876 16.4845 5.50283 19.1747 4.12509M19.1747 4.12509C19.057 3.74595 18.9302 3.37083 18.7944 3M19.1747 4.12509C19.7097 5.84827 20.0557 7.65462 20.1886 9.51991M19.1747 18.3749C19.057 18.7541 18.9302 19.1292 18.7944 19.5M19.1747 18.3749C19.7097 16.6517 20.0557 14.8454 20.1886 12.9801M20.1886 9.51991C20.6844 9.93264 21 10.5545 21 11.25C21 11.9455 20.6844 12.5674 20.1886 12.9801M20.1886 9.51991C20.2293 10.0913 20.25 10.6682 20.25 11.25C20.25 11.8318 20.2293 12.4087 20.1886 12.9801' stroke='#FFFFFF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></svg>",
    "datos": "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M5.25 14.25H18.75M5.25 14.25C3.59315 14.25 2.25 12.9069 2.25 11.25M5.25 14.25C3.59315 14.25 2.25 15.5931 2.25 17.25C2.25 18.9069 3.59315 20.25 5.25 20.25H18.75C20.4069 20.25 21.75 18.9069 21.75 17.25C21.75 15.5931 20.4069 14.25 18.75 14.25M2.25 11.25C2.25 9.59315 3.59315 8.25 5.25 8.25H18.75C20.4069 8.25 21.75 9.59315 21.75 11.25M2.25 11.25C2.25 10.2763 2.5658 9.32893 3.15 8.55L5.7375 5.1C6.37488 4.25016 7.37519 3.75 8.4375 3.75H15.5625C16.6248 3.75 17.6251 4.25016 18.2625 5.1L20.85 8.55C21.4342 9.32893 21.75 10.2763 21.75 11.25M21.75 11.25C21.75 12.9069 20.4069 14.25 18.75 14.25' stroke='#FFFFFF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></svg>",
    "generativa": "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M9.8132 15.9038L9 18.75L8.1868 15.9038C7.75968 14.4089 6.59112 13.2403 5.09619 12.8132L2.25 12L5.09619 11.1868C6.59113 10.7597 7.75968 9.59112 8.1868 8.09619L9 5.25L9.8132 8.09619C10.2403 9.59113 11.4089 10.7597 12.9038 11.1868L15.75 12L12.9038 12.8132C11.4089 13.2403 10.2403 14.4089 9.8132 15.9038Z' stroke='#FFFFFF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/><path d='M18.2589 8.71454L18 9.75L17.7411 8.71454C17.4388 7.50533 16.4947 6.56117 15.2855 6.25887L14.25 6L15.2855 5.74113C16.4947 5.43883 17.4388 4.49467 17.7411 3.28546L18 2.25L18.2589 3.28546C18.5612 4.49467 19.5053 5.43883 20.7145 5.74113L21.75 6L20.7145 6.25887C19.5053 6.56117 18.5612 7.50533 18.2589 8.71454Z' stroke='#FFFFFF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/><path d='M16.8942 20.5673L16.5 21.75L16.1058 20.5673C15.8818 19.8954 15.3546 19.3682 14.6827 19.1442L13.5 18.75L14.6827 18.3558C15.3546 18.1318 15.8818 17.6046 16.1058 16.9327L16.5 15.75L16.8942 16.9327C17.1182 17.6046 17.6454 18.1318 18.3173 18.3558L19.5 18.75L18.3173 19.1442C17.6454 19.3682 17.1182 19.8954 16.8942 20.5673Z' stroke='#FFFFFF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></svg>",
    "optimizacion": "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M2.25 18L9 11.25L13.3064 15.5564C14.5101 13.188 16.5042 11.2022 19.1203 10.0375L21.8609 8.81726M21.8609 8.81726L15.9196 6.53662M21.8609 8.81726L19.5802 14.7585' stroke='#FFFFFF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></svg>",
    "predictiva": "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M3.75 3V14.25C3.75 15.4926 4.75736 16.5 6 16.5H8.25M3.75 3H2.25M3.75 3H20.25M20.25 3H21.75M20.25 3V14.25C20.25 15.4926 19.2426 16.5 18 16.5H15.75M8.25 16.5H15.75M8.25 16.5L7.25 19.5M15.75 16.5L16.75 19.5M16.75 19.5L17.25 21M16.75 19.5H7.25M7.25 19.5L6.75 21M7.5 12L10.5 9L12.6476 11.1476C13.6542 9.70301 14.9704 8.49023 16.5 7.60539' stroke='#FFFFFF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></svg>",
}

def get_category_colors(name):
    return CATEGORY_COLOR_STYLES.get(name, CATEGORY_COLOR_STYLES["Default"])

def get_icon_for_objetivo(name):
    lname = name.lower()
    if "finanzas" in lname or "contabilidad" in lname:
        return ICONS["finance"]
    if "recursos humanos" in lname or "rrhh" in lname or "talento" in lname:
        return ICONS["hr"]
    if "cliente" in lname:
        return ICONS["clientes"]
    if "operaciones" in lname or "cadena de suministro" in lname or "logística" in lname:
        return ICONS["operations"]
    if "ventas" in lname or "marketing" in lname:
        return ICONS["campaign"]
    if "analítica" in lname or "datos" in lname or "bi" in lname:
        return ICONS["datos"]
    if "eficiencia" in lname or "productividad" in lname or "automatización" in lname or "rpa" in lname:
        return ICONS["optimizacion"]
    if "ingresos" in lname or "crecimiento" in lname or "optimización" in lname:
        return ICONS["optimizacion"]
    if "innovación" in lname:
        return ICONS["generativa"]
    if "sugeridos" in lname:
        return ICONS["generativa"]
    return ICONS["predictiva"]

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
    return JsonResponse(cliente.resumen_json)

@csrf_exempt  # Para desarrollo. En producción, el frontend debe enviar el token CSRF.
def api_get_project_catalog(request):
    # if not request.user.is_authenticated or not request.user.is_staff:
    #     return JsonResponse({'error': 'No autorizado'}, status=401)
    try:
        catalogo = ProyectoCatalog.objects.latest('version')
        return JsonResponse(catalogo.datos_catalogo)
    except ProyectoCatalog.DoesNotExist:
        return JsonResponse({'error': 'Catalogo de proyectos no encontrado'}, status=404)

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
    cliente = get_object_or_404(Cliente, id=client_id)
    resumen_json = cliente.resumen_json or {}
    categoria = resumen_json.get("categoria_piloto", "Default")
    colors = get_category_colors(categoria)
    icon_svg = get_icon_for_objetivo(categoria)
    context = {
        "cliente": cliente,
        "resumen": resumen_json,
        "colors": colors,
        "category_icon": icon_svg,
    }
    html = render_to_string('pdf_template.html', context)
    result = io.BytesIO()
    pisa_status = pisa.CreatePDF(html, dest=result)
    if pisa_status.err:
        return HttpResponse('Error al generar PDF', status=500)
    response = HttpResponse(result.getvalue(), content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="reporte.pdf"'
    return response