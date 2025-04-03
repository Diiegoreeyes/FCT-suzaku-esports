import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RankingService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  // 🎮 Juegos
  getJuegos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/juegos/`);
  }
  crearJuego(juego: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/juegos/`, juego);
  }
  
  eliminarJuego(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/juegos/${id}/`);
  }
  actualizarJuego(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/juegos/${id}/`, data);
  }

  // 🏆 Competiciones
  getCompeticiones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/competiciones/`);
  }
  crearCompeticion(comp: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/competiciones/`, comp);
  }
  eliminarCompeticion(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/competiciones/${id}/`);
  }
  actualizarCompeticion(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/competiciones/${id}/`, data);
  }

  // 🛡️ Equipos Competitivos
  getEquiposCompetitivos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/equipos-competitivos/`);
  }
  crearEquipoCompetitivo(data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/equipos-competitivos/`, data);
  }
  eliminarEquipoCompetitivo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/equipos-competitivos/${id}/`);
  }
  actualizarEquipoCompetitivo(id: number, data: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/equipos-competitivos/${id}/`, data);
  }

  // 👥 Participantes
  getEquiposParticipantes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/equipos-participantes/`);
  }
  crearEquipoParticipante(part: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/equipos-participantes/`, part);
  }
  eliminarEquipoParticipante(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/equipos-participantes/${id}/`);
  }
  actualizarEquipoParticipante(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/equipos-participantes/${id}/`, data);
  }

  // ⚔️ Partidos
  getPartidos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/partidos/`);
  }
  crearPartido(p: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/partidos/`, p);
  }
  eliminarPartido(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/partidos/${id}/`);
  }
  actualizarPartido(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/partidos/${id}/`, data);
  }

  
}
