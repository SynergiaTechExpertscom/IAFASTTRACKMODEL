# encoding: iso-8859-1 
from django.contrib import admin
from .models import ProyectoCatalog, Cliente, OpenAIConfig


@admin.register(ProyectoCatalog)
class ProyectoCatalogAdmin(admin.ModelAdmin):
    list_display = ("nombre_catalogo", "version", "fecha_actualizacion")
    ordering = ("-version",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.only("id", "nombre_catalogo", "version", "fecha_actualizacion")


admin.site.register(Cliente)
admin.site.register(OpenAIConfig)
