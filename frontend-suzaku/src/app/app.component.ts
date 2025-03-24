import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { NavbarComponent } from './components/navbar/navbar.component'; // 👈 Importar tu componente

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,         // 👈 Agregarlo aquí
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {
  // Lógica de tu componente principal

  
}
