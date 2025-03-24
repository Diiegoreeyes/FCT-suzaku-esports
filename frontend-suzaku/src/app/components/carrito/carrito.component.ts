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

  agregarProductoAlCarrito(producto: any): void {
    this.carritoService.agregarProducto(producto);
    this.cargarCarrito();
  }

  eliminarProductoDelCarrito(productoId: number): void {
    this.carritoService.eliminarProducto(productoId);
    this.cargarCarrito();
  }

  aumentarCantidad(productoId: number): void {
    this.carritoService.aumentarCantidad(productoId);
    this.cargarCarrito();
  }

  disminuirCantidad(productoId: number): void {
    this.carritoService.disminuirCantidad(productoId);
    this.cargarCarrito();
  }

  getProductoFoto(foto: string): string {
    if (!foto) {
      return 'assets/default-producto.jpg';
    }
    if (foto.startsWith('http://') || foto.startsWith('https://')) {
      return foto;
    }
    if (foto.startsWith('/media/')) {
      return `http://127.0.0.1:8000${foto}`;
    }
    return `http://127.0.0.1:8000/media/${foto}`;
  }
}
