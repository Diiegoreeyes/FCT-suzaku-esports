import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarritoService } from '../../services/carrito.service';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CheckoutService } from '../../services/checkout.service';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { DireccionesService } from '../../services/direcciones.service';

declare var paypal: any;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})

export class CheckoutComponent implements OnInit {
  productosEnCarrito: any[] = [];
  total: number = 0;
  descuento: number = 0;
  codigoDescuento: string = '';
  totalConDescuento: number = 0;
  direccionActivaStr: string = '';
  usuarioId: number | null = null;

  mostrarSelectorDirecciones: boolean = false;
  direcciones: any[] = [];
  direccionActivaId: number | null = null;

  // ✅ NUEVO: mostrar formulario y formulario reactivo
  mostrarFormularioDireccion: boolean = false;
  direccionForm!: FormGroup;

  constructor(
    private carritoService: CarritoService,
    private checkoutService: CheckoutService,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private direccionesService: DireccionesService,
    private router: Router,
    private fb: FormBuilder,

  ) {}

  ngOnInit(): void {
    this.usuarioId = this.authService.obtenerUserId();
    if (this.usuarioId) {
      this.cargarDireccionActiva();
    } else {
      console.error('No se encontró un usuario logueado.');
    }
    this.cargarCarrito();
    this.inicializarFormularioDireccion(); // ✅ Inicializar formulario
    this.renderizarBotonPayPal();

  }
  

  renderizarBotonPayPal(reintentos: number = 0): void {
    const totalValido = this.totalConDescuento && !isNaN(this.totalConDescuento);
  
    if (!totalValido) {
      console.error('❌ totalConDescuento no es válido:', this.totalConDescuento);
      return;
    }
  
    const paypalContainer = document.getElementById('paypal-button-container');
    if (paypalContainer) {
      paypalContainer.innerHTML = ''; // Limpia posibles botones anteriores
    }
  
    if ((window as any).paypal) {
      (window as any).paypal.Buttons({
        createOrder: (_data: any, actions: any) =>
          actions.order.create({
            purchase_units: [{
              amount: { value: this.totalConDescuento.toFixed(2) },
              description: 'Compra en Suzaku Esports'
            }]
          }),
  
        onApprove: (_data: any, actions: any) =>
          actions.order.capture().then((details: any) => {
            console.log('✅ Pago completado:', details);
            this.confirmarPedido();
          }),
  
        onError: (err: any) => {
          console.error('❌ Error PayPal:', err);
          alert('Ha habido un error en el pago con PayPal.');
        }
      }).render('#paypal-button-container');
  
      return;
    }
  
    if (reintentos < 10) {
      setTimeout(() => this.renderizarBotonPayPal(reintentos + 1), 300);
    } else {
      console.error('SDK de PayPal no cargado tras varios intentos');
    }
  }
  
  
  
  cargarDireccionActiva(): void {
    this.direccionesService.getDireccionActiva().subscribe({
      next: (dir) => {
        this.direccionActivaStr = this.formatearDireccion(dir);
        this.direccionActivaId = dir.id;
        this.cargarTodasLasDirecciones();
      },
      error: (err) => {
        console.warn('No hay dirección activa o error al obtenerla:', err);
        this.direccionActivaStr = '';
      }
    });
  }

  cargarTodasLasDirecciones(): void {
    this.direccionesService.getDirecciones().subscribe({
      next: (data) => {
        this.direcciones = data;
      },
      error: () => {
        console.error('Error al cargar todas las direcciones');
      }
    });
  }

  seleccionarDireccion(dir: any): void {
    const patchData = { activa: true };
    this.direccionesService.actualizarDireccion(dir.id, patchData).subscribe({
      next: () => {
        this.direccionActivaId = dir.id;
        this.direccionActivaStr = this.formatearDireccion(dir);
        this.mostrarSelectorDirecciones = false;
      },
      error: () => {
        alert('Error al actualizar la dirección activa');
      }
    });
  }

  private formatearDireccion(dir: any): string {
    if (!dir) return '';
    const aliasStr = dir.alias ? `(${dir.alias}) ` : '';
    const provStr  = dir.provincia ? `, ${dir.provincia}` : '';
    const cpStr    = dir.codigo_postal ? `, ${dir.codigo_postal}` : '';
    return `${aliasStr}${dir.direccion}, ${dir.ciudad}${provStr}${cpStr} - ${dir.pais}`;
  }

  cargarCarrito(): void {
    this.productosEnCarrito = this.carritoService.obtenerCarrito();
    this.calcularTotal();
  }

  calcularTotal(): void {
    const subtotal = this.productosEnCarrito.reduce((acc, producto) => {
      return acc + producto.precio * producto.cantidad;
    }, 0);
    this.total = subtotal;
    this.totalConDescuento = this.total - this.descuento;
  
    // ⬇️ AÑADIR ESTO SI AÚN NO LO TENÍAS
    setTimeout(() => this.renderizarBotonPayPal(), 0);
  }
  
  

  aplicarDescuento(): void {
    this.checkoutService.verificarCodigoDescuento(this.codigoDescuento).subscribe({
      next: (response) => {
        if (response.porcentaje_descuento) {
          const porcentaje = response.porcentaje_descuento;
          this.descuento = (this.total * porcentaje) / 100;
          this.totalConDescuento = this.total - this.descuento;
        } else {
          alert('Código no válido.');
          this.descuento = 0;
          this.totalConDescuento = this.total;
        }
      },
      error: () => {
        alert('Error al verificar el código.');
      }
    });
  }
  

  vaciarCarrito(): void {
    this.carritoService.vaciarCarrito();
    this.cargarCarrito();
  }

  confirmarPedido(): void {
    if (!this.usuarioId) {
      alert('No se ha detectado un usuario logueado.');
      return;
    }

    if (!this.direccionActivaStr) {
      alert('Debes seleccionar una dirección de envío antes de confirmar el pedido.');
      return;
    }

    // 🤜 Mapear exactamente los campos que tu API espera
    const items = this.productosEnCarrito.map(item => ({
      id: item.id,
      cantidad: item.cantidad,
      color_id: item.colorSeleccionado?.id ?? null,
      talla_id: item.tallaSeleccionada?.id ?? null,
      nombre_personalizado: item.nombre_personalizado?.trim() || null
    }));


    const payload = {
      user_id: this.usuarioId,
      direccion: this.direccionActivaStr,
      descuento: this.descuento,
      codigo_descuento: this.codigoDescuento || null,
      items
    };

    this.checkoutService.confirmarPedido(payload).subscribe({
      next: res => {
        alert(`✅ Pedido #${res.pedido_id} creado con total: ${res.total_con_descuento} €`);
        this.carritoService.vaciarCarrito();
        this.router.navigate(['/perfil/mis-pedidos']);
      },
      error: err => {
        console.error('❌ Error al confirmar pedido:', err);
        alert('Error al confirmar el pedido. Intenta nuevamente.');
      }
    });
  }


  cambiarDireccion(): void {
    this.mostrarSelectorDirecciones = !this.mostrarSelectorDirecciones;
  }

  getProductoFoto(foto: string): string {
    if (!foto) return 'assets/default-producto.jpg';
    return foto.startsWith('http')
      ? foto
      : `http://127.0.0.1:8000${foto.startsWith('/') ? '' : '/'}${foto}`;
  }

  // ✅ NUEVO MÉTODO: Mostrar formulario
  toggleFormularioDireccion(): void {
    this.mostrarFormularioDireccion = !this.mostrarFormularioDireccion;
  }

  // ✅ NUEVO MÉTODO: Inicializar formulario
  inicializarFormularioDireccion(): void {
    this.direccionForm = this.fb.group({
      alias: [''],
      direccion: ['', Validators.required],
      ciudad: ['', Validators.required],
      provincia: [''],
      codigo_postal: [''],
      pais: ['', Validators.required]
    });
  }

  // ✅ NUEVO MÉTODO: Agregar dirección
  agregarDireccion(): void {
    if (this.direccionForm.invalid) {
      return;
    }

    const data = {
      ...this.direccionForm.value,
      activa: true // hacerla activa automáticamente
    };

    this.direccionesService.crearDireccion(data).subscribe({
      next: (res) => {
        this.direccionForm.reset();
        this.mostrarFormularioDireccion = false;
        this.cargarDireccionActiva();
      },
      error: (err) => {
        alert('Error al crear la dirección');
      }
    });
  }
}
