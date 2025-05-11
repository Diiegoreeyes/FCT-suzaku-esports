import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SponsorService {
  private api = 'http://127.0.0.1:8000/api/sponsors/';

  constructor(private http: HttpClient) {}

  listar(): Observable<any[]> { return this.http.get<any[]>(this.api); }
  crear(data: FormData) { return this.http.post(this.api, data); }
  actualizar(id: number, data: FormData) { return this.http.put(`${this.api}${id}/`, data); }
  eliminar(id: number) { return this.http.delete(`${this.api}${id}/`); }

  
}