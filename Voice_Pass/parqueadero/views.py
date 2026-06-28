from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.db.models import Q
from django.utils import timezone

from .models import Vehiculo, RegistroParqueadero, EstadoRegistro
from .forms import EntradaVehiculoForm, SalidaVehiculoForm, BusquedaForm, VehiculoForm


def inicio(request):
    vehiculos_en_parqueadero = RegistroParqueadero.objects.filter(
        estado=EstadoRegistro.ACTIVO
    ).select_related('vehiculo').order_by('-hora_entrada')

    total_activos = vehiculos_en_parqueadero.count()
    total_hoy = RegistroParqueadero.objects.filter(
        hora_entrada__date=timezone.now().date()
    ).count()

    context = {
        'vehiculos_en_parqueadero': vehiculos_en_parqueadero,
        'total_activos': total_activos,
        'total_hoy': total_hoy,
    }
    return render(request, 'parqueadero/inicio.html', context)


def registrar_entrada(request):
    if request.method == 'POST':
        form = EntradaVehiculoForm(request.POST)
        if form.is_valid():
            placa = form.cleaned_data['placa']
            vehiculo, created = Vehiculo.objects.get_or_create(placa=placa)

            if RegistroParqueadero.objects.filter(
                vehiculo=vehiculo, estado=EstadoRegistro.ACTIVO
            ).exists():
                messages.warning(
                    request,
                    f'El vehículo con placa {placa} ya se encuentra en el parqueadero.'
                )
                return redirect('parqueadero:inicio')

            registro = form.save(commit=False)
            registro.vehiculo = vehiculo
            registro.save()

            messages.success(
                request,
                f'Entrada registrada para el vehículo {placa}.'
            )
            return redirect('parqueadero:inicio')
    else:
        form = EntradaVehiculoForm()

    return render(request, 'parqueadero/registrar_entrada.html', {'form': form})


def registrar_salida(request):
    registro_encontrado = None

    if request.method == 'POST':
        accion = request.POST.get('accion')
        placa = request.POST.get('placa', '').upper().strip()

        if accion == 'buscar' and placa:
            try:
                vehiculo = Vehiculo.objects.get(placa=placa)
                registro_encontrado = RegistroParqueadero.objects.filter(
                    vehiculo=vehiculo, estado=EstadoRegistro.ACTIVO
                ).first()
                if not registro_encontrado:
                    messages.warning(
                        request,
                        f'El vehículo {placa} no está registrado actualmente en el parqueadero.'
                    )
            except Vehiculo.DoesNotExist:
                messages.error(request, f'No se encontró el vehículo con placa {placa}.')

        elif accion == 'confirmar_salida':
            registro_id = request.POST.get('registro_id')
            registro = get_object_or_404(RegistroParqueadero, pk=registro_id)
            registro.registrar_salida()
            messages.success(
                request,
                f'Salida registrada para el vehículo {registro.vehiculo.placa}. '
                f'Tiempo en parqueadero: {registro.duracion}.'
            )
            return redirect('parqueadero:inicio')

    form = SalidaVehiculoForm(request.POST or None)
    return render(request, 'parqueadero/registrar_salida.html', {
        'form': form,
        'registro_encontrado': registro_encontrado,
    })


def historial(request):
    form = BusquedaForm(request.GET)
    registros = RegistroParqueadero.objects.select_related('vehiculo').order_by('-hora_entrada')

    if form.is_valid():
        q = form.cleaned_data.get('q')
        if q:
            registros = registros.filter(
                Q(vehiculo__placa__icontains=q) | Q(vehiculo__propietario__icontains=q)
            )

    return render(request, 'parqueadero/historial.html', {
        'registros': registros[:100],
        'form': form,
    })


def vehiculos(request):
    form = BusquedaForm(request.GET)
    lista = Vehiculo.objects.order_by('placa')

    if form.is_valid():
        q = form.cleaned_data.get('q')
        if q:
            lista = lista.filter(
                Q(placa__icontains=q) | Q(propietario__icontains=q)
            )

    return render(request, 'parqueadero/vehiculos.html', {
        'vehiculos': lista,
        'form': form,
    })


def editar_vehiculo(request, pk):
    vehiculo = get_object_or_404(Vehiculo, pk=pk)
    if request.method == 'POST':
        form = VehiculoForm(request.POST, instance=vehiculo)
        if form.is_valid():
            form.save()
            messages.success(request, f'Vehículo {vehiculo.placa} actualizado correctamente.')
            return redirect('parqueadero:vehiculos')
    else:
        form = VehiculoForm(instance=vehiculo)

    return render(request, 'parqueadero/editar_vehiculo.html', {
        'form': form,
        'vehiculo': vehiculo,
    })


def detalle_registro(request, pk):
    registro = get_object_or_404(
        RegistroParqueadero.objects.select_related('vehiculo'), pk=pk
    )
    return render(request, 'parqueadero/detalle_registro.html', {'registro': registro})
