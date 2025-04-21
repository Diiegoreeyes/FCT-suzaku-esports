import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeaderGeneralComponent } from './components/header-general/header-general.component';
import { FooterGeneralComponent } from './components/footer-general/footer-general.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, HeaderGeneralComponent,FooterGeneralComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  showNav = true;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const actualUrl = event.urlAfterRedirects;
  
        // "Desactivamos" nav en:
        // 1) Home EXACTO ("/")
        // 2) Rutas que empiezan con /equipo, /sponsors o /administrador
        if (
          actualUrl === '/'
          || actualUrl.startsWith('/equipo')
          || actualUrl.startsWith('/sponsors')
          || actualUrl.startsWith('/administrador')
        ) {
          this.showNav = false;
        } else {
          this.showNav = true;
        }
      });
  }
  
}
