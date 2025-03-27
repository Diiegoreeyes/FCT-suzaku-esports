import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-pedidos.component.html',
  styleUrls: ['./admin-pedidos.component.css']
})
export class AdminPedidosComponent implements OnInit {
  pedidos: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Cargar todos los pedidos (versión admin)
    this.obtenerPedidos().subscribe({
      next: (data: any[]) => {
        this.pedidos = data;
        console.log('Pedidos cargados:', this.pedidos);
      },
      error: (err: any) => {
        console.error('Error al cargar pedidos:', err);
      }
    });
  }

  obtenerPedidos(): Observable<any[]> {
    // Asumimos que tienes un PedidoViewSet en /api/pedidos/
    // que devuelve todos los pedidos sin filtrar. 
    // Reutiliza el mismo serializer con productos[] y sus campos (foto, nombre...).
    return this.http.get<any[]>('http://127.0.0.1:8000/api/pedidos/');
  }

  actualizarEstado(pedido: any): void {
    // Hacer PATCH a /api/pedidos/<id>/ para cambiar estado
    this.http.patch(`http://127.0.0.1:8000/api/pedidos/${pedido.id}/`, { estado: pedido.estado })
      .subscribe({
        next: () => {
          console.log(`Estado del pedido ${pedido.id} actualizado a ${pedido.estado}`);
        },
        error: () => {
          alert('Error al actualizar estado del pedido');
        }
      });
  }

  // Igual que en “Mis Pedidos”: construye la URL de la foto
  getFotoUrl(foto: string | null): string {
    if (!foto) return 'assets/default-producto.jpg'; 
    if (foto.startsWith('http')) return foto;
    return `http://127.0.0.1:8000${foto.startsWith('/') ? '' : '/'}${foto}`;
  }
}
