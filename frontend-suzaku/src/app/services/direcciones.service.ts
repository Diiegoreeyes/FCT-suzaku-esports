import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DireccionesService {
  private apiUrl = 'http://127.0.0.1:8000/api/direcciones/';

  constructor(private http: HttpClient) { }

  getDirecciones(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {
      headers: {
        Authorization: `Token ${localStorage.getItem('token')}`
      }
    });
  }
  

  crearDireccion(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  actualizarDireccion(id: number, patchData: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}${id}/`, patchData);
  }

  eliminarDireccion(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}${id}/`);
  }

  // NUEVO MÉTODO: Retorna la dirección activa del usuario
  getDireccionActiva(): Observable<any> {
    // Ajusta la URL si tu endpoint es distinto (ej. /api/direcciones/activa/)
    return this.http.get<any>(`${this.apiUrl}activa/`);
  }
}
