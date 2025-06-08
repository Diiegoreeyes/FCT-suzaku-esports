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

  aumentarCantidad(producto: any): void {
    this.carritoService.aumentarCantidad(producto.id, producto.colorSeleccionado?.id, producto.tallaSeleccionada?.id);
    this.cargarCarrito();
  }
  
  disminuirCantidad(producto: any): void {
    this.carritoService.disminuirCantidad(producto.id, producto.colorSeleccionado?.id, producto.tallaSeleccionada?.id);
    this.cargarCarrito();
  }
  
  eliminarProductoDelCarrito(producto: any): void {
    this.carritoService.eliminarProducto(producto.id, producto.colorSeleccionado?.id, producto.tallaSeleccionada?.id);
    this.cargarCarrito();
  }
  

  getProductoFoto(foto: string): string {
    if (!foto) return 'assets/default-producto.jpg';
    if (foto.startsWith('http')) return foto;
    return `http://127.0.0.1:8000${foto}`;
  }
  getColorHex(nombreColor: string): string {
  // Busca en el array de colores del producto el código hex correspondiente
  for (const producto of this.productosEnCarrito) {
    const color = producto.colores?.find((c: any) => c.nombre === nombreColor);
    if (color) return color.codigo_hex || '#ccc';
  }
  return '#ccc';
}

}
