import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Layout } from './layout/layout';
import { Dashboard } from './pages/dashboard/dashboard';

import { CursosDashboard } from './pages/cursos-dashboard/cursos-dashboard';
import { ReservasDashboard } from './pages/reservas-dashboard/reservas-dashboard';
import { ProductosDashboard } from './pages/productos-dashboard/productos-dashboard';
import { TarjetasRegaloDashboard } from './pages/tarjetas-regalo-dashboard/tarjetas-regalo-dashboard';
import { ClientesDashboard } from './pages/clientes-dashboard/clientes-dashboard';
import { NewsletterDashboard } from './pages/newsletter-dashboard/newsletter-dashboard';


const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: 'dashboard',
    component: Layout, // layout privado con aside y router-outlet
    children: [
      { path: 'inicio', component: Dashboard },
      { path: 'cursos', component: CursosDashboard },             
      { path: 'reservas', component: ReservasDashboard },         
      { path: 'productos', component: ProductosDashboard },       
      { path: 'tarjetas-regalo', component: TarjetasRegaloDashboard },
      { path: 'clientes', component: ClientesDashboard },
      { path: 'newsletter', component: NewsletterDashboard }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrivateRoutingModule {}
