# encoding: iso-8859-1 
from django.db import models
from django.contrib.auth.models import User

class ProyectoCatalog(models.Model):
    nombre_catalogo = models.CharField(max_length=200, default="Catalogo Principal de Pilotos IA")
    datos_catalogo = models.JSONField()
    version = models.PositiveIntegerField(default=1, unique=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nombre_catalogo} (v{self.version})"
    class Meta:
        ordering = ['-version']

class Cliente(models.Model):
    nombre_cliente = models.CharField(max_length=255, unique=True)
    diagnostico_json = models.JSONField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nombre_cliente