from rest_framework import serializers
from .models import *

############################################################
# 📦 SERIALIZADORES DE PRODUCTOS
############################################################

class ProductoSerializer(serializers.ModelSerializer):
    """
    📦 Serializador para el modelo de Producto.
    """
    class Meta:
        model = Producto
        fields = '__all__'

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
        exclude = ['groups', 'user_permissions','is_active']  
        
    def create(self, validated_data):
            # Extrae la contraseña y el resto de campos
            password = validated_data.pop('password', None)
            # Llama a create_user() para cifrar la contraseña
            user = Usuario.objects.create_user(**validated_data)
            if password:
                user.set_password(password)
            user.save()
            return user
    
    def update(self, instance, validated_data):
        # Actualiza los campos de texto
        instance.nombre = validated_data.get('nombre', instance.nombre)
        instance.apellidos = validated_data.get('apellidos', instance.apellidos)
        instance.email = validated_data.get('email', instance.email)
        instance.direccion = validated_data.get('direccion', instance.direccion)
        
        # Actualiza la foto si se envía
        if 'foto' in validated_data:
            instance.foto = validated_data.get('foto')
        
        instance.save()
        # Para depurar, imprime el valor actualizado de la foto
        print("Foto actualizada:", instance.foto.url if instance.foto else "Sin foto")
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

    class Meta:
        model = Valoracion
        fields = ['id', 'producto', 'usuario', 'usuario_nombre', 'puntuacion', 'comentario', 'creado_en']

# 🛍️ Serializador principal del producto
class ProductoSerializer(serializers.ModelSerializer):
    tipo = ProductoTipoSerializer(read_only=True)
    categoria = CategoriaProductoSerializer(read_only=True)
    colores = ColorSerializer(many=True, read_only=True)
    tallas = TallaSerializer(many=True, read_only=True)

    tipo_id = serializers.PrimaryKeyRelatedField(queryset=ProductoTipo.objects.all(), source='tipo', write_only=True)
    categoria_id = serializers.PrimaryKeyRelatedField(queryset=CategoriaProducto.objects.all(), source='categoria', write_only=True)
    colores_id = serializers.PrimaryKeyRelatedField(queryset=Color.objects.all(), many=True, source='colores', write_only=True)
    tallas_id = serializers.PrimaryKeyRelatedField(queryset=Talla.objects.all(), many=True, source='tallas', write_only=True)

    class Meta:
        model = Producto
        fields = '__all__'
        
class ProductoPedidoSerializer(serializers.ModelSerializer):
    imagen_principal = serializers.ImageField(source='producto.imagen_principal', read_only=True)
    nombre = serializers.CharField(source='producto.nombre', read_only=True)
    precio = serializers.DecimalField(source='producto.precio', max_digits=10, decimal_places=2, read_only=True)
    tipo = ProductoTipoSerializer(source='producto.tipo', read_only=True)
    categoria = CategoriaProductoSerializer(source='producto.categoria', read_only=True)
    colores = ColorSerializer(source='producto.colores', many=True, read_only=True)
    tallas = TallaSerializer(source='producto.tallas', many=True, read_only=True)

    class Meta:
        model = ProductoPedido
        fields = ['id', 'producto', 'cantidad', 'imagen_principal', 'nombre', 'precio', 'tipo', 'categoria', 'colores', 'tallas']


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
