import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../services/pedido.service';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mis-pedidos.component.html',
  styleUrls: ['./mis-pedidos.component.css']
})
export class MisPedidosComponent implements OnInit {
  pedidos: any[] = [];
  usuarioId: number | null = null;

  constructor(
    private pedidoService: PedidoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.usuarioId = this.authService.obtenerUserId();
    if (this.usuarioId !== null) {
      this.cargarMisPedidos();
    } else {
      console.error('No se encontró usuario_id en localStorage.');
    }
  }

  cargarMisPedidos(): void {
    if (!this.usuarioId) {
      console.error('Usuario no autenticado.');
      return;
    }

    this.pedidoService.listarPedidosDelUsuario(this.usuarioId).subscribe({
      next: (data) => {
        this.pedidos = data;
      },
      error: () => {
        console.error('Error al cargar pedidos.');
      }
    });
  }

  // Construye la URL completa de la foto si la ruta no viene completa.
  getProductoFoto(foto: string): string {
    if (!foto) {
      return 'assets/default-producto.jpg';
    }
    if (foto.startsWith('http')) {
      return foto;
    }
    return `http://127.0.0.1:8000${foto.startsWith('/') ? '' : '/'}${foto}`;
  }
}
