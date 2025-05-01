from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

############################################################
# 🔗 REGISTRO DE ROUTERS PARA VIEWSETS
############################################################
router = DefaultRouter()
router.register(r'productos', ProductoViewSet)           # 📦 API para productos
router.register(r'usuarios', UsuarioViewSet)             # 👤 API para usuarios
router.register(r'direcciones', DireccionViewSet, basename='direccion')
router.register(r'pedidos', PedidoViewSet)               # 🛒 API para pedidos
router.register(r'post-equipo', PostEquipoViewSet, basename='post-equipo')
router.register(r'equipo', EquipoViewSet, basename='equipo')
router.register(r'juegos', JuegoViewSet)                 # 🕹 API para juegos
router.register(r'competiciones', CompeticionViewSet)    # 🏆 API para competiciones
router.register(r'equipos-participantes', EquipoParticipanteViewSet)
router.register(r'equipos-competitivos', EquipoCompetitivoViewSet)
router.register(r'partidos', PartidoViewSet)             # ⚔️ API para partidos
router.register(r'codigos-descuento', CodigoDescuentoViewSet)  # 🎟️ Descuentos
router.register(r'sponsors', SponsorViewSet)             # 🤝 Sponsors

############################################################
# 🌐 DEFINICIÓN DE RUTAS
############################################################
urlpatterns = [
    # 🔐 AUTENTICACIÓN Y USUARIOS
    path('api/login/', login_view, name='login_view'),  # 🔑 Inicio de sesión

    # 🔗 Incluye TODAS las rutas definidas en el router solo una vez
    path('api/', include(router.urls)),

    # 🛒 CARRITO DE COMPRAS (rutas específicas)
    path('api/carrito/', api_ver_carrito, name='api_ver_carrito'),
    path('api/carrito/agregar/<int:producto_id>/', api_agregar_al_carrito, name='api_agregar_al_carrito'),
    path('api/carrito/eliminar/<int:producto_id>/', api_eliminar_del_carrito, name='api_eliminar_del_carrito'),
    path('api/carrito/vaciar/', api_vaciar_carrito, name='api_vaciar_carrito'),

    # 🛍️ CHECKOUT Y PEDIDOS
    path('api/checkout/', checkout, name='checkout'),
    path('api/confirmar_pedido/', confirmar_pedido_view, name='confirmar_pedido'),
    path('api/mis-pedidos/', listar_mis_pedidos, name='listar_mis_pedidos'),

    # 🎟️ VERIFICACIÓN DE DESCUENTO
    path('api/verificar_descuento/', verificar_descuento, name='verificar_descuento'),
]

# Servir media en desarrollo
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
