// checkout.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  constructor(private http: HttpClient) {}

  private baseUrl = 'http://127.0.0.1:8000/api';

  verificarCodigoDescuento(codigo: string): Observable<any> {
    const url = `${this.baseUrl}/verificar_descuento/?codigo=${codigo}`;
    return this.http.get<any>(url);
  }

  // 👇 Nuevo método para confirmar el pedido
  confirmarPedido(data: any): Observable<any> {
    // data = { user_id, items, direccion, descuento }
    return this.http.post<any>(`${this.baseUrl}/confirmar_pedido/`, data);
  }
}
