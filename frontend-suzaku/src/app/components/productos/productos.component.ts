import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../../services/producto.service';
import { CarritoService } from '../../services/carrito.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';


@Component({
 selector: 'app-productos',
 standalone: true,
 imports: [CommonModule, FormsModule,RouterModule],
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


 getProductoFoto(url: string): string {
  if (!url) return 'assets/default-producto.jpg';
  return url.startsWith('http') ? url : `http://127.0.0.1:8000${url}`;
}



 agregarAlCarrito(producto: any): void {
  this.carritoService.agregarProducto(producto);

  const img = document.querySelector(`.producto-img[data-id="${producto.id}"]`) as HTMLImageElement;
  const carrito = document.getElementById('carritoIcon');

  if (!img || !carrito) {
    console.warn('❌ No se encontró la imagen o el carrito');
    return;
  }

  const imgRect = img.getBoundingClientRect();
  const carritoRect = carrito.getBoundingClientRect();

  const animImg = img.cloneNode(true) as HTMLImageElement;
  animImg.classList.add('producto-img-clon');
  animImg.style.left = `${imgRect.left + window.scrollX}px`;
  animImg.style.top = `${imgRect.top + window.scrollY}px`;
  animImg.style.width = `${imgRect.width}px`;
  animImg.style.height = `${imgRect.height}px`;

  document.body.appendChild(animImg);

  const destinoX = carritoRect.left + carritoRect.width / 2 + window.scrollX - imgRect.width / 2;
  const destinoY = carritoRect.top + carritoRect.height / 2 + window.scrollY - imgRect.height / 2;

  setTimeout(() => {
    animImg.style.left = `${destinoX}px`;
    animImg.style.top = `${destinoY}px`;
    animImg.style.transform = 'scale(0.2)';
    animImg.style.opacity = '0';
  }, 10);
  
  // 🕒 Esperamos justo antes del final (800ms de los 900)
  setTimeout(() => {
    carrito.classList.add('carrito-zoom');
    setTimeout(() => carrito.classList.remove('carrito-zoom'), 400); // misma duración que la animación
  }, 700);
  
  setTimeout(() => {
    animImg.remove();
  }, 900);
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
