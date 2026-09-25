import { Routes } from '@angular/router';
import { maintenanceGuard } from './public/guards/maintenance.guard';
import { MaintenanceComponent } from './public/pages/maintenance/maintenance';

export const routes: Routes = [
  // Siempre accesible
  {
    path: 'maintenance',
    component: MaintenanceComponent,
    data: { seo: { titleKey: 'SEO.MAINTENANCE_TITLE', noindex: true } }
  },

  // Privada SIN maintenance. Va antes de la pública porque esta termina en '**' (404).
  {
    path: 'private',
    loadChildren: () => import('./private/private-module').then(m => m.PrivateModule),
    data: { seo: { titleKey: 'SEO.PRIVATE_TITLE', noindex: true } }
  },

  // Pública bloqueada en maintenance (incluye la 404 para rutas desconocidas)
  {
    path: '',
    canActivate: [maintenanceGuard],
    loadChildren: () => import('./public/public-module').then(m => m.PublicModule)
  }
];
