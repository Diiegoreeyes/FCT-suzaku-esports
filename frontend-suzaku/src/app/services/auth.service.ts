import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';  // ✅ Importar tap correctamente

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api/login/';

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<{ token: string; user_id: number }>(this.apiUrl, credentials)
      .pipe(
        tap((response) => {
          if (response?.token && response?.user_id) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('usuario_id', response.user_id.toString());
  
            // 👇 Nueva petición para obtener el usuario completo
            this.http.get(`http://127.0.0.1:8000/api/usuarios/${response.user_id}/`)
              .subscribe((usuario) => {
                localStorage.setItem('usuario', JSON.stringify(usuario));
                console.log('Usuario completo guardado:', usuario);
              });
          } else {
            console.error('La respuesta no contiene token o user_id:', response);
          }
        })
      );
  }
  
  
  
  
  guardarToken(token: string): void {
    // Solo acceder a localStorage si existe window
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('token', token);
    }
  }

  obtenerToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('token');
    }
    return null;
  }

  estaAutenticado(): boolean {
    const token = this.obtenerToken(); 
    return !!token; 
  }

  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('token');
    }
  }

  obtenerUserId(): number | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userId = localStorage.getItem('usuario_id');
      return userId ? parseInt(userId, 10) : null;
    }
    return null;
  }
  obtenerUsuarioActual(): any {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  }
  
getUserFoto(): string {
  const user = this.obtenerUsuarioActual();

  if (user?.foto) {
    if (user.foto.startsWith('http')) {
      return user.foto;
    }
    return 'http://127.0.0.1:8000' + user.foto;
  }

  // ⛑️ Imagen por defecto servida desde el backend (en /media/usuarios/default-user.png)
  return 'http://127.0.0.1:8000/media/usuarios/default-user.png';
}

  
  
}
