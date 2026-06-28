from django.urls import path
from . import views

app_name = 'parqueadero'

urlpatterns = [
    path('', views.inicio, name='inicio'),
    path('entrada/', views.registrar_entrada, name='registrar_entrada'),
    path('salida/', views.registrar_salida, name='registrar_salida'),
    path('historial/', views.historial, name='historial'),
    path('vehiculos/', views.vehiculos, name='vehiculos'),
    path('vehiculos/<int:pk>/editar/', views.editar_vehiculo, name='editar_vehiculo'),
    path('registro/<int:pk>/', views.detalle_registro, name='detalle_registro'),
]
