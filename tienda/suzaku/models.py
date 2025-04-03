from django.db import models
from django.contrib.auth.models import User
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager


############################################################
# MODELO USUARIOS
############################################################


from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

class UsuarioManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        print("DEBUG extra_fields antes de setdefault:", extra_fields)
        extra_fields.setdefault('is_active', True)
        print("DEBUG extra_fields después de setdefault:", extra_fields)

        if not email:
            raise ValueError("El correo electrónico es obligatorio")
        email = self.normalize_email(email)
        usuario = self.model(email=email, **extra_fields)
        usuario.set_password(password)
        usuario.save(using=self._db)
        print("DEBUG valor final de usuario.is_active en BD:", usuario.is_active)
        return usuario


    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)

class Usuario(AbstractBaseUser, PermissionsMixin):
    nombre = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    # ❌ NO tengas password = models.CharField(...) 
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UsuarioManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["nombre", "apellidos"]

    def __str__(self):
        return f"{self.nombre} {self.apellidos}"


    
class Direccion(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='direcciones')
    alias = models.CharField(max_length=50, blank=True, null=True)
    direccion = models.CharField(max_length=255)
    ciudad = models.CharField(max_length=100)
    provincia = models.CharField(max_length=100, blank=True, null=True)
    codigo_postal = models.CharField(max_length=20, blank=True, null=True)
    pais = models.CharField(max_length=100, default='España')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    activa = models.BooleanField(default=False)  

    def __str__(self):
        return f"{self.alias or 'Dirección'}: {self.direccion}, {self.ciudad}, {self.pais}"
    
############################################################
# MODELO CÓDIGO DESCUESTO
############################################################


class CodigoDescuento(models.Model):
    codigo = models.CharField(max_length=50, unique=True)  # Código del descuento
    porcentaje = models.DecimalField(max_digits=5, decimal_places=2)  # Porcentaje de descuento

    def __str__(self):
        return self.codigo


############################################################
# MODELO PRODUCTO
############################################################

class Producto(models.Model):
    """ Representa un producto en la tienda """
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0) 
    foto = models.ImageField(upload_to='productos/', blank=True, null=True)  # Nuevo campo para la imagen

    def __str__(self):
        return self.nombre

############################################################
# MODELO CARRITO
############################################################

class Carrito(models.Model):
    """ Representa un carrito de compras para cada usuario """
    user = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.user.username} - {self.producto.nombre} ({self.cantidad})"

############################################################
# MODELO PEDIDO
############################################################

class Pedido(models.Model):
    """ Representa un pedido realizado por un usuario """
    ESTADOS_PEDIDO = (
        ('pendiente', 'Pendiente'),
        ('procesado', 'Procesado'),
        ('enviado', 'Enviado'),
    )

    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True)
    direccion_envio = models.CharField(max_length=255)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=ESTADOS_PEDIDO, default='pendiente')
    total = models.DecimalField(max_digits=10, decimal_places=2)
    total_con_descuento = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    descuento_aplicado = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    codigo_descuento = models.ForeignKey(CodigoDescuento,on_delete=models.SET_NULL,null=True,blank=True)
    
    def __str__(self):
        return f"Pedido {self.id} - {self.estado} ({self.usuario if self.usuario else 'Anónimo'})"

############################################################
# MODELO PRODUCTO PEDIDO
############################################################

class ProductoPedido(models.Model):
    """ Relaciona los productos con los pedidos realizados """
    pedido = models.ForeignKey(Pedido, related_name='productos', on_delete=models.CASCADE)
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)  # Precio con descuento aplicado

    def __str__(self):
        return f"{self.producto.nombre} - {self.cantidad} unidades en Pedido {self.pedido.id}"

############################################################
# POSTS
############################################################

class PostEquipo(models.Model):
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    imagen = models.ImageField(upload_to='equipo_posts/', blank=True, null=True)

    # OPCIONAL: si quieres un orden específico
    orden = models.PositiveIntegerField(default=0, help_text="Posición para mostrar el post en el equipo.")

    def __str__(self):
        return f"{self.titulo}"
    

############################################################
# EQUIPO
############################################################


class Equipo(models.Model):
    # Opciones para el campo "tipo"
    TIPO_CHOICES = [
        ('jugador', 'Jugador'),
        ('creador', 'Creador de Contenido'),
    ]

    nombre = models.CharField(max_length=100)
    primer_apellido = models.CharField(max_length=100, blank=True, null=True)
    nickname = models.CharField(max_length=50)
    descripcion = models.TextField(blank=True, null=True)
    foto = models.ImageField(upload_to='equipo_integrantes/', blank=True, null=True)
    tipo = models.CharField(
        max_length=20,
        choices=TIPO_CHOICES,
        default='creador'
    )

    def __str__(self):
        return f"{self.nombre} {self.primer_apellido or ''} ({self.nickname})"
    

# ------------------------
# MODELO JUEGO
# ------------------------
class Juego(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)
    logo = models.ImageField(upload_to='juegos/', blank=True, null=True)

    def __str__(self):
        return self.nombre


# ------------------------
# MODELO COMPETICIÓN
# ------------------------
class Competicion(models.Model):
    nombre = models.CharField(max_length=200)
    juego = models.ForeignKey(Juego, on_delete=models.CASCADE, related_name='competiciones')
    descripcion = models.TextField(blank=True, null=True)
    fecha_inicio = models.DateField(blank=True, null=True)
    fecha_fin = models.DateField(blank=True, null=True)
    pais = models.CharField(max_length=100, blank=True, null=True)
    organizador = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.nombre


class EquipoCompetitivo(models.Model):
    nombre = models.CharField(max_length=100, null=True)
    logo = models.ImageField(upload_to='equipos_competitivos/', blank=True, null=True)
    pais = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return self.nombre


# ------------------------
# MODELO EQUIPO PARTICIPANTE EN UNA COMPETICIÓN
# ------------------------
class EquipoParticipante(models.Model):
    equipo_competitivo = models.ForeignKey('EquipoCompetitivo', on_delete=models.CASCADE, related_name='participaciones')
    competicion = models.ForeignKey(Competicion, on_delete=models.CASCADE, related_name='equipos')
    posicion_ranking = models.PositiveIntegerField(blank=True, null=True)
    puntos = models.PositiveIntegerField(default=0,blank=True, null=True)
    victorias = models.PositiveIntegerField(default=0,blank=True, null=True)
    derrotas = models.PositiveIntegerField(default=0,blank=True, null=True)
    empates = models.IntegerField(default=0)  


    def __str__(self):
        return f"{self.equipo_competitivo.nombre} en {self.competicion.nombre}"


# ------------------------
# MODELO PARTIDO
# ------------------------
class Partido(models.Model):
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('finalizado', 'Finalizado'),
    ]

    competicion = models.ForeignKey(Competicion, on_delete=models.CASCADE, related_name='partidos')
    equipo1 = models.ForeignKey(EquipoParticipante, on_delete=models.CASCADE, related_name='partidos_como_equipo1')
    equipo2 = models.ForeignKey(EquipoParticipante, on_delete=models.CASCADE, related_name='partidos_como_equipo2')
    marcador_equipo1 = models.PositiveIntegerField(default=0)
    marcador_equipo2 = models.PositiveIntegerField(default=0)
    fecha_partido = models.DateTimeField()
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente')

    def __str__(self):
        return f"{self.equipo1.equipo_competitivo.nombre} vs {self.equipo2.equipo_competitivo.nombre} ({self.competicion.nombre})"

