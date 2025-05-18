# encoding: iso-8859-1 
from django.urls import path
from . import views

app_name = 'model'

urlpatterns = [
    path('', views.main_app_view, name='main_app_view'), # Para servir tu HTML
    path('api/login/', views.api_login, name='api_login'),
    path('api/clients/', views.api_get_clients, name='api_get_clients'),
    path('api/client/<int:client_id>/diagnostico/', views.api_get_client_diagnostico, name='api_get_client_diagnostico'),
    path('api/proyectos/catalog/', views.api_get_project_catalog, name='api_get_project_catalog'),
]