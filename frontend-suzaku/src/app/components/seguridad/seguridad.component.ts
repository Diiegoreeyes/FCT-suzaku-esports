import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-seguridad',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './seguridad.component.html',
  styleUrls: ['./seguridad.component.css']
})
export class SeguridadComponent {
  seguridadForm: FormGroup;
  mensaje: string = '';
  error: string = '';
  cambiarPasswordForm: FormGroup = new FormGroup({});


  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) {
    this.seguridadForm = this.fb.group({
      passwordActual: ['', Validators.required],
      nuevaPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmarPassword: ['', Validators.required]
    });
  }
  

  cambiarPassword(): void {
    if (this.seguridadForm.invalid) {
      return;
    }

    const token = this.authService.obtenerToken();
    if (!token) {
      this.error = 'No se encontró el token de autenticación.';
      return;
    }

    const datos = {
      passwordActual: this.seguridadForm.value.passwordActual,
      nuevaPassword: this.seguridadForm.value.nuevaPassword,
      confirmarPassword: this.seguridadForm.value.confirmarPassword
    };

    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    this.usuarioService.cambiarPassword(datos).subscribe({
      next: (res) => {
        this.mensaje = res.mensaje;
        this.error = '';
        this.seguridadForm.reset();
      },
      error: (err: any) => {
        this.error = err.error?.error || 'Error al cambiar la contraseña';
        this.mensaje = '';
      }
    });

  }
}
