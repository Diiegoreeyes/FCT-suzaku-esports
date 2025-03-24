import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private baseUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  // Listar todos los pedidos de un usuario
  listarPedidosDelUsuario(usuarioId: number): Observable<any> {
    // Podrías tener un endpoint /api/pedidos/?usuario=usuarioId
    // o algo que devuelva solo los pedidos del user
    const url = `http://127.0.0.1:8000/api/mis-pedidos/?usuario=${usuarioId}`;
    return this.http.get(url);
  }
}
