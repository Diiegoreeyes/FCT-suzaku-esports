// seguridad.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-seguridad',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './seguridad.component.html',
  styleUrls: ['./seguridad.component.css']
})
export class SeguridadComponent {
  seguridadForm: FormGroup;

  constructor(private fb: FormBuilder) {
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
    // Aquí implementas la lógica para cambiar la contraseña.
    alert('Contraseña cambiada exitosamente');
  }
}
