// usuario.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://127.0.0.1:8000/api/usuarios/';  // URL de la API

  constructor(private http: HttpClient) {}

  // Método para crear un nuevo usuario
  crearUsuario(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }

  // 1. Obtener datos de un usuario por ID
  getUsuario(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${id}/`);
  }

  // 2. Actualizar datos de un usuario por ID (dirección, foto, etc.)
  updateUsuario(id: number, formData: FormData): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}${id}/`, formData);
  }
}
