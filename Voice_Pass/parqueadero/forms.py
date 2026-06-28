from django import forms
from .models import Vehiculo, RegistroParqueadero


class VehiculoForm(forms.ModelForm):
    class Meta:
        model = Vehiculo
        fields = ['placa', 'tipo', 'propietario']
        widgets = {
            'placa': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ej: ABC123',
                'style': 'text-transform:uppercase',
            }),
            'tipo': forms.Select(attrs={'class': 'form-select'}),
            'propietario': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Nombre del propietario',
            }),
        }

    def clean_placa(self):
        return self.cleaned_data['placa'].upper().strip()


class EntradaVehiculoForm(forms.ModelForm):
    placa = forms.CharField(
        max_length=10,
        label='Placa del vehículo',
        widget=forms.TextInput(attrs={
            'class': 'form-control form-control-lg',
            'placeholder': 'Ej: ABC123',
            'style': 'text-transform:uppercase',
            'autofocus': True,
        }),
    )

    class Meta:
        model = RegistroParqueadero
        fields = ['puesto', 'observaciones', 'registrado_por']
        widgets = {
            'puesto': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ej: A-01',
            }),
            'observaciones': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Observaciones opcionales',
            }),
            'registrado_por': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Nombre del operador',
            }),
        }

    def clean_placa(self):
        return self.cleaned_data['placa'].upper().strip()


class SalidaVehiculoForm(forms.Form):
    placa = forms.CharField(
        max_length=10,
        label='Placa del vehículo',
        widget=forms.TextInput(attrs={
            'class': 'form-control form-control-lg',
            'placeholder': 'Ej: ABC123',
            'style': 'text-transform:uppercase',
            'autofocus': True,
        }),
    )

    def clean_placa(self):
        return self.cleaned_data['placa'].upper().strip()


class BusquedaForm(forms.Form):
    q = forms.CharField(
        max_length=50,
        required=False,
        label='Buscar',
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Buscar por placa o propietario...',
        }),
    )
