# 📌 Django Imports (Funciones y Autenticación)
from django.shortcuts import render, get_object_or_404, redirect  # Para renderizar plantillas y gestionar redirecciones
from django.contrib import messages  # Para mensajes en la interfaz
from django.contrib.auth.decorators import login_required, user_passes_test  # Decoradores para permisos de usuario
from django.contrib.auth import login, logout  # Funciones para manejar sesiones
from django.contrib.auth.models import User  # Modelo de usuario predeterminado de Django
from django.http import JsonResponse  # Para respuestas JSON en APIs
from django.contrib.auth import authenticate  # Para autenticación de usuarios

# 🔢 Utilidades
from decimal import Decimal  # Manejo de decimales (precios, descuentos, etc.)

# 🛠️ Django REST Framework Imports (API y Serializadores)
from rest_framework import viewsets, status  # Viewsets para CRUD y códigos de estado HTTP
from rest_framework.decorators import api_view  # Decorador para definir vistas API
from rest_framework.response import Response  # Para devolver respuestas JSON en API
from rest_framework.parsers import MultiPartParser, FormParser  # Para manejar archivos en peticiones
from rest_framework.permissions import IsAuthenticated, IsAdminUser, BasePermission


# 📂 Modelos, Formularios y Serializadores de la Aplicación
from .models import *  # Importar todos los modelos
from .forms import *  # Importar todos los formularios
from .serializers import *  # Importar todos los serializadores


############################################################
# 🔐 AUTENTICACIÓN Y GESTIÓN DE USUARIOS
############################################################

from django.contrib.auth import authenticate, login
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from .models import Usuario

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Endpoint para que un usuario inicie sesión.
    Se espera recibir en request.data:
    {
      "email": "usuario@example.com",
      "password": "contraseña"
    }
    Si las credenciales son correctas, se devuelve un token real.
    """
    email = request.data.get('email')
    password = request.data.get('password')

    print("DEBUG: email recibido =", email)
    print("DEBUG: password recibido =", password)

    if not email or not password:
        return Response({'error': 'Email y contraseña requeridos.'},
                        status=status.HTTP_400_BAD_REQUEST)

    # Autentica el usuario usando el email (USERNAME_FIELD es "email")
    user = authenticate(request, username=email, password=password)

    print("DEBUG: resultado de authenticate =", user)

    if user is not None:
        # Inicia la sesión (opcional)
        login(request, user)
        # Genera o recupera el token real
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'message': 'Login exitoso',
            'token': token.key,
            'user_id': user.id
        }, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Credenciales incorrectas.'},
                        status=status.HTTP_400_BAD_REQUEST)

############################################################
# 👤 API DE USUARIOS
############################################################

from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import viewsets
from .models import Usuario
from .serializers import UsuarioSerializer

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

    def get_queryset(self):
        # Si no eres superusuario, solo te devuelvo tu propio usuario
        if not self.request.user.is_staff:
            return Usuario.objects.filter(pk=self.request.user.pk)
        return super().get_queryset()

    def retrieve(self, request, *args, **kwargs):
        print("DEBUG => Entrando a retrieve de UsuarioViewSet")
        print("DEBUG => request.user.pk:", request.user.pk)
        print("DEBUG => kwargs['pk']:", kwargs['pk'])

        if not request.user.is_staff:
            print("DEBUG => user is NOT staff")
            if int(kwargs['pk']) != request.user.pk:
                print("DEBUG => pk distinto. Devuelvo 403")
                return Response({"error": "No puedes ver a otro usuario"}, status=403)
        else:
            print("DEBUG => user IS staff")

        return super().retrieve(request, *args, **kwargs)
    
    def get_permissions(self):
        print("DEBUG => Entrando a get_permissions de UsuarioViewSet")
        # Permitir el registro (acción 'create') sin autenticación
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]

from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, viewsets
from .models import Direccion
from .serializers import DireccionSerializer
from rest_framework.authtoken.models import Token

from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from .models import Direccion
from .serializers import DireccionSerializer

class DireccionViewSet(viewsets.ModelViewSet):
    serializer_class = DireccionSerializer
    permission_classes = [IsAuthenticated]  
    authentication_classes = [TokenAuthentication]  

    def get_queryset(self):
        """
        Filtra las direcciones solo del usuario autenticado.
        """
        user = self.request.user
        print("🛠 Usuario autenticado en la request:", user)
        print("🔑 Token recibido:", self.request.headers.get('Authorization'))

        if not isinstance(user, Usuario):  
            print("❌ No se pudo autenticar el usuario.")
            return Direccion.objects.none()
        
        return Direccion.objects.filter(usuario=user)

    def create(self, request, *args, **kwargs):
        """
        Crear una nueva dirección asociada al usuario autenticado.
        """
        user = request.user
        print("🚀 Intentando crear dirección para usuario:", user)

        if not isinstance(user, Usuario):
            print("❌ Error: Usuario no autenticado.")
            return Response({"error": "Usuario no autenticado"}, status=status.HTTP_401_UNAUTHORIZED)

        request.data['usuario'] = user.id
        return super().create(request, *args, **kwargs)

    def perform_update(self, serializer):
        """
        Si una dirección se marca como activa, desactiva las demás del usuario.
        """
        instance = serializer.save()
        if instance.activa:
            Direccion.objects.filter(usuario=instance.usuario).exclude(pk=instance.pk).update(activa=False)

    # ✅ Nueva acción para obtener la dirección activa sin autenticación
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def activa(self, request):
        """
        Retorna la dirección activa de cualquier usuario.
        """
        direccion_activa = Direccion.objects.filter(activa=True).first()
        
        if direccion_activa:
            serializer = self.get_serializer(direccion_activa)
            return Response(serializer.data, status=200)

        return Response({"error": "No hay dirección activa"}, status=404)



from django.contrib.auth import authenticate, login
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from suzaku.models import Usuario

@api_view(['POST'])
@permission_classes([AllowAny])
def crear_usuario(request):
    try:
        nombre = request.data.get('nombre')
        apellidos = request.data.get('apellidos')
        email = request.data.get('email')
        password = request.data.get('password')
        direccion = request.data.get('direccion')
        foto = request.FILES.get('foto')

        usuario = Usuario.objects.create_user(
            email=email, 
            password=password,  # Esto debe pasar por set_password
            nombre=nombre, 
            apellidos=apellidos,
            direccion=direccion,
            foto=foto
        )

        print("DEBUG Contraseña en la DB:", usuario.password)
        # Debe verse algo tipo 'pbkdf2_sha256$260000$...'

        return Response({"message": "Usuario creado correctamente"}, status=201)
    except Exception as e:
        return Response({"error": str(e)}, status=400)



############################################################
# 🛒 CHECKOUT Y PROCESO DE PEDIDOS
############################################################

@api_view(['POST'])
def checkout(request):
    user = request.user
    data = request.data

    productos = data['productos']
    descuento_aplicado = data['descuento_aplicado']

    # O bien: data.get('direccion_envio', '') para que no reviente si no llega
    direccion_envio = data.get('direccion_envio', '').strip()

    # 1. Si el frontend no envía una dirección explícita,
    #    se usa la dirección activa
    if not direccion_envio:
        dir_activa = Direccion.objects.filter(usuario=user, activa=True).first()
        if not dir_activa:
            return Response({'error': 'No hay dirección activa ni se proporcionó otra dirección'}, status=400)
        direccion_envio = dir_activa.direccion

    # 2. Calcular total
    total = sum([p['precio'] * p['cantidad'] for p in productos])
    total_con_descuento = total * (1 - (descuento_aplicado / 100))

    # 3. Crear pedido
    pedido = Pedido.objects.create(
        usuario=user,
        direccion_envio=direccion_envio,
        total=total,
        total_con_descuento=total_con_descuento,
        descuento_aplicado=descuento_aplicado
    )

    # 4. Crear los ProductoPedido
    for prod in productos:
        producto = Producto.objects.get(id=prod['producto_id'])
        ProductoPedido.objects.create(
            pedido=pedido,
            producto=producto,
            cantidad=prod['cantidad'],
            precio=prod['precio']
        )

    return Response({'mensaje': 'Pedido procesado con éxito', 'pedido_id': pedido.id})


############################################################
# ✅ CONFIRMACIÓN DE PEDIDOS Y GESTIÓN DE PEDIDOS
############################################################
from decimal import Decimal
from django.http import JsonResponse
from rest_framework.decorators import api_view
from .models import Usuario, Pedido, Producto, ProductoPedido, CodigoDescuento

from decimal import Decimal
from django.http import JsonResponse
from rest_framework.decorators import api_view
from .models import Usuario, Pedido, Producto, ProductoPedido, CodigoDescuento

from decimal import Decimal
from django.http import JsonResponse
from rest_framework.decorators import api_view
from .models import Usuario, Pedido, Producto, ProductoPedido, CodigoDescuento

from decimal import Decimal
from django.http import JsonResponse
from rest_framework.decorators import api_view
from .models import Usuario, Pedido, Producto, ProductoPedido, CodigoDescuento

@api_view(['POST'])
def confirmar_pedido_view(request):
    """
    Confirma un pedido y lo guarda en la base de datos.
    Espera en request.data:
    {
      "user_id": 1,
      "items": [{"id": 12, "cantidad": 1}, ...],
      "direccion": "Nueva dirección ...",
      "descuento": 0.00,           // Opcional
      "codigo_descuento": "szkfumo"  // Opcional, código de descuento (cadena)
    }
    """
    user_id = request.data.get('user_id')
    items = request.data.get('items', [])
    direccion = request.data.get('direccion')
    descuento = request.data.get('descuento', 0)
    codigo_descuento_str = request.data.get('codigo_descuento')

    if not user_id or not items:
        return JsonResponse({"error": "Faltan user_id o items"}, status=400)

    try:
        user = Usuario.objects.get(id=user_id)
    except Usuario.DoesNotExist:
        return JsonResponse({"error": "Usuario no existe"}, status=404)

    # Procesar el código de descuento recibido (si existe)
    codigo_descuento_obj = None
    if codigo_descuento_str:
        codigo_descuento_str = codigo_descuento_str.strip()
        print("Código descuento recibido:", codigo_descuento_str)
        try:
            codigo_descuento_obj = CodigoDescuento.objects.get(codigo=codigo_descuento_str)
            print("Código descuento encontrado:", codigo_descuento_obj.codigo)
        except CodigoDescuento.DoesNotExist:
            print("No se encontró un código de descuento para:", codigo_descuento_str)
            codigo_descuento_obj = None

    # Crear el pedido asignando la instancia de descuento (si existe)
    pedido = Pedido.objects.create(
        usuario=user,
        direccion_envio=direccion,
        total=Decimal('0.00'),
        total_con_descuento=Decimal('0.00'),
        descuento_aplicado=Decimal(descuento),
        codigo_descuento=codigo_descuento_obj
    )

    total_calculado = Decimal('0.00')
    for item in items:
        producto_id = item.get('id')
        cantidad = item.get('cantidad', 1)
        try:
            prod = Producto.objects.get(id=producto_id)
        except Producto.DoesNotExist:
            return JsonResponse({"error": f"Producto {producto_id} no encontrado"}, status=404)

        subtotal = prod.precio * cantidad
        total_calculado += subtotal

        ProductoPedido.objects.create(
            pedido=pedido,
            producto=prod,
            cantidad=cantidad,
            precio=prod.precio
        )

        #if prod.stock >= cantidad:
        #    prod.stock -= cantidad
        #    prod.save()
        #else:
        #    return JsonResponse({"error": f"Stock insuficiente para {prod.nombre}"}, status=400)

    pedido.total = total_calculado
    pedido.total_con_descuento = total_calculado - Decimal(descuento)
    if pedido.total_con_descuento < 0:
        pedido.total_con_descuento = Decimal('0.00')
    
    pedido.save()
    pedido.refresh_from_db()  # Asegurarse de que el pedido tenga los datos actualizados

    print("Pedido final - código descuento:", pedido.codigo_descuento)  # Debería mostrar la instancia o None

    return JsonResponse({
        "message": "Pedido creado con éxito",
        "pedido_id": pedido.id,
        "total": float(pedido.total),
        "total_con_descuento": float(pedido.total_con_descuento),
    }, status=201)



############################################################
# 📜 LISTAR PEDIDOS DEL USUARIO
############################################################

@api_view(['GET'])
def listar_mis_pedidos(request):
    usuario_id = request.query_params.get('usuario')
    if not usuario_id:
        return Response({"error": "Falta el usuario_id"}, status=400)

    try:
        usuario = Usuario.objects.get(id=usuario_id)
    except Usuario.DoesNotExist:
        return Response({"error": "Usuario no encontrado"}, status=404)

    pedidos = Pedido.objects.filter(usuario=usuario)
    serializer = PedidoSerializer(pedidos, many=True)
    return Response(serializer.data)

############################################################
# 🎟️ GESTIÓN DE CÓDIGOS DE DESCUENTO
############################################################

@api_view(['GET'])
def verificar_descuento(request):
    """
    🎟️ Verifica un código de descuento y devuelve su porcentaje.

    📌 Recibe en request.GET:
        ?codigo=<codigo_descuento>
    
    ✅ Retorna el porcentaje de descuento si el código es válido.
    """
    codigo = request.GET.get('codigo', None)
    
    if codigo:
        try:
            descuento = CodigoDescuento.objects.get(codigo=codigo)
            return Response({'porcentaje_descuento': descuento.porcentaje})
        except CodigoDescuento.DoesNotExist:
            return Response({'error': 'Código de descuento no válido'}, status=400)

    return Response({'error': 'Falta el código de descuento'}, status=400)

############################################################
# 📦 GESTIÓN DE PRODUCTOS (API)
############################################################

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [AllowAny]  # ✅ esto permite acceso sin login


class StockViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer

############################################################
# 🎟️ VERIFICACIÓN DE CÓDIGOS DE DESCUENTO
############################################################


class CodigoDescuentoViewSet(viewsets.ModelViewSet):
    queryset = CodigoDescuento.objects.all()
    serializer_class = CodigoDescuentoSerializer
    permission_classes = [IsAuthenticated]  # Cambia por permiso personalizado si solo quieres admin


def verificar_descuento(request):
    """
    🎟️ Verifica un código de descuento y devuelve su porcentaje.

    📌 Recibe en request.GET:
        ?codigo=<codigo_descuento>

    ✅ Retorna el porcentaje de descuento si el código es válido.
    """
    codigo = request.GET.get('codigo')  # 🏷️ Obtener código de la URL

    if not codigo:
        return JsonResponse({'error': 'Falta el código de descuento'}, status=400)

    try:
        descuento = CodigoDescuento.objects.get(codigo=codigo)
        return JsonResponse({'porcentaje_descuento': descuento.porcentaje})
    except CodigoDescuento.DoesNotExist:
        return JsonResponse({'error': 'Código de descuento no válido'}, status=404)


############################################################
# 🛒 GESTIÓN DEL CARRITO DE COMPRAS (API)
############################################################

@api_view(['GET'])
def api_ver_carrito(request):
    """
    🛒 Obtiene el contenido del carrito del usuario.

    ✅ Retorna los productos en el carrito y el total a pagar.
    """
    carrito = request.session.get('carrito', {})
    productos = []
    total = 0

    for producto_id, cantidad in carrito.items():
        producto = Producto.objects.get(id=producto_id)
        subtotal = float(producto.precio) * cantidad
        total += subtotal
        productos.append({
            "id": producto.id,
            "nombre": producto.nombre,
            "precio": float(producto.precio),
            "cantidad": cantidad,
            "subtotal": subtotal
        })

    return Response({"productos": productos, "total": total}, status=status.HTTP_200_OK)


@api_view(['POST'])
def api_agregar_al_carrito(request, producto_id):
    """
    ➕ Agrega un producto al carrito.

    📌 Recibe el ID del producto en la URL.

    ✅ Retorna un mensaje de confirmación.
    """
    carrito = request.session.get('carrito', {})
    producto = Producto.objects.get(id=producto_id)

    if str(producto_id) in carrito:
        carrito[str(producto_id)] += 1
    else:
        carrito[str(producto_id)] = 1

    request.session['carrito'] = carrito
    return Response({"mensaje": "Producto agregado al carrito"}, status=status.HTTP_200_OK)


@api_view(['DELETE'])
def api_eliminar_del_carrito(request, producto_id):
    """
    ❌ Elimina un producto del carrito.

    📌 Recibe el ID del producto en la URL.

    ✅ Retorna un mensaje de confirmación.
    """
    carrito = request.session.get('carrito', {})

    if str(producto_id) in carrito:
        del carrito[str(producto_id)]
        request.session['carrito'] = carrito
        return Response({"mensaje": "Producto eliminado del carrito"}, status=status.HTTP_200_OK)

    return Response({"error": "Producto no encontrado en el carrito"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def api_vaciar_carrito(request):
    """
    🗑️ Vacía completamente el carrito de compras.

    ✅ Retorna un mensaje de confirmación.
    """
    request.session['carrito'] = {}
    return Response({"mensaje": "Carrito vaciado"}, status=status.HTTP_200_OK)

############################################################
# SOBRE NOSOTROS
############################################################

class PostEquipoViewSet(viewsets.ModelViewSet):
    queryset = PostEquipo.objects.all().order_by('orden')
    serializer_class = PostEquipoSerializer

class EquipoViewSet(viewsets.ModelViewSet):
    queryset = Equipo.objects.all()
    serializer_class = EquipoSerializer

class JuegoViewSet(viewsets.ModelViewSet):
    queryset = Juego.objects.all()
    serializer_class = JuegoSerializer


class CompeticionViewSet(viewsets.ModelViewSet):
    queryset = Competicion.objects.all()
    serializer_class = CompeticionSerializer

class EquipoCompetitivoViewSet(viewsets.ModelViewSet):
    queryset = EquipoCompetitivo.objects.all()
    serializer_class = EquipoCompetitivoSerializer


class EquipoParticipanteViewSet(viewsets.ModelViewSet):
    queryset = EquipoParticipante.objects.all()
    serializer_class = EquipoParticipanteSerializer


from rest_framework import status
from rest_framework.response import Response

class PartidoViewSet(viewsets.ModelViewSet):
    queryset = Partido.objects.all()
    serializer_class = PartidoSerializer

    def update(self, request, *args, **kwargs):
        instance: Partido = self.get_object()

        # Guardamos una copia del estado original antes de actualizar
        original = Partido.objects.get(pk=instance.pk)

        response = super().update(request, *args, **kwargs)

        # Ya actualizado, aplicamos lógica para restar/sumar estadísticas
        self.actualizar_estadisticas(self.get_object(), original)

        return response

    def perform_create(self, serializer):
        partido = serializer.save()
        self.actualizar_estadisticas(partido)

    def actualizar_estadisticas(self, partido: Partido, original: Partido = None):
        def ajustar_stats(equipo: EquipoParticipante, delta_puntos=0, delta_v=0, delta_d=0):
            equipo.puntos = max(0, equipo.puntos + delta_puntos)
            equipo.victorias = max(0, equipo.victorias + delta_v)
            equipo.derrotas = max(0, equipo.derrotas + delta_d)
            equipo.save()

        if original:
            # Revertimos el efecto anterior si estaba finalizado
            if original.estado == 'finalizado':
                if original.marcador_equipo1 > original.marcador_equipo2:
                    ajustar_stats(original.equipo1, delta_puntos=-3, delta_v=-1)
                    ajustar_stats(original.equipo2, delta_d=-1)
                elif original.marcador_equipo2 > original.marcador_equipo1:
                    ajustar_stats(original.equipo2, delta_puntos=-3, delta_v=-1)
                    ajustar_stats(original.equipo1, delta_d=-1)

        # Aplicamos el nuevo resultado
        if partido.estado == 'finalizado':
            if partido.marcador_equipo1 > partido.marcador_equipo2:
                ajustar_stats(partido.equipo1, delta_puntos=3, delta_v=1)
                ajustar_stats(partido.equipo2, delta_d=1)
            elif partido.marcador_equipo2 > partido.marcador_equipo1:
                ajustar_stats(partido.equipo2, delta_puntos=3, delta_v=1)
                ajustar_stats(partido.equipo1, delta_d=1)


############################################################
# 🔐 SPONSORS
############################################################

# 🧾 ViewSet para Sponsors
class SponsorViewSet(viewsets.ModelViewSet):
    queryset = Sponsor.objects.all().order_by('-creado_en')  # Puedes ajustar orden si lo deseas
    serializer_class = SponsorSerializer

# 🖼️ ViewSet para las imágenes de producto asociadas a un Sponsor
class SponsorImageViewSet(viewsets.ModelViewSet):
    queryset = SponsorImage.objects.all()
    serializer_class = SponsorImageSerializer

############################################################
# 🔐 CRUD PRODUCTOS (Solo Administradores)
############################################################


# 🛠️ Función para verificar si el usuario es administrador
def es_admin(user):
    return user.is_authenticated and user.is_staff

@user_passes_test(es_admin, login_url='index')
def admin_panel(request):
    return render(request, 'suzaku/admin.html')

@user_passes_test(es_admin, login_url='index')
def crear_producto(request):
    """
    🆕 Permite a los administradores crear nuevos productos.

    ✅ Retorna una página de formulario o procesa la creación del producto.
    """
    if request.method == 'POST':
        form = ProductoForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            messages.success(request, 'Producto creado exitosamente')
            return redirect('lista_productos')
    else:
        form = ProductoForm()

    return render(request, 'suzaku/crear_producto.html', {'form': form})


@user_passes_test(es_admin, login_url='index')
def editar_producto(request, id):
    """
    ✏️ Permite a los administradores editar productos existentes.

    ✅ Retorna una página de formulario o procesa la edición del producto.
    """
    producto = get_object_or_404(Producto, id=id)

    if request.method == 'POST':
        form = ProductoForm(request.POST, instance=producto)
        if form.is_valid():
            form.save()
            messages.success(request, 'Producto actualizado correctamente')
            return redirect('lista_productos')
    else:
        form = ProductoForm(instance=producto)

    return render(request, 'suzaku/editar_producto.html', {'form': form})


@user_passes_test(es_admin, login_url='index')
def eliminar_producto(request, id):
    """
    ❌ Permite a los administradores eliminar productos.

    ✅ Retorna una página de confirmación antes de eliminar el producto.
    """
    producto = get_object_or_404(Producto, id=id)

    if request.method == 'POST':
        producto.delete()
        messages.success(request, 'Producto eliminado con éxito')
        return redirect('lista_productos')

    return render(request, 'suzaku/eliminar_producto.html', {'producto': producto})

@user_passes_test(es_admin, login_url='index')
def lista_productos(request):
    productos = Producto.objects.all()
    return render(request, 'suzaku/lista_productos.html', {'productos': productos})


class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer


# Vistas tipo ViewSet para cada modelo

class ProductoTipoViewSet(viewsets.ModelViewSet):
    queryset = ProductoTipo.objects.all()
    serializer_class = ProductoTipoSerializer

class ColorViewSet(viewsets.ModelViewSet):
    queryset = Color.objects.all()
    serializer_class = ColorSerializer

class TallaViewSet(viewsets.ModelViewSet):
    queryset = Talla.objects.all()
    serializer_class = TallaSerializer

class CategoriaProductoViewSet(viewsets.ModelViewSet):
    queryset = CategoriaProducto.objects.all()
    serializer_class = CategoriaProductoSerializer

class ProductoImagenViewSet(viewsets.ModelViewSet):
    queryset = ProductoImagen.objects.all()
    serializer_class = ProductoImagenSerializer

class StockViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer

class ValoracionViewSet(viewsets.ModelViewSet):
    queryset = Valoracion.objects.all()
    serializer_class = ValoracionSerializer