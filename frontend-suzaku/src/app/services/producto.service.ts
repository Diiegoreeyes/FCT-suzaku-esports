import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';


@Injectable({
 providedIn: 'root'
})
export class ProductoService {
 private apiUrl = 'http://127.0.0.1:8000/api/productos/'; // 👈 Ajusta la URL si es diferente
 private api = 'http://127.0.0.1:8000/api';


 constructor(private http: HttpClient) {}

 obtenerProducto(id: number): Observable<any> {
  return this.http.get(`/api/productos/${id}`); // ← SIN barra al final
}


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
  
  /* ──────── COLORES ──────── */
  getColores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/colores/`);
  }

  crearColor(data: any): Observable<any> {
    return this.http.post<any>(`${this.api}/colores/`, data);
  }

  actualizarColor(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.api}/colores/${id}/`, data);
  }

  eliminarColor(id: number): Observable<any> {
    return this.http.delete<any>(`${this.api}/colores/${id}/`);
  }

  /* ──────── TALLAS ──────── */
  getTallas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/tallas/`);
  }

  crearTalla(data: any): Observable<any> {
    return this.http.post<any>(`${this.api}/tallas/`, data);
  }

  actualizarTalla(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.api}/tallas/${id}/`, data);
  }

  eliminarTalla(id: number): Observable<any> {
    return this.http.delete<any>(`${this.api}/tallas/${id}/`);
  }

  /* ──────── TIPOS ──────── */
  getTipos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/tipos/`);
  }

  crearTipo(data: any): Observable<any> {
    return this.http.post<any>(`${this.api}/tipos/`, data);
  }

  actualizarTipo(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.api}/tipos/${id}/`, data);
  }

  eliminarTipo(id: number): Observable<any> {
    return this.http.delete<any>(`${this.api}/tipos/${id}/`);
  }

  /* ──────── CATEGORÍAS ──────── */
  getCategorias(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/categorias/`);
  }

  crearCategoria(data: any): Observable<any> {
    return this.http.post<any>(`${this.api}/categorias/`, data);
  }

  actualizarCategoria(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.api}/categorias/${id}/`, data);
  }

  eliminarCategoria(id: number): Observable<any> {
    return this.http.delete<any>(`${this.api}/categorias/${id}/`);
  }

  getStock(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/stock/`);
  }
  crearStock(data: any): Observable<any> {
    return this.http.post<any>(`${this.api}/stock/`, data);
  }
  actualizarStock(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.api}/stock/${id}/`, data);
  }
  eliminarStock(id: number): Observable<any> {
    return this.http.delete<any>(`${this.api}/stock/${id}/`);
  }
  subirImagenGaleria(fd: FormData) {
    return this.http.post('http://127.0.0.1:8000/api/productoimagen/', fd);
  }

  eliminarImagenGaleria(id: number) {
    return this.http.delete(`${this.api}/imagenes/${id}/`);
  }

  obtenerProductoDetalle(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${id}/detalle/`);
  }
  
  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl); 
  }
  
  // producto.service.ts
  borrarImagenPorId(id: number) {
    return this.http.delete(`http://127.0.0.1:8000/api/productoimagen/${id}/`);
  }


  
 }



