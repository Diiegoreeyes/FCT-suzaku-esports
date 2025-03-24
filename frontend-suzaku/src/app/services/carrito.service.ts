import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private carrito: any[] = [];

  constructor() {
    // Carga el carrito desde localStorage al iniciar
    if (typeof window !== 'undefined' && window.localStorage) {
      this.cargarCarrito();
    }
  }

  obtenerCarrito(): any[] {
    return this.carrito;
  }

  agregarProducto(producto: any): void {
    const index = this.carrito.findIndex(p => p.id === producto.id);
    if (index !== -1) {
      this.carrito[index].cantidad += 1;
    } else {
      this.carrito.push({ ...producto, cantidad: 1 });
    }
    this.guardarCarrito();
  }

  eliminarProducto(productoId: number): void {
    this.carrito = this.carrito.filter(p => p.id !== productoId);
    this.guardarCarrito();
  }

  modificarCantidad(productoId: number, nuevaCantidad: number): void {
    const producto = this.carrito.find(p => p.id === productoId);
    if (producto) {
      producto.cantidad = nuevaCantidad;
      if (producto.cantidad <= 0) {
        this.eliminarProducto(productoId);
      }
      this.guardarCarrito();
    }
  }

  aumentarCantidad(productoId: number): void {
    const producto = this.carrito.find(p => p.id === productoId);
    if (producto) {
      producto.cantidad += 1;
      this.guardarCarrito();
    }
  }
  
  disminuirCantidad(productoId: number): void {
    const producto = this.carrito.find(p => p.id === productoId);
    if (producto) {
      if (producto.cantidad > 1) {
        producto.cantidad -= 1;
      } else {
        this.eliminarProducto(productoId);
      }
      this.guardarCarrito();
    }
  }

  vaciarCarrito(): void {
    this.carrito = [];
    this.guardarCarrito();
  }

  private guardarCarrito(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('carrito', JSON.stringify(this.carrito));
    }
  }

  private cargarCarrito(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const carritoGuardado = localStorage.getItem('carrito');
      if (carritoGuardado) {
        this.carrito = JSON.parse(carritoGuardado);
      }
    }
  }
}
