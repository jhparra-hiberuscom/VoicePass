from django.test import TestCase, Client
from django.urls import reverse
from django.utils import timezone

from .models import Vehiculo, RegistroParqueadero, EstadoRegistro, TipoVehiculo


class VehiculoModelTest(TestCase):
    def setUp(self):
        self.vehiculo = Vehiculo.objects.create(
            placa='ABC123',
            tipo=TipoVehiculo.CARRO,
            propietario='Juan Pérez',
        )

    def test_str(self):
        self.assertIn('ABC123', str(self.vehiculo))

    def test_esta_en_parqueadero_false_por_defecto(self):
        self.assertFalse(self.vehiculo.esta_en_parqueadero)

    def test_esta_en_parqueadero_true_con_registro_activo(self):
        RegistroParqueadero.objects.create(
            vehiculo=self.vehiculo,
            estado=EstadoRegistro.ACTIVO,
        )
        self.assertTrue(self.vehiculo.esta_en_parqueadero)


class RegistroParqueaderoModelTest(TestCase):
    def setUp(self):
        self.vehiculo = Vehiculo.objects.create(placa='XYZ789', tipo=TipoVehiculo.MOTO)
        self.registro = RegistroParqueadero.objects.create(
            vehiculo=self.vehiculo,
            estado=EstadoRegistro.ACTIVO,
        )

    def test_str(self):
        self.assertIn('XYZ789', str(self.registro))

    def test_duracion_calculada(self):
        duracion = self.registro.duracion
        self.assertIn('h', duracion)
        self.assertIn('m', duracion)

    def test_registrar_salida(self):
        self.registro.registrar_salida()
        self.assertEqual(self.registro.estado, EstadoRegistro.FINALIZADO)
        self.assertIsNotNone(self.registro.hora_salida)


class ParqueaderoViewsTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.vehiculo = Vehiculo.objects.create(
            placa='TEST01',
            tipo=TipoVehiculo.CARRO,
            propietario='Operador Test',
        )

    def test_inicio_get(self):
        response = self.client.get(reverse('parqueadero:inicio'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Parqueadero')

    def test_registrar_entrada_get(self):
        response = self.client.get(reverse('parqueadero:registrar_entrada'))
        self.assertEqual(response.status_code, 200)

    def test_registrar_entrada_post_nueva_placa(self):
        response = self.client.post(
            reverse('parqueadero:registrar_entrada'),
            {'placa': 'NEW001', 'puesto': 'A-01', 'registrado_por': 'Op', 'observaciones': ''},
        )
        self.assertRedirects(response, reverse('parqueadero:inicio'))
        self.assertTrue(
            RegistroParqueadero.objects.filter(vehiculo__placa='NEW001').exists()
        )

    def test_registrar_entrada_post_placa_ya_en_parqueadero(self):
        RegistroParqueadero.objects.create(
            vehiculo=self.vehiculo, estado=EstadoRegistro.ACTIVO
        )
        response = self.client.post(
            reverse('parqueadero:registrar_entrada'),
            {'placa': 'TEST01', 'puesto': '', 'registrado_por': '', 'observaciones': ''},
            follow=True,
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            RegistroParqueadero.objects.filter(
                vehiculo=self.vehiculo, estado=EstadoRegistro.ACTIVO
            ).count(),
            1,
        )

    def test_registrar_salida_get(self):
        response = self.client.get(reverse('parqueadero:registrar_salida'))
        self.assertEqual(response.status_code, 200)

    def test_registrar_salida_buscar_post(self):
        reg = RegistroParqueadero.objects.create(
            vehiculo=self.vehiculo, estado=EstadoRegistro.ACTIVO
        )
        response = self.client.post(
            reverse('parqueadero:registrar_salida'),
            {'accion': 'buscar', 'placa': 'TEST01'},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context['registro_encontrado'], reg)

    def test_registrar_salida_confirmar_post(self):
        reg = RegistroParqueadero.objects.create(
            vehiculo=self.vehiculo, estado=EstadoRegistro.ACTIVO
        )
        response = self.client.post(
            reverse('parqueadero:registrar_salida'),
            {'accion': 'confirmar_salida', 'placa': 'TEST01', 'registro_id': reg.pk},
        )
        self.assertRedirects(response, reverse('parqueadero:inicio'))
        reg.refresh_from_db()
        self.assertEqual(reg.estado, EstadoRegistro.FINALIZADO)

    def test_historial_get(self):
        response = self.client.get(reverse('parqueadero:historial'))
        self.assertEqual(response.status_code, 200)

    def test_historial_busqueda(self):
        RegistroParqueadero.objects.create(vehiculo=self.vehiculo)
        response = self.client.get(reverse('parqueadero:historial') + '?q=TEST01')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'TEST01')

    def test_vehiculos_get(self):
        response = self.client.get(reverse('parqueadero:vehiculos'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'TEST01')

    def test_editar_vehiculo_get(self):
        response = self.client.get(
            reverse('parqueadero:editar_vehiculo', args=[self.vehiculo.pk])
        )
        self.assertEqual(response.status_code, 200)

    def test_editar_vehiculo_post(self):
        response = self.client.post(
            reverse('parqueadero:editar_vehiculo', args=[self.vehiculo.pk]),
            {'placa': 'TEST01', 'tipo': TipoVehiculo.MOTO, 'propietario': 'Nuevo Nombre'},
        )
        self.assertRedirects(response, reverse('parqueadero:vehiculos'))
        self.vehiculo.refresh_from_db()
        self.assertEqual(self.vehiculo.propietario, 'Nuevo Nombre')

    def test_detalle_registro_get(self):
        reg = RegistroParqueadero.objects.create(vehiculo=self.vehiculo)
        response = self.client.get(
            reverse('parqueadero:detalle_registro', args=[reg.pk])
        )
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'TEST01')
