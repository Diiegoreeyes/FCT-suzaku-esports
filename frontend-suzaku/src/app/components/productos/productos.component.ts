import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../../services/producto.service';
import { CarritoService } from '../../services/carrito.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
 selector: 'app-productos',
 standalone: true,
 imports: [CommonModule, FormsModule],
 templateUrl: './productos.component.html',
 styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
 productos: any[] = [];
 productosFiltrados: any[] = [];


 filtroNombre: string = '';
 precioMin: number | null = null;
 precioMax: number | null = null;


 constructor(
   private productoService: ProductoService,
   private carritoService: CarritoService
 ) {}


 ngOnInit(): void {
   this.cargarProductos();
 }


 cargarProductos(): void {
   this.productoService.getProductos().subscribe({
     next: (data) => {
       this.productos = [...data];
       this.productosFiltrados = [...data];
     },
     error: (error) => {
       console.error('Error al cargar productos:', error);
     }
   });
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


 agregarAlCarrito(producto: any): void {
   this.carritoService.agregarProducto(producto);
 }


 trackProducto(index: number, producto: any): number {
   return producto.id;
 }


 aplicarFiltros(): void {
   this.productosFiltrados = this.productos.filter((p) => {
     const coincideNombre = p.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase());
     const dentroPrecioMin = this.precioMin == null || p.precio >= this.precioMin;
     const dentroPrecioMax = this.precioMax == null || p.precio <= this.precioMax;
     return coincideNombre && dentroPrecioMin && dentroPrecioMax;
   });
 }


 resetFiltros(): void {
   this.filtroNombre = '';
   this.precioMin = null;
   this.precioMax = null;
   this.productosFiltrados = [...this.productos];
 }
}
