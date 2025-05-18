# encoding: iso-8859-1 
from django.contrib import admin
from .models import ProyectoCatalog, Cliente

admin.site.register(ProyectoCatalog)
admin.site.register(Cliente)