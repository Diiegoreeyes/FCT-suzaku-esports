// perfil.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { FormGroup as AngularFormGroup } from '@angular/forms'; // Para evitar conflictos, si es necesario
import { RouterModule } from '@angular/router'
@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  // Inicialización predeterminada del FormGroup para evitar el error en el template
  perfilForm: FormGroup = new FormGroup({});
  fotoSeleccionada: File | null = null;
  usuarioId: number | null = null; // Eliminamos el ID fijo
  fotoUrl: string | null = null; // Para la imagen actual

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private authService: AuthService
  ) {}


  ngOnInit(): void {
    let storedUserId: string | null = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      storedUserId = localStorage.getItem('usuario_id');
    }
    
    this.usuarioId = storedUserId ? parseInt(storedUserId, 10) : null;
    
    if (!this.usuarioId) {
      console.error('No se encontró usuario logueado.');
      return;
    }
    
    // Crear el formulario
    this.perfilForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
    
    // Cargar datos del usuario
    this.usuarioService.getUsuario(this.usuarioId).subscribe({
      next: (user) => {
        this.perfilForm.patchValue({
          nombre: user.nombre || '',
          apellidos: user.apellidos || '',
          email: user.email || ''
        });

        if (user.foto) {
          this.fotoUrl = user.foto;
        }

        // 🔄 Refrescar localStorage actualizado
        localStorage.setItem('usuario', JSON.stringify(user));
      },
      error: (err) => {
        console.error('Error al refrescar datos del usuario', err);
      }
    });

  }
  
  

  // Manejar el cambio de archivo para la foto
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fotoSeleccionada = file;
    }
  }

guardar(): void {
  console.log('Método guardar iniciado');
  if (this.perfilForm.invalid) {
    console.log('Formulario inválido');
    return;
  }

  const formData = new FormData();
  formData.append('nombre', this.perfilForm.get('nombre')?.value);
  formData.append('apellidos', this.perfilForm.get('apellidos')?.value);
  formData.append('email', this.perfilForm.get('email')?.value);

  if (this.fotoSeleccionada) {
    formData.append('foto', this.fotoSeleccionada, this.fotoSeleccionada.name);
  }

  if (!this.usuarioId) {
    console.error('No se encontró usuario logueado para actualizar');
    return;
  }

  console.log('Enviando datos de actualización:', formData);

  this.usuarioService.updateUsuario(this.usuarioId, formData).subscribe({
    next: (res) => {
      console.log('Respuesta de actualización:', res);
      alert('Perfil actualizado exitosamente');

      // ✅ Refrescar los datos del usuario y actualizar el localStorage
      this.usuarioService.getUsuario(this.usuarioId!).subscribe({
        next: (user) => {
          console.log('Datos actualizados del usuario:', user);
          localStorage.setItem('usuario', JSON.stringify(user));  // ✅ actualiza el localStorage
          if (user.foto) {
            this.fotoUrl = user.foto;
          }

          // ✅ ACTUALIZAR localStorage para que el navbar muestre la foto nueva
          localStorage.setItem('usuario', JSON.stringify(user));
        },
        error: (err) => {
          console.error('Error al refrescar datos del usuario', err);
        }
      });
    },
    error: (err) => {
      console.error('Error al actualizar perfil', err);
    }
  });
}

  
}
