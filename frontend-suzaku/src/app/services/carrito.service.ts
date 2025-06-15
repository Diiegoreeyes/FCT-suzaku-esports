import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private carrito: any[] = [];

  constructor() {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.cargarCarrito();
    }
  }

  obtenerCarrito(): any[] {
    return this.carrito;
  }

  agregarProducto(producto: any): void {
    const index = this.carrito.findIndex(p =>
      p.id === producto.id &&
      p.colorSeleccionado?.id === producto.colorSeleccionado?.id &&
      p.tallaSeleccionada?.id === producto.tallaSeleccionada?.id &&
      p.nombre_personalizado === (producto.nombrePersonalizado || null)
    );

    const productoFormateado = {
      ...producto,
      nombre_personalizado: producto.nombrePersonalizado || null
    };

    delete productoFormateado.nombrePersonalizado;

    if (index !== -1) {
      this.carrito[index].cantidad += producto.cantidad;
    } else {
      this.carrito.push(productoFormateado);
    }

    this.guardarCarrito();
  }


  aumentarCantidad(productoId: number, colorId?: number, tallaId?: number, nombre_personalizado: string = ''): void {
    const producto = this.carrito.find(p =>
      p.id === productoId &&
      p.colorSeleccionado?.id === colorId &&
      p.tallaSeleccionada?.id === tallaId &&
      p.nombre_personalizado === nombre_personalizado
    );
    if (producto) {
      producto.cantidad += 1;
      this.guardarCarrito();
    }
  }

  disminuirCantidad(productoId: number, colorId?: number, tallaId?: number, nombre_personalizado: string = ''): void {
    const producto = this.carrito.find(p =>
      p.id === productoId &&
      p.colorSeleccionado?.id === colorId &&
      p.tallaSeleccionada?.id === tallaId &&
      p.nombre_personalizado === nombre_personalizado
    );
    if (producto) {
      if (producto.cantidad > 1) {
        producto.cantidad -= 1;
      } else {
        this.eliminarProducto(productoId, colorId, tallaId, nombre_personalizado);
      }
      this.guardarCarrito();
    }
  }

  eliminarProducto(productoId: number, colorId?: number, tallaId?: number, nombre_personalizado: string = ''): void {
    this.carrito = this.carrito.filter(p =>
      !(p.id === productoId &&
        p.colorSeleccionado?.id === colorId &&
        p.tallaSeleccionada?.id === tallaId &&
        p.nombre_personalizado === nombre_personalizado)
    );
    this.guardarCarrito();
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
