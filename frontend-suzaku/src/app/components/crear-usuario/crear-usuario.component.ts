import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';

// Validador de coincidencia de contraseña
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const formGroup = control as FormGroup;
  const pass = formGroup.get('password')?.value;
  const confirm = formGroup.get('confirmPassword')?.value;
  return pass === confirm ? null : { passwordsNotMatching: true };
}

@Component({
  selector: 'app-crear-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './crear-usuario.component.html',
  styleUrls: ['./crear-usuario.component.css']
})
export class CrearUsuarioComponent {
  usuarioForm: FormGroup;
  fileToUpload: File | null = null;

  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router        // ← Inyectamos el Router
  ) {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      direccion: [''],
      foto: [null]
    }, {
      validators: passwordMatchValidator
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) this.fileToUpload = file;
  }

  get passwordsNotMatching(): boolean {
    const confirmTouched = this.usuarioForm.get('confirmPassword')?.touched ?? false;
    return this.usuarioForm.hasError('passwordsNotMatching') && confirmTouched;
  }
  

  onSubmit(): void {
    this.usuarioForm.markAllAsTouched();
    if (this.usuarioForm.invalid) {
      console.log('Formulario inválido o contraseñas no coinciden.');
      return;
    }

    const formData = new FormData();
    formData.append('nombre', this.usuarioForm.get('nombre')?.value);
    formData.append('apellidos', this.usuarioForm.get('apellidos')?.value);
    formData.append('email', this.usuarioForm.get('email')?.value);
    formData.append('password', this.usuarioForm.get('password')?.value);
    formData.append('direccion', this.usuarioForm.get('direccion')?.value);
    if (this.fileToUpload) {
      formData.append('foto', this.fileToUpload, this.fileToUpload.name);
    }

    this.usuarioService.crearUsuario(formData).subscribe(
      _ => {
        alert('Usuario creado exitosamente');
        // → Redirige al login tras registro exitoso
        this.router.navigate(['/login']);
      },
      err => {
        console.error('Error al crear usuario', err);
        alert('Error al crear el usuario. Por favor, intenta nuevamente.');
      }
    );
  }
}
