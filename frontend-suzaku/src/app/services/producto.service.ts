import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';


@Injectable({
 providedIn: 'root'
})
export class ProductoService {
 private apiUrl = 'http://127.0.0.1:8000/api/productos/'; // 👈 Ajusta la URL si es diferente


 constructor(private http: HttpClient) {}


  getProductos(): Observable<any[]> {
    console.log('Llamando a la API:', this.apiUrl);
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Error en la API:', error);
        return of([]); // Devuelve un array vacío en caso de error
      })
    );
  }
  //Para el admin
  getProducto(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${id}/`).pipe(
      catchError((error) => {
        console.error(`Error al obtener el producto con ID ${id}:`, error);
        return of(null);
      })
    );
  }
  

  crearProducto(data: any): Observable<any> {
    return this.http.post<any>('http://127.0.0.1:8000/api/productos/', data);
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete<any>(`http://127.0.0.1:8000/api/productos/${id}/`);
  }

  actualizarProducto(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}${id}/`, data); // 👈 Este es el que te falta
  }
  obtenerPedidos(): Observable<any[]> {
    return this.http.get<any[]>('http://127.0.0.1:8000/api/pedidos/');
  }
  
  actualizarEstadoPedido(pedidoId: number, estado: string): Observable<any> {
    return this.http.patch(`http://127.0.0.1:8000/api/pedidos/${pedidoId}/`, { estado });
  }
 }



