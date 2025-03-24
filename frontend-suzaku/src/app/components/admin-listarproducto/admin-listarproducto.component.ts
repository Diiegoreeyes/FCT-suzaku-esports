import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../../services/producto.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router'; // Para los enlaces

import { CommonModule } from '@angular/common'; // <-- IMPORTANTE

@Component({
  selector: 'app-admin-listarproducto',
  templateUrl: './admin-listarproducto.component.html',
  imports: [CommonModule, RouterModule], // <-- Asegúrate de importar esto
  styleUrls: ['./admin-listarproducto.component.css']
})
export class AdminListarproductoComponent implements OnInit {
  productos: any[] = [];

  constructor(
    private productoService: ProductoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productoService.getProductos().subscribe({
      next: (data) => {
        this.productos = data;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
      }
    });
  }

  editarProducto(id: number): void {
    this.router.navigate(['/administrador/editar-producto', id]);
  }

  eliminarProducto(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      this.productoService.eliminarProducto(id).subscribe({
        next: () => {
          this.productos = this.productos.filter(p => p.id !== id);
        },
        error: (error) => {
          console.error('Error al eliminar producto:', error);
        }
      });
    }
  }

  getFoto(foto: string): string {
    if (!foto) return 'assets/default-producto.jpg';
    if (foto.startsWith('http')) return foto;
    return `http://127.0.0.1:8000${foto.startsWith('/') ? '' : '/'}${foto}`;
  }
}
