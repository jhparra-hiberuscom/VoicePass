from django.contrib import admin
from .models import Vehiculo, RegistroParqueadero


@admin.register(Vehiculo)
class VehiculoAdmin(admin.ModelAdmin):
    list_display = ['placa', 'tipo', 'propietario', 'esta_en_parqueadero', 'creado_en']
    list_filter = ['tipo']
    search_fields = ['placa', 'propietario']
    ordering = ['placa']


@admin.register(RegistroParqueadero)
class RegistroParqueaderoAdmin(admin.ModelAdmin):
    list_display = [
        'vehiculo', 'hora_entrada', 'hora_salida', 'puesto', 'estado', 'registrado_por'
    ]
    list_filter = ['estado', 'hora_entrada']
    search_fields = ['vehiculo__placa', 'vehiculo__propietario', 'registrado_por']
    ordering = ['-hora_entrada']
    date_hierarchy = 'hora_entrada'
    readonly_fields = ['hora_entrada']
