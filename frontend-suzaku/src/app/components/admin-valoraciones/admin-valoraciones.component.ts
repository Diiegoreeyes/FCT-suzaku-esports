import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-valoraciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-valoraciones.component.html',
  styleUrls: ['./admin-valoraciones.component.css']
})
export class AdminValoracionesComponent implements OnInit {
  valoraciones: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarValoraciones();
  }

  cargarValoraciones(): void {
    this.http.get<any[]>('http://127.0.0.1:8000/api/valoraciones/')
      .subscribe(res => {
        this.valoraciones = res;
      });
  }

  eliminarValoracion(id: number): void {
    if (confirm('¿Seguro que deseas eliminar esta valoración?')) {
      this.http.delete(`http://127.0.0.1:8000/api/valoraciones/${id}/`)
        .subscribe(() => {
          this.valoraciones = this.valoraciones.filter(v => v.id !== id);
        });
    }
  }

  respuestasEscritas: { [id: number]: string } = {};

  responderValoracion(val: any): void {
    const respuesta = this.respuestasEscritas[val.id];
    if (!respuesta?.trim()) return;
  
    this.http.patch(`http://127.0.0.1:8000/api/valoraciones/${val.id}/`, { respuesta }).subscribe(() => {
      val.respuesta = respuesta;
      this.modoEdicion[val.id] = false;
      this.respuestasEscritas[val.id] = '';
    });
  }
  
  modoEdicion: { [id: number]: boolean } = {};

  editarRespuesta(val: any): void {
    this.respuestasEscritas[val.id] = val.respuesta;
    this.modoEdicion[val.id] = true;
  }
  
  cancelarEdicion(val: any): void {
    this.modoEdicion[val.id] = false;
    this.respuestasEscritas[val.id] = '';
  }
  

}
