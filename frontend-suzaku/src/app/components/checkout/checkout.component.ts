import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarritoService } from '../../services/carrito.service';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CheckoutService } from '../../services/checkout.service';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { DireccionesService } from '../../services/direcciones.service';

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
    private fb: FormBuilder
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
    this.total = this.productosEnCarrito.reduce((acc, producto) => {
      return acc + producto.precio * producto.cantidad;
    }, 0);
    this.total -= this.descuento;
  }

  aplicarDescuento(): void {
    this.checkoutService.verificarCodigoDescuento(this.codigoDescuento).subscribe({
      next: (response) => {
        if (response.porcentaje_descuento) {
          const porcentajeDescuento = response.porcentaje_descuento;
          this.descuento = (this.total * porcentajeDescuento) / 100;
          this.totalConDescuento = this.total - this.descuento;
        } else {
          alert('Código de descuento no válido.');
        }
      },
      error: () => {
        alert('Error al verificar el código de descuento.');
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

    const pedidoData = {
      user_id: this.usuarioId,
      direccion: this.direccionActivaStr,
      descuento: this.descuento,
      codigo_descuento: this.codigoDescuento,
      items: this.productosEnCarrito.map(item => ({
        id: item.id,
        cantidad: item.cantidad
      }))
    };

    this.checkoutService.confirmarPedido(pedidoData).subscribe({
      next: (res) => {
        alert(`Pedido #${res.pedido_id} creado con total: ${res.total_con_descuento}`);
        this.carritoService.vaciarCarrito();
        this.router.navigate(['/perfil/mis-pedidos']);
      },
      error: () => {
        alert('Error al confirmar pedido');
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
