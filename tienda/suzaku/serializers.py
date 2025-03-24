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

class ProductoPedidoSerializer(serializers.ModelSerializer):
    # Anidar el ProductoSerializer para tener toda la info del producto
    producto = ProductoSerializer(read_only=True)

    class Meta:
        model = ProductoPedido
        fields = ['id', 'producto', 'cantidad', 'precio']



class PedidoSerializer(serializers.ModelSerializer):
    """
    📦 Serializador para los pedidos, incluyendo los productos en el pedido.
    """
    productos = ProductoPedidoSerializer(many=True, read_only=True)  # 🔄 Relación con ProductoPedido
    codigo_descuento_str = serializers.SerializerMethodField()

    class Meta:
        model = Pedido
        fields = [
            'id',
            'usuario',
            'direccion_envio',
            'fecha_creacion',
            'estado',
            'total',
            'total_con_descuento',
            'descuento_aplicado',
            'productos',  # 🔗 Relación con los productos pedidos
            'codigo_descuento_str',
        ]

    def get_codigo_descuento_str(self, obj):
        # Devuelve el atributo 'codigo' del objeto codigo_descuento (si existe)
        if obj.codigo_descuento:
            return obj.codigo_descuento.codigo
        return None