from rest_framework import serializers
from .models import *

############################################################
# 📦 SERIALIZADORES DE PRODUCTOS
############################################################


class CodigoDescuentoSerializer(serializers.ModelSerializer):
    """
    🎟️ Serializador para los códigos de descuento.
    """
    class Meta:
        model = CodigoDescuento
        fields = '__all__'


############################################################
# 👤 SERIALIZADORES DE USUARIOS
############################################################

class UsuarioSerializer(serializers.ModelSerializer):
    foto = serializers.ImageField(required=False)

    class Meta:
        model = Usuario
        fields = ['id', 'nombre', 'apellidos', 'email', 'foto']  # ✅ SOLO esto

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = Usuario.objects.create_user(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        instance.nombre = validated_data.get('nombre', instance.nombre)
        instance.apellidos = validated_data.get('apellidos', instance.apellidos)
        instance.email = validated_data.get('email', instance.email)

        nueva_foto = validated_data.get('foto', None)
        if nueva_foto:
            instance.foto = nueva_foto

        instance.save()
        return instance

class DireccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Direccion
        fields = '__all__'
    
############################################################
# 🛒 SERIALIZADORES DE PEDIDOS Y PRODUCTOS EN PEDIDOS
############################################################

# 🎨 Serializador para colores
class ColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = '__all__'

# 📏 Serializador para tallas
class TallaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Talla
        fields = '__all__'

# 🏷️ Serializador para tipos de producto
class ProductoTipoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductoTipo
        fields = '__all__'

# 🧢 Serializador para categorías
class CategoriaProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoriaProducto
        fields = '__all__'

# 🖼️ Serializador para galería de imágenes
class ProductoImagenSerializer(serializers.ModelSerializer):
    color = ColorSerializer(read_only=True)
    color_id = serializers.PrimaryKeyRelatedField(
        queryset=Color.objects.all(), source='color',
        write_only=True, allow_null=True, required=False)

    class Meta:
        model = ProductoImagen
        fields = ['id', 'producto', 'imagen', 'descripcion',
                  'color', 'color_id']


# 📦 Serializador para stock (talla + color)
class StockSerializer(serializers.ModelSerializer):
    talla = TallaSerializer(read_only=True)
    color = ColorSerializer(read_only=True)
    talla_id = serializers.PrimaryKeyRelatedField(
        queryset=Talla.objects.all(), source='talla', write_only=True
    )
    color_id = serializers.PrimaryKeyRelatedField(
        queryset=Color.objects.all(), source='color', write_only=True
    )

    class Meta:
        model = Stock
        fields = ['id', 'producto', 'talla', 'color', 'cantidad', 'talla_id', 'color_id']

# ⭐ Serializador para valoraciones de productos
class ValoracionSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source='usuario.nombre', read_only=True)
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)

    class Meta:
        model = Valoracion
        fields = [
            'id', 'producto', 'producto_nombre', 'usuario', 'usuario_nombre',
            'puntuacion', 'comentario', 'imagen', 'creado_en', 'respuesta'  # 👈 Aquí la respuesta
        ]

# 🛍️ Serializador principal del producto
class ProductoSerializer(serializers.ModelSerializer):
    tipo      = ProductoTipoSerializer(read_only=True)
    categoria = CategoriaProductoSerializer(read_only=True)
    colores   = ColorSerializer(many=True, read_only=True)
    tallas    = TallaSerializer(many=True,  read_only=True)

    # campos write-only
    tipo_id      = serializers.PrimaryKeyRelatedField(queryset=ProductoTipo.objects.all(),
                                                      source='tipo',      write_only=True)
    categoria_id = serializers.PrimaryKeyRelatedField(queryset=CategoriaProducto.objects.all(),
                                                      source='categoria', write_only=True)
    colores_id   = serializers.PrimaryKeyRelatedField(queryset=Color.objects.all(),
                                                      many=True, source='colores', write_only=True)
    tallas_id    = serializers.PrimaryKeyRelatedField(queryset=Talla.objects.all(),
                                                      many=True, source='tallas',  write_only=True)

    class Meta:
        model  = Producto
        fields = '__all__'

    # 🔐  Sobrescribimos create / update para asignar las M2M
    def create(self, validated_data):
        colores = validated_data.pop('colores', [])
        tallas  = validated_data.pop('tallas',  [])
        relacionados = validated_data.pop('productos_relacionados', [])

        producto = super().create(validated_data)
        producto.colores.set(colores)
        producto.tallas.set(tallas)
        producto.productos_relacionados.set(relacionados)
        print('🎨 Colores recibidos:', colores)

        return producto

    def update(self, instance, validated_data):
        colores = validated_data.pop('colores', None)
        tallas  = validated_data.pop('tallas',  None)
        relacionados = validated_data.pop('productos_relacionados', None)

        producto = super().update(instance, validated_data)

        if colores is not None:
            producto.colores.set(colores)
        if tallas is not None:
            producto.tallas.set(tallas)
        if relacionados is not None:
            producto.productos_relacionados.set(relacionados)
        return producto
    
class ProductoPedidoCrearSerializer(serializers.ModelSerializer):
    color_id = serializers.IntegerField(required=False, allow_null=True)
    talla_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = ProductoPedido
        fields = ['producto', 'cantidad', 'precio', 'color_id', 'talla_id']

class PedidoCrearSerializer(serializers.ModelSerializer):
    productos = ProductoPedidoCrearSerializer(many=True)

    class Meta:
        model = Pedido
        fields = ['usuario', 'direccion_envio', 'total', 'total_con_descuento', 'descuento_aplicado', 'codigo_descuento', 'productos']

    def create(self, validated_data):
        productos_data = validated_data.pop('productos')
        pedido = Pedido.objects.create(**validated_data)

        for p in productos_data:
            ProductoPedido.objects.create(
                pedido=pedido,
                producto=p['producto'],
                cantidad=p['cantidad'],
                precio=p['precio'],
                color_id=p.get('color_id'),
                talla_id=p.get('talla_id')
            )

        return pedido

from rest_framework.request import Request

class ProductoPedidoSerializer(serializers.ModelSerializer):
    imagen_principal = serializers.ImageField(source='producto.imagen_principal', read_only=True)
    nombre           = serializers.CharField(source='producto.nombre',       read_only=True)
    precio           = serializers.DecimalField(source='producto.precio',    max_digits=10, decimal_places=2, read_only=True)
    tipo             = ProductoTipoSerializer(source='producto.tipo',         read_only=True)
    categoria        = CategoriaProductoSerializer(source='producto.categoria', read_only=True)
    colores          = ColorSerializer(source='producto.colores', many=True,   read_only=True)
    tallas           = TallaSerializer(source='producto.tallas', many=True,    read_only=True)
    color            = ColorSerializer(read_only=True)
    talla            = TallaSerializer(read_only=True)

    # Nuevo campo
    imagenes_por_color = serializers.SerializerMethodField()

    class Meta:
        model  = ProductoPedido
        fields = [
          'id','producto','cantidad','imagen_principal','nombre','precio',
          'tipo','categoria','colores','tallas','color','talla',
          'imagenes_por_color'
        ]

    def get_imagenes_por_color(self, obj):
        """
        Construye un dict { color_nombre: [url1, url2, …], … }
        """
        request: Request = self.context.get('request')
        resultado = {}
        for img in obj.producto.galeria.all():
            if img.color:
                nm = img.color.nombre
                url = (request.build_absolute_uri(img.imagen.url)
                       if request else img.imagen.url)
                resultado.setdefault(nm, []).append(url)
        return resultado


class StockSerializer(serializers.ModelSerializer):
    color = ColorSerializer(read_only=True)
    talla = TallaSerializer(read_only=True)
    color_id = serializers.PrimaryKeyRelatedField(source='color', queryset=Color.objects.all(), write_only=True)
    talla_id = serializers.PrimaryKeyRelatedField(source='talla', queryset=Talla.objects.all(), write_only=True)

    class Meta:
        model = Stock
        fields = ['id', 'producto', 'talla', 'color', 'cantidad', 'color_id', 'talla_id']

class PedidoSerializer(serializers.ModelSerializer):
    """
    📦 Serializador para los pedidos, incluyendo los productos en el pedido.
    """
    productos = ProductoPedidoSerializer(many=True, read_only=True)  # 🔄 Relación con ProductoPedido
    codigo_descuento_str = serializers.SerializerMethodField()

    class Meta:
        model = Pedido
        fields = '__all__'

    def get_codigo_descuento_str(self, obj):
        # Devuelve el atributo 'codigo' del objeto codigo_descuento (si existe)
        if obj.codigo_descuento:
            return obj.codigo_descuento.codigo
        return None


############################################################
# SOBRE NOSOTROS
############################################################

# serializers.py

class PostEquipoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostEquipo
        fields = '__all__'


class EquipoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipo
        fields = [
            'id',
            'nombre',           # asegúrate de que aparece aquí
            'primer_apellido',  # y también este
            'nickname',
            'descripcion',
            'foto',
            'tipo',
        ]


class JuegoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Juego
        fields = '__all__'


class CompeticionSerializer(serializers.ModelSerializer):
    juego = JuegoSerializer(read_only=True)
    juego_id = serializers.PrimaryKeyRelatedField(
        queryset=Juego.objects.all(), source='juego', write_only=True
    )

    class Meta:
        model = Competicion
        fields = ['id', 'nombre', 'descripcion', 'fecha_inicio', 'fecha_fin', 'pais',
                  'organizador', 'juego', 'juego_id']


class EquipoCompetitivoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EquipoCompetitivo
        fields = '__all__'

class EquipoParticipanteSerializer(serializers.ModelSerializer):
    equipo_competitivo_id = serializers.PrimaryKeyRelatedField(
        queryset=EquipoCompetitivo.objects.all(), source='equipo_competitivo', write_only=True
    )
    competicion_id = serializers.PrimaryKeyRelatedField(
        queryset=Competicion.objects.all(), source='competicion', write_only=True
    )
    equipo_competitivo = EquipoCompetitivoSerializer(read_only=True)
    competicion = CompeticionSerializer(read_only=True)

    class Meta:
        model = EquipoParticipante
        fields = '__all__'




class PartidoSerializer(serializers.ModelSerializer):
    competicion = CompeticionSerializer(read_only=True)
    competicion_id = serializers.PrimaryKeyRelatedField(
        queryset=Competicion.objects.all(), source='competicion', write_only=True
    )

    equipo1 = EquipoParticipanteSerializer(read_only=True)
    equipo1_id = serializers.PrimaryKeyRelatedField(
        queryset=EquipoParticipante.objects.all(), source='equipo1', write_only=True
    )

    equipo2 = EquipoParticipanteSerializer(read_only=True)
    equipo2_id = serializers.PrimaryKeyRelatedField(
        queryset=EquipoParticipante.objects.all(), source='equipo2', write_only=True
    )

    class Meta:
        model = Partido
        fields = [
            'id', 'competicion', 'competicion_id',
            'equipo1', 'equipo1_id',
            'equipo2', 'equipo2_id',
            'marcador_equipo1', 'marcador_equipo2',
            'fecha_partido', 'estado'
        ]

# 🎨 Serializador de imágenes asociadas a un sponsor
class SponsorImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = SponsorImage
        fields = '__all__'


# 🧾 Serializador principal del sponsor con imágenes anidadas
class SponsorSerializer(serializers.ModelSerializer):
    imagenes = SponsorImageSerializer(many=True, read_only=True)  # ← nombre coincide con related_name

    class Meta:
        model = Sponsor
        fields = '__all__'


from rest_framework import serializers
from .models import Producto
from rest_framework.request import Request

class ProductoDetalleSerializer(serializers.ModelSerializer):
    colores = ColorSerializer(many=True, read_only=True)
    galeria = ProductoImagenSerializer(many=True, read_only=True)
    stock_items = StockSerializer(many=True, read_only=True)
    tallas = serializers.SerializerMethodField()
    imagenes_por_color = serializers.SerializerMethodField()
    
    tallas = TallaSerializer(many=True, read_only=True)   # 👈 cámbialo así

    class Meta:
        model = Producto
        fields = '__all__'

    def get_imagenes_por_color(self, obj):
        request: Request = self.context.get('request')  # 👈 necesario para URL absolutas
        resultado = {}
        for img in obj.galeria.all():
            if img.color:
                nombre = img.color.nombre
                url = request.build_absolute_uri(img.imagen.url) if request else img.imagen.url
                resultado.setdefault(nombre, []).append(url)
        return resultado

    def get_tallas(self, obj):
        return obj.stock_items.values_list('talla__nombre', flat=True).distinct()
