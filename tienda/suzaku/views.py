# IA
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.response import Response
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


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




from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import status

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def cambiar_password_view(request):
    user = request.user
    password_actual = request.data.get('passwordActual')
    nueva_password = request.data.get('nuevaPassword')
    confirmar_password = request.data.get('confirmarPassword')

    if not user.check_password(password_actual):
        return Response({"error": "La contraseña actual no es correcta."}, status=status.HTTP_400_BAD_REQUEST)

    if nueva_password != confirmar_password:
        return Response({"error": "Las nuevas contraseñas no coinciden."}, status=status.HTTP_400_BAD_REQUEST)

    if len(nueva_password) < 6:
        return Response({"error": "La nueva contraseña debe tener al menos 6 caracteres."}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(nueva_password)
    user.save()

    return Response({"mensaje": "Contraseña actualizada correctamente."}, status=status.HTTP_200_OK)


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
from .models import Usuario, Pedido, Producto, ProductoPedido, CodigoDescuento, Stock

@api_view(['POST'])
def confirmar_pedido_view(request):
    user_id = request.data.get('user_id')
    items = request.data.get('items', [])
    direccion = request.data.get('direccion', '').strip()
    descuento = Decimal(request.data.get('descuento', 0))
    codigo_descuento_str = request.data.get('codigo_descuento')

    if not user_id or not items:
        return JsonResponse({"error": "Faltan user_id o items"}, status=400)

    # 1️⃣ Obtener el usuario
    try:
        user = Usuario.objects.get(id=user_id)
    except Usuario.DoesNotExist:
        return JsonResponse({"error": "Usuario no existe"}, status=404)

    # 2️⃣ Procesar código de descuento
    codigo_descuento_obj = None
    if codigo_descuento_str:
        try:
            codigo_descuento_obj = CodigoDescuento.objects.get(codigo=codigo_descuento_str.strip())
        except CodigoDescuento.DoesNotExist:
            codigo_descuento_obj = None

    # 3️⃣ Crear el Pedido (sin totales aún)
    pedido = Pedido.objects.create(
        usuario=user,
        direccion_envio=direccion,
        total=Decimal('0.00'),
        total_con_descuento=Decimal('0.00'),
        descuento_aplicado=descuento,
        codigo_descuento=codigo_descuento_obj
    )

    # 4️⃣ Recorrer items y procesar cada uno
    total_calculado = Decimal('0.00')
    for item in items:
        producto_id = item.get('id')
        cantidad = item.get('cantidad', 1)
        color_id = item.get('color_id')
        talla_id = item.get('talla_id')
        nombre_per  = item.get('nombre_personalizado')  # 📌 toma el nombre

        try:
            prod = Producto.objects.get(id=producto_id)
        except Producto.DoesNotExist:
            return JsonResponse({"error": f"Producto {producto_id} no encontrado"}, status=404)

        # 🔍 Buscar stock correspondiente
        try:
            stock_obj = Stock.objects.get(producto=prod, color_id=color_id, talla_id=talla_id)
        except Stock.DoesNotExist:
            return JsonResponse({
                "error": f"Sin stock para {prod.nombre} (color ID {color_id}, talla ID {talla_id})"
            }, status=400)

        # ❌ Verificar disponibilidad
        if stock_obj.cantidad < cantidad:
            return JsonResponse({
                "error": f"Stock insuficiente para {prod.nombre} (disponible: {stock_obj.cantidad}, solicitado: {cantidad})"
            }, status=400)

        # 🛍️ Crear ProductoPedido
        ProductoPedido.objects.create(
            pedido=pedido,
            producto=prod,
            cantidad=cantidad,
            precio=prod.precio,
            color_id=color_id,
            talla_id=talla_id,
            nombre_personalizado=nombre_per

        )

        # ✅ Restar stock
        stock_obj.cantidad -= cantidad
        stock_obj.save()

        # ➕ Sumar al total
        total_calculado += prod.precio * cantidad

    # 5️⃣ Guardar totales y finalizar
    pedido.total = total_calculado
    pedido.total_con_descuento = max(Decimal('0.00'), total_calculado - descuento)
    pedido.save()

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
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action in ['retrieve', 'detalle']:
            return ProductoDetalleSerializer
        return ProductoSerializer

    @action(detail=True, methods=['get'])
    def detalle(self, request, pk=None):
        producto = self.get_object()
        serializer = self.get_serializer(producto, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=["get"])  # 👈 ESTO FUERA DEL OTRO MÉTODO
    def recomendaciones(self, request, pk=None):
        try:
            producto_actual = self.get_object()
        except:
            return Response([])

        productos = Producto.objects.exclude(id=producto_actual.id)

        if not productos.exists():
            return Response([])

        data = []
        for p in productos:
            data.append({
                "id": p.id,
                "nombre": p.nombre,
                "descripcion": p.descripcion or "",
                "categoria": p.categoria.nombre if p.categoria else "",
                "tipo": p.tipo.nombre if p.tipo else "",
                "colores": " ".join([c.nombre for c in p.colores.all()]),
                "precio": float(p.precio),
            })

        actual_data = {
            "id": producto_actual.id,
            "nombre": producto_actual.nombre,
            "descripcion": producto_actual.descripcion or "",
            "categoria": producto_actual.categoria.nombre if producto_actual.categoria else "",
            "tipo": producto_actual.tipo.nombre if producto_actual.tipo else "",
            "colores": " ".join([c.nombre for c in producto_actual.colores.all()]),
            "precio": float(producto_actual.precio),
        }

        df = pd.concat([pd.DataFrame([actual_data]), pd.DataFrame(data)], ignore_index=True)

        df["texto"] = (
            df["nombre"] + " " +
            df["descripcion"] + " " +
            df["categoria"] + " " +
            df["tipo"] + " " +
            df["colores"]
        )

        tfidf = TfidfVectorizer()
        tfidf_matrix = tfidf.fit_transform(df["texto"])

        cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])
        similitudes = list(enumerate(cosine_sim[0]))
        similitudes.sort(key=lambda x: x[1], reverse=True)

        top_ids = [df.iloc[i + 1]["id"] for i, _ in similitudes[:4]]

        recomendados = Producto.objects.filter(id__in=top_ids)
        from .serializers import ProductoSerializer
        return Response(ProductoSerializer(recomendados, many=True, context={"request": request}).data)


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
    permission_classes = [AllowAny]

class EquipoViewSet(viewsets.ModelViewSet):
    queryset = Equipo.objects.all()
    serializer_class = EquipoSerializer
    permission_classes = [AllowAny]

class JuegoViewSet(viewsets.ModelViewSet):
    queryset = Juego.objects.all()
    serializer_class = JuegoSerializer
    permission_classes = [AllowAny]


class CompeticionViewSet(viewsets.ModelViewSet):
    queryset = Competicion.objects.all()
    serializer_class = CompeticionSerializer
    permission_classes = [AllowAny]

class EquipoCompetitivoViewSet(viewsets.ModelViewSet):
    queryset = EquipoCompetitivo.objects.all()
    serializer_class = EquipoCompetitivoSerializer
    permission_classes = [AllowAny]


class EquipoParticipanteViewSet(viewsets.ModelViewSet):
    queryset = EquipoParticipante.objects.all()
    serializer_class = EquipoParticipanteSerializer
    permission_classes = [AllowAny]


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
    permission_classes = [AllowAny]

# 🖼️ ViewSet para las imágenes de producto asociadas a un Sponsor
class SponsorImageViewSet(viewsets.ModelViewSet):
    queryset = SponsorImage.objects.all()
    serializer_class = SponsorImageSerializer
    permission_classes = [AllowAny]

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



from rest_framework import status
from rest_framework.response import Response

class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        # 1️⃣ Saca los items que vienen bajo "items" (no "productos")
        productos_data = data.pop('items', [])

        # 2️⃣ Crea el pedido con los datos restantes
        pedido_serializer = PedidoCrearSerializer(data=data)
        pedido_serializer.is_valid(raise_exception=True)
        pedido = pedido_serializer.save()

        # 3️⃣ Añade cada producto con color y talla
        for p in productos_data:
            ProductoPedido.objects.create(
                pedido=pedido,
                producto_id = p['id'],           # coincide con tu payload
                cantidad     = p['cantidad'],
                precio       = p.get('precio', 0),
                color_id     = p.get('color_id'),  # ahora sí lee color_id
                talla_id     = p.get('talla_id'),   # y talla_id
                nombre_personalizado=p.get('nombre_personalizado')
            )

        # 4️⃣ Devuelve el pedido ya serializado
        return Response(PedidoSerializer(pedido).data, status=status.HTTP_201_CREATED)


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

# views.py
class ValoracionViewSet(viewsets.ModelViewSet):
    queryset = Valoracion.objects.all()
    serializer_class = ValoracionSerializer
    def get_queryset(self):
        queryset = super().get_queryset()
        producto_id = self.request.query_params.get('producto')
        if producto_id:
            queryset = queryset.filter(producto_id=producto_id)
        return queryset.order_by('-creado_en')  # 🔁 Aquí siempre devuelve

