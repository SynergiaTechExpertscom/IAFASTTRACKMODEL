# encoding: iso-8859-1 
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

@ensure_csrf_cookie # Para que Django envíe el cookie CSRF en la primera petición GET si es necesario
def main_app_view(request):
    """
    Sirve el archivo HTML principal.
    """
    return render(request, 'ia_fast_track_model.html')

@csrf_exempt # Para desarrollo. En producción, el frontend debe enviar el token CSRF.
def api_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'message': 'JSON invalido'}, status=400)

        user = authenticate(request, username=username, password=password)
        if user is not None and user.is_staff: # Asumimos que solo usuarios 'staff' pueden loguearse
            django_auth_login(request, user)
            return JsonResponse({'success': True, 'message': 'Login exitoso'})
        else:
            return JsonResponse({'success': False, 'message': 'Credenciales incorrectas o usuario no autorizado'}, status=401)
    return JsonResponse({'error': 'Metodo POST requerido'}, status=405)

    return JsonResponse(cliente.resumen_json, safe=False)
def api_get_clients(request):
    # Aquí deberías añadir autenticación si es necesario
    # if not request.user.is_authenticated or not request.user.is_staff:
    #     return JsonResponse({'error': 'No autorizado'}, status=401)
    clientes = Cliente.objects.all().order_by('nombre_cliente')
    data = [{"id": cliente.id, "name": cliente.nombre_cliente} for cliente in clientes]
    return JsonResponse(data, safe=False)

@csrf_exempt # Para desarrollo. En producción, el frontend debe enviar el token CSRF.
def api_get_client_diagnostico(request, client_id):
    # if not request.user.is_authenticated or not request.user.is_staff:
    #     return JsonResponse({'error': 'No autorizado'}, status=401)
    cliente = get_object_or_404(Cliente, id=client_id)
    return JsonResponse(cliente.diagnostico_json)

@csrf_exempt # Para desarrollo. En producción, el frontend debe enviar el token CSRF.
def api_get_client_resume(request, client_id):
    # if not request.user.is_authenticated or not request.user.is_staff:
    #     return JsonResponse({'error': 'No autorizado'}, status=401)
    cliente = get_object_or_404(Cliente, id=client_id)
    return JsonResponse(cliente.resumen_json)

@csrf_exempt # Para desarrollo. En producción, el frontend debe enviar el token CSRF.
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
        except Exception:
def descargar_pdf(request, client_id):
    cliente = get_object_or_404(Cliente, id=client_id)
    resumen_json = cliente.resumen_json or {}
    context = {"cliente": cliente, "resumen": resumen_json}
    html = render_to_string("pdf_template.html", context)
        return HttpResponse("Error al generar PDF", status=500)
    response = HttpResponse(result.getvalue(), content_type="application/pdf")
    response["Content-Disposition"] = 'attachment; filename="reporte.pdf"'
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

def descargar_pdf(request):
    # Renderiza la plantilla a HTML
    html = render_to_string('pdf_template.html', {})  # Crea pdf_template.html si no existe
    result = io.BytesIO()
    # Convierte HTML a PDF
    pisa_status = pisa.CreatePDF(html, dest=result)
    if pisa_status.err:
        return HttpResponse('Error al generar PDF', status=500)
    # Devuelve el PDF como respuesta
    response = HttpResponse(result.getvalue(), content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="reporte.pdf"'
    return response