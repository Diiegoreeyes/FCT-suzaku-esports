import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarritoService } from '../../services/carrito.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {
  productosEnCarrito: any[] = [];
  total: number = 0;

  constructor(private carritoService: CarritoService) {}

  ngOnInit(): void {
    this.cargarCarrito();
  }

  cargarCarrito(): void {
    this.productosEnCarrito = this.carritoService.obtenerCarrito();
    this.calcularTotal();
  }

  calcularTotal(): void {
    this.total = this.productosEnCarrito.reduce((acc, producto) => {
      return acc + producto.precio * producto.cantidad;
    }, 0);
  }

  vaciarCarrito(): void {
    this.carritoService.vaciarCarrito();
    this.cargarCarrito();
  }

  // No hace falta llamar a agregarProducto aquí,
  // los cambios se gestionan con aumentar/disminuir/eliminar.

  aumentarCantidad(producto: any): void {
    this.carritoService.aumentarCantidad(
      producto.id,
      producto.colorSeleccionado?.id,
      producto.tallaSeleccionada?.id,
      producto.nombre_personalizado || ''
    );
    this.cargarCarrito();
  }

  disminuirCantidad(producto: any): void {
    this.carritoService.disminuirCantidad(
      producto.id,
      producto.colorSeleccionado?.id,
      producto.tallaSeleccionada?.id,
      producto.nombre_personalizado || ''
    );
    this.cargarCarrito();
  }

  eliminarProductoDelCarrito(producto: any): void {
    this.carritoService.eliminarProducto(
      producto.id,
      producto.colorSeleccionado?.id,
      producto.tallaSeleccionada?.id,
      producto.nombre_personalizado || ''
    );
    this.cargarCarrito();
  }

  getProductoFoto(foto: string): string {
    if (!foto) return 'assets/default-producto.jpg';
    if (foto.startsWith('http')) return foto;
    return `http://127.0.0.1:8000${foto.startsWith('/') ? '' : '/'}${foto}`;
  }

  getColorHex(nombreColor: string): string {
    // Si necesitas mostrar un círculo de color basado en nombre
    // asumimos que cada producto tiene producto.colorSeleccionado
    const anyProd = this.productosEnCarrito.find(p => p.colorSeleccionado?.nombre === nombreColor);
    return anyProd?.colorSeleccionado?.codigo_hex || '#ccc';
  }
}
