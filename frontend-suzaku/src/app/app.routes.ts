// routes.ts
import { Routes, CanActivateFn, Router } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProductosComponent } from './components/productos/productos.component';
import { CarritoComponent } from './components/carrito/carrito.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { CrearUsuarioComponent } from './components/crear-usuario/crear-usuario.component';
import { LoginComponent } from './components/login/login.component';
import { AuthService } from './services/auth.service';
import { PerfilLayoutComponent } from './components/perfil-layout/perfil-layout.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { MisPedidosComponent } from './components/mis-pedidos/mis-pedidos.component';
import { DireccionesComponent } from './components/direcciones/direcciones.component';
import { MetodosPagoComponent } from './components/metodos-pago/metodos-pago.component';
import { ConfiguracionComponent } from './components/configuracion/configuracion.component';
import { SeguridadComponent } from './components/seguridad/seguridad.component';
import { inject } from '@angular/core';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { AdminEquipoComponent } from './components/admin-equipo/admin-equipo.component';
import { AdminSponsorsComponent } from './components/admin-sponsors/admin-sponsors.component';
import { AdminPostComponent } from './components/admin-post/admin-post.component';
import { AdminPedidosComponent } from './components/admin-pedidos/admin-pedidos.component';
import { AdminListarproductoComponent } from './components/admin-listarproducto/admin-listarproducto.component';
import { EquipopublicComponent } from './components/equipopublic/equipopublic.component';
import { SponsorspublicComponent } from './components/sponsorspublic/sponsorspublic.component';
import { PublicLayoutComponent } from './components/public-layout/public-layout.component';
import { AdminRankingComponent } from './components/admin-ranking/admin-ranking.component';
import { AdminCodigosDescuentoComponent } from './components/admin-codigos-descuento/admin-codigos-descuento.component';
import { ProductoDetalleComponent } from './components/producto-detalle/producto-detalle.component';

const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (!authService.estaAutenticado()) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};

export const routes: Routes = [

  // 1) RUTAS PÚBLICAS, sin navbar
  { path: '', component: HomeComponent },
  {
    // El path 'equipo' primero carga `PublicLayoutComponent`
    path: 'equipo', component: PublicLayoutComponent,
    children: [
      { path: '', component: EquipopublicComponent },
    ]
  },
  {
    path: 'sponsors', component: PublicLayoutComponent,
    children: [
      { path: '', component: SponsorspublicComponent },
    ]
  },
  {
    path: 'administrador',
    canActivate: [AuthGuard], // Si quieres protegerlo
    component: AdminLayoutComponent, // 👈 Tu componente contenedor de admin
    children: [
      { path: '', redirectTo: 'listar-productos', pathMatch: 'full' },
      { path: 'listar-productos', component: AdminListarproductoComponent },
      { path: 'pedidos', component: AdminPedidosComponent },
      { path: 'post', component: AdminPostComponent },
      { path: 'equipo', component: AdminEquipoComponent },
      { path: 'sponsors', component: AdminSponsorsComponent },
      { path: 'ranking', component: AdminRankingComponent },
      { path: 'codigos-descuento', component: AdminCodigosDescuentoComponent }


    ]
  },

  { path: 'producto/:id', component: ProductoDetalleComponent },
  { path: 'productos', component: ProductosComponent },
  { path: 'carrito', component: CarritoComponent },
  { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] },
  { path: 'crear-usuario', component: CrearUsuarioComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'perfil',
    canActivate: [AuthGuard],
    component: PerfilLayoutComponent,
    children: [
      { path: '', component: PerfilComponent },             // Mi Perfil
      { path: 'mis-pedidos', component: MisPedidosComponent }, // Mis Pedidos
      { path: 'direcciones', component: DireccionesComponent }, // Direcciones
      { path: 'metodos-pago', component: MetodosPagoComponent },// Métodos de Pago
      { path: 'configuracion', component: ConfiguracionComponent }, // Preferencias
      { path: 'seguridad', component: SeguridadComponent },     // Seguridad

    ]
  },

];
