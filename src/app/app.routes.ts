import { Routes } from '@angular/router';


export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./public/public-module').then(m => m.PublicModule)
  },
  {
    path: 'private',
    loadChildren: () => import('./private/private-module').then(m => m.PrivateModule)
  },
  { path: '**', redirectTo: '' }
];
