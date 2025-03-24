# suzaku/templatetags/custom_filters.py
from django import template

register = template.Library()

# Definir el filtro 'multiply'
@register.filter(name='multiply')
def multiply(value, arg):
    try:
        return value * arg
    except (TypeError, ValueError):
        return 0  # Si hay un error, retorna 0 como valor por defecto
