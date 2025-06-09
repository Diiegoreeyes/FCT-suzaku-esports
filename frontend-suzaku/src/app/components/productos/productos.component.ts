import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../../services/producto.service';
import { CarritoService } from '../../services/carrito.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
  // 🛍️ Listas de producto
  productos: any[] = [];
  productosFiltrados: any[] = [];

  // 🔎 Filtros simples
  filtroNombre: string = '';
  precioMin: number | null = null;
  precioMax: number | null = null;
  filtroTipo: string = '';
  filtroCategoria: string = '';

  // ✅ Chequeados de multi‐selección
  filtroTallasSelected: string[] = [];
  filtroColoresSelected: string[] = [];

  // 📋 Opciones a mostrar en los selects y checks
  tiposDisponibles: string[] = [];
  categoriasDisponibles: string[] = [];
  tallasDisponibles: string[] = [];
  coloresDisponibles: { nombre: string; codigo_hex: string }[] = [];

  constructor(
    private productoService: ProductoService,
    private carritoService: CarritoService
  ) {}

  // 🔄 Al iniciar, carga los productos y rellena las listas de filtros
  ngOnInit(): void {
    this.cargarProductos();
  }

  // 📥 Obtiene todos los productos y extrae tipos, categorías, tallas y colores
  cargarProductos(): void {
    this.productoService.getProductos().subscribe({
      next: (data) => {
        this.productos = [...data];
        this.productosFiltrados = [...data];

        // Rellenar filtros únicos
        this.tiposDisponibles = Array.from(new Set(data.map(p => p.tipo.nombre)));
        this.categoriasDisponibles = Array.from(new Set(data.map(p => p.categoria.nombre)));
        this.tallasDisponibles = Array.from(new Set(
          data.flatMap(p => p.tallas.map((t: any) => t.nombre))
        ));
        this.coloresDisponibles = Array.from(
          new Map<string, { nombre: string; codigo_hex: string }>(
            data.flatMap(p => p.colores.map((c: any) => [c.nombre, c] as [string, { nombre: string; codigo_hex: string }]))
          ).values()
        );
        
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
      }
    });
  }

  // 🆕 Marca o desmarca una talla en el filtro
  onTallaToggle(talla: string, checked: boolean): void {
    if (checked) {
      this.filtroTallasSelected.push(talla);
    } else {
      this.filtroTallasSelected = this.filtroTallasSelected.filter(t => t !== talla);
    }
  }

  // 🆕 Marca o desmarca un color en el filtro
  onColorToggle(colorName: string, checked: boolean): void {
    if (checked) {
      this.filtroColoresSelected.push(colorName);
    } else {
      this.filtroColoresSelected = this.filtroColoresSelected.filter(c => c !== colorName);
    }
  }

  // 🔍 Aplica todos los filtros de forma combinada
  aplicarFiltros(): void {
    this.productosFiltrados = this.productos.filter(p => {
      const matchNombre = p.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase());
      const matchPrecioMin = this.precioMin == null || p.precio >= this.precioMin;
      const matchPrecioMax = this.precioMax == null || p.precio <= this.precioMax;
      const matchTipo = !this.filtroTipo || p.tipo.nombre === this.filtroTipo;
      const matchCategoria = !this.filtroCategoria || p.categoria.nombre === this.filtroCategoria;
      const matchTallas = this.filtroTallasSelected.length === 0 ||
        p.tallas.some((t: any) => this.filtroTallasSelected.includes(t.nombre));
      const matchColores = this.filtroColoresSelected.length === 0 ||
        p.colores.some((c: any) => this.filtroColoresSelected.includes(c.nombre));

      return (
        matchNombre &&
        matchPrecioMin &&
        matchPrecioMax &&
        matchTipo &&
        matchCategoria &&
        matchTallas &&
        matchColores
      );
    });
  }

  // 🔄 Resetea todos los filtros
  resetFiltros(): void {
    this.filtroNombre = '';
    this.precioMin = null;
    this.precioMax = null;
    this.filtroTipo = '';
    this.filtroCategoria = '';
    this.filtroTallasSelected = [];
    this.filtroColoresSelected = [];
    this.productosFiltrados = [...this.productos];
  }

  // 🛒 Agrega un producto al carrito con animación (ya existente)
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

  // 📸 Devuelve URL correcta de la foto
  getProductoFoto(url: string): string {
    if (!url) return 'assets/default-producto.jpg';
    return url.startsWith('http') ? url : `http://127.0.0.1:8000${url}`;
  }

  // 🔢 Para optimizar el *ngFor
  trackProducto(index: number, producto: any): number {
    return producto.id;
  }
}
