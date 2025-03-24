// configuracion.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- Importa FormsModule

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule], // <-- Agrega FormsModule aquí
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css']
})
export class ConfiguracionComponent {
  notificaciones: boolean = true;
}
