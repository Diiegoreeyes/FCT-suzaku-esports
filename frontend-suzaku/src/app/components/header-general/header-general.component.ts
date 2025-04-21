import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-general',
  templateUrl: './header-general.component.html',
  styleUrls: ['./header-general.component.css'],
  standalone: true
})
export class HeaderGeneralComponent {
  constructor(private router: Router) {}

  irAlInicio() {
    this.router.navigate(['/']);
  }
}
