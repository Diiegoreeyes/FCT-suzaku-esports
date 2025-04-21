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
  clasificaciones: any[] = [];
  clasificacion: any[] = [];
  verClasificacion: { [torneoId: number]: boolean } = {};
  mostrarCompleto: { [torneoId: number]: boolean } = {};

  filtroTipo = 'jugador';  // “jugador” o “creador”

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarPosts();       // <-- Reponemos esta llamada
    this.cargarIntegrantes(); // <-- Ya estaba
    this.cargarClasificaciones();

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

  cargarClasificaciones(): void {
    this.http.get<any[]>('http://127.0.0.1:8000/api/equipos-participantes/')
      .subscribe({
        next: (data) => {
          const torneosAgrupados: any = {};
          data.forEach(p => {
            const id = p.competicion.id;
            if (!torneosAgrupados[id]) {
              torneosAgrupados[id] = {
                id: id,
                nombre: p.competicion.nombre,
                equipos: [],
                mostrarCompleto: false  // ← importante
              };
            }
            torneosAgrupados[id].equipos.push(p);
          });
  
          // Ordenamos y lo pasamos a array
          this.clasificacion = Object.values(torneosAgrupados);
          this.clasificacion.forEach(c => {
            c.equipos.sort((a: any, b: any) => b.puntos - a.puntos);
          });
        },
        error: (err) => console.error('Error al cargar clasificaciones:', err)
      });
  }
  

  toggleMostrarCompleto(torneo: any): void {
    torneo.mostrarCompleto = !torneo.mostrarCompleto;
  }
  toggleClasificacion(torneoId: number) {
    this.verClasificacion[torneoId] = !this.verClasificacion[torneoId];
  }
  
  mostrarSuzakuExtra(equipos: any[]): boolean {
    return equipos.findIndex(e => e.equipo_competitivo.nombre.toLowerCase() === 'suzaku') >= 3;
  }
  
  suzakuExtra(equipos: any[]): { equipo: any; posicion: number } | null {
    const posicion = equipos.findIndex(
      (e, i) => i >= 3 && e.equipo_competitivo.nombre.toLowerCase() === 'suzaku'
    );
    if (posicion >= 3) {
      return { equipo: equipos[posicion], posicion };
    }
    return null;
  }

  esSuzaku(equipo: any): boolean {
    return equipo.equipo_competitivo.nombre.toLowerCase() === 'suzaku';
  }
  
  getEquiposSinSuzaku(equipos: any[]): any[] {
    return equipos.slice(3).filter(e => !this.esSuzaku(e));
  }
  getEquiposRestantesSinSuzaku(equipos: any[]): any[] {
    return equipos.slice(3).filter(e => e.equipo_competitivo.nombre.toLowerCase() !== 'suzaku');
  }
  
  
  
  
}
