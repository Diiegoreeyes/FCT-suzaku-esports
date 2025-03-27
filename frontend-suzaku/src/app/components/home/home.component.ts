import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  constructor(private router: Router) {}

  navegarSobreNosotros(): void {
    this.router.navigate(['/equipo']); 
    // Ajusta la ruta según hayas definido tu "EquipoPublicComponent"
  }

  navegarTienda(): void {
    this.router.navigate(['/productos']);
    // Ajusta la ruta si tu tienda se llama distinto
  }

  navegarSponsors(): void {
    this.router.navigate(['/sponsors']);
    // Ajusta la ruta a tu "SponsorsPublicComponent"
  }
}
