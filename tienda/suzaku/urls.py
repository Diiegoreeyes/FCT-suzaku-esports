from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

############################################################
# 🔗 REGISTRO DE ROUTERS PARA VIEWSETS
############################################################

router = DefaultRouter()
router.register(r'productos', ProductoViewSet)  # 📦 API para productos
router.register(r'usuarios', UsuarioViewSet)    # 👤 API para usuarios
router.register(r'direcciones', DireccionViewSet, basename='direccion')
router.register(r'pedidos', PedidoViewSet)  # 👈 Esto crea automáticamente /api/pedidos/<id>/
router.register(r'post-equipo', PostEquipoViewSet, basename='post-equipo')
router.register(r'equipo', EquipoViewSet, basename='equipo')

############################################################
# 🌐 DEFINICIÓN DE RUTAS
############################################################

urlpatterns = [
    # 🔐 AUTENTICACIÓN Y USUARIOS
    path('api/login/', login_view, name='login_view'),  # 🔑 Inicio de sesión
    path('api/', include(router.urls)),  # 🔗 Incluye las rutas del router para productos y usuarios
    path('api/', include(router.urls)),

    # 🛒 CARRITO DE COMPRAS
    path('api/carrito/', api_ver_carrito, name='api_ver_carrito'),
    path('api/carrito/agregar/<int:producto_id>/', api_agregar_al_carrito, name='api_agregar_al_carrito'),
    path('api/carrito/eliminar/<int:producto_id>/', api_eliminar_del_carrito, name='api_eliminar_del_carrito'),
    path('api/carrito/vaciar/', api_vaciar_carrito, name='api_vaciar_carrito'),

    # 🛍️ CHECKOUT Y PEDIDOS
    path('api/checkout/', checkout, name='checkout'),
    path('api/confirmar_pedido/', confirmar_pedido_view, name='confirmar_pedido'),
    path('api/mis-pedidos/', listar_mis_pedidos, name='listar_mis_pedidos'),

    # 🎟️ DESCUENTOS
    path('api/verificar_descuento/', verificar_descuento, name='verificar_descuento'),

    #POSTS 
    path('api/', include(router.urls)),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



