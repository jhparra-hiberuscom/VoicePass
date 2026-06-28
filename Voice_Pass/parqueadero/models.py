from django.db import models
from django.utils import timezone


class TipoVehiculo(models.TextChoices):
    CARRO = 'CARRO', 'Carro'
    MOTO = 'MOTO', 'Motocicleta'
    CAMION = 'CAMION', 'Camión'
    BICICLETA = 'BICICLETA', 'Bicicleta'
    OTRO = 'OTRO', 'Otro'


class Vehiculo(models.Model):
    placa = models.CharField(max_length=10, unique=True, verbose_name='Placa')
    tipo = models.CharField(
        max_length=20,
        choices=TipoVehiculo.choices,
        default=TipoVehiculo.CARRO,
        verbose_name='Tipo de Vehículo',
    )
    propietario = models.CharField(max_length=150, blank=True, verbose_name='Propietario')
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Vehículo'
        verbose_name_plural = 'Vehículos'
        ordering = ['placa']

    def __str__(self):
        return f'{self.placa} ({self.get_tipo_display()})'

    @property
    def esta_en_parqueadero(self):
        return self.registros.filter(hora_salida__isnull=True).exists()


class EstadoRegistro(models.TextChoices):
    ACTIVO = 'ACTIVO', 'En parqueadero'
    FINALIZADO = 'FINALIZADO', 'Salió'


class RegistroParqueadero(models.Model):
    vehiculo = models.ForeignKey(
        Vehiculo,
        on_delete=models.CASCADE,
        related_name='registros',
        verbose_name='Vehículo',
    )
    hora_entrada = models.DateTimeField(default=timezone.now, verbose_name='Hora de Entrada')
    hora_salida = models.DateTimeField(null=True, blank=True, verbose_name='Hora de Salida')
    puesto = models.CharField(max_length=10, blank=True, verbose_name='Puesto')
    observaciones = models.TextField(blank=True, verbose_name='Observaciones')
    estado = models.CharField(
        max_length=15,
        choices=EstadoRegistro.choices,
        default=EstadoRegistro.ACTIVO,
        verbose_name='Estado',
    )
    registrado_por = models.CharField(max_length=150, blank=True, verbose_name='Registrado por')

    class Meta:
        verbose_name = 'Registro de Parqueadero'
        verbose_name_plural = 'Registros de Parqueadero'
        ordering = ['-hora_entrada']

    def __str__(self):
        return f'{self.vehiculo.placa} - {self.hora_entrada.strftime("%d/%m/%Y %H:%M")}'

    @property
    def duracion(self):
        fin = self.hora_salida or timezone.now()
        delta = fin - self.hora_entrada
        horas, rem = divmod(int(delta.total_seconds()), 3600)
        minutos = rem // 60
        return f'{horas}h {minutos:02d}m'

    def registrar_salida(self):
        self.hora_salida = timezone.now()
        self.estado = EstadoRegistro.FINALIZADO
        self.save()
