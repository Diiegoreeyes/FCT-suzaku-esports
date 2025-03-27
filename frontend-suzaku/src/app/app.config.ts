import { ApplicationConfig } from '@angular/core';  // ✅ Importar correctamente
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch,withInterceptors } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';  // ✅ Importar ReactiveFormsModule
import { interceptor } from './services/interceptor.service'; // Importa la función del interceptor

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // ✅ Usa una única llamada a provideHttpClient
    provideHttpClient(
      withFetch(),
      withInterceptors([interceptor])
    )
  ]
};