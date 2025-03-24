from django.contrib import admin
from .models import *

admin.site.register(Producto)
admin.site.register(Carrito)
admin.site.register(Pedido)
admin.site.register(ProductoPedido)
admin.site.register(CodigoDescuento)
admin.site.register(Usuario)

