import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-equipopublic',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './equipopublic.component.html',
  styleUrls: ['./equipopublic.component.css']
})
export class EquipopublicComponent implements OnInit {
  
  posts: any[] = [];
  integrantes: any[] = [];
  integrantesFiltrados: any[] = [];
  filtroTipo = 'jugador';  // “jugador” o “creador”

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarPosts();       // <-- Reponemos esta llamada
    this.cargarIntegrantes(); // <-- Ya estaba
  }

  // Método para obtener los posts
  cargarPosts(): void {
    this.http.get<any[]>('http://127.0.0.1:8000/api/post-equipo/')
      .subscribe({
        next: (data) => {
          this.posts = data;  // Asigna el array de posts
        },
        error: (err) => {
          console.error('Error al cargar posts del equipo:', err);
        }
      });
  }

  // Método para obtener el equipo (jugadores/creadores)
  cargarIntegrantes(): void {
    this.http.get<any[]>('http://127.0.0.1:8000/api/equipo/')
      .subscribe({
        next: (data) => {
          this.integrantes = data;
          this.filtrarIntegrantes();
        },
        error: (err) => {
          console.error('Error al cargar integrantes:', err);
        }
      });
  }

  filtrarIntegrantes(): void {
    this.integrantesFiltrados = this.integrantes.filter(i => i.tipo === this.filtroTipo);
  }

  seleccionarFiltro(tipo: string): void {
    this.filtroTipo = tipo;
    this.filtrarIntegrantes();
  }
}
