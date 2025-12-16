import { Routes } from '@angular/router';
import { maintenanceGuard } from './public/guards/maintenance.guard';
import { MaintenanceComponent } from './public/pages/maintenance/maintenance';

export const routes: Routes = [
  // Siempre accesible
  { path: 'maintenance', component: MaintenanceComponent },

  // Pública bloqueada en maintenance
  {
    path: '',
    canActivate: [maintenanceGuard],
    loadChildren: () => import('./public/public-module').then(m => m.PublicModule)
  },

  // Privada SIN maintenance
  {
    path: 'private',
    loadChildren: () => import('./private/private-module').then(m => m.PrivateModule)
  },

  { path: '**', redirectTo: '' }
];
