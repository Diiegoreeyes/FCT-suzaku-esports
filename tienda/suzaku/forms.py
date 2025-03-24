from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Producto,Usuario


############################################################
# CREAR USUARIO
############################################################

class UsuarioForm(forms.ModelForm):
    password1 = forms.CharField(widget=forms.PasswordInput)
    password2 = forms.CharField(widget=forms.PasswordInput)

    class Meta:
        model = Usuario
        fields = '__all__'

    def clean_password2(self):
        password1 = self.cleaned_data.get('password1')
        password2 = self.cleaned_data.get('password2')
        if password1 != password2:
            raise forms.ValidationError("Las contraseñas no coinciden.")
        return password2

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user
    

############################################################
# FORMULARIO PARA PRODUCTOS
############################################################

class ProductoForm(forms.ModelForm):
    """ Formulario para la creación y edición de productos """
    
    class Meta:
        model = Producto
        fields = ['nombre', 'descripcion', 'precio', 'stock']

############################################################
# FORMULARIO DE REGISTRO DE USUARIOS
############################################################

class RegistroForm(UserCreationForm):
    """ Formulario de registro de usuarios con campo de email obligatorio """
    
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']

