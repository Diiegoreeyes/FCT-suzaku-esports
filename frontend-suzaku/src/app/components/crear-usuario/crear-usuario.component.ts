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
import { RouterModule } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';




// Validador de coincidencia de contraseña
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
const formGroup = control as FormGroup;
const pass = formGroup.get('password')?.value;
const confirm = formGroup.get('confirmPassword')?.value;
if (pass === confirm) {
  return null;
} else {
  return { passwordsNotMatching: true };
}
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

// Booleans para mostrar/ocultar el texto de los inputs
showPassword: boolean = false;
showConfirmPassword: boolean = false;

constructor(private fb: FormBuilder, private usuarioService: UsuarioService) {
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

// Toggle para mostrar/ocultar la contraseña principal
togglePassword(): void {
  this.showPassword = !this.showPassword;
}

// Toggle para mostrar/ocultar la confirmación de contraseña
toggleConfirmPassword(): void {
  this.showConfirmPassword = !this.showConfirmPassword;
}

onSubmit(): void {
  // Marcamos todos los controles como "touched" para que se vean las validaciones al momento de Submit
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
    response => {
      console.log('Usuario creado correctamente', response);
      alert('Usuario creado exitosamente');
    },
    error => {
      console.error('Error al crear usuario', error);
      alert('Error al crear el usuario. Por favor, intenta nuevamente.');
    }
  );
}

onFileChange(event: any): void {
  const file = event.target.files[0];
  if (file) {
    this.fileToUpload = file;
  }
}

// Método para verificar si las contraseñas no coinciden y se ha "tocado" confirmPassword
get passwordsNotMatching(): boolean {
  return this.usuarioForm.hasError('passwordsNotMatching') &&
         this.usuarioForm.get('confirmPassword')?.touched === true;
}
}