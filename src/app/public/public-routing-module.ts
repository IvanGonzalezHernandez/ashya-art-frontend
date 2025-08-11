import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Layout } from './layout/layout';
import { Home } from './pages/home/home';
import { Workshops } from './pages/workshops/workshops';
import { Calendar } from './pages/calendar/calendar';
import { Shop } from './pages/shop/shop';
import { About } from './pages/about/about';
import { Studio } from './pages/studio/studio';
import { WorkshopsTabs } from '../shared/workshops-tabs/workshops-tabs';
import { ShopTabs } from '../shared/shop-tabs/shop-tabs';

const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', component: Home },
      {
        path: 'workshops',
        component: WorkshopsTabs,
        children: [
          { path: '', component: Workshops },
          { path: 'firing-services', loadComponent: () => import('./pages/firing-services/firing-services').then(m => m.FiringServices) },
          { path: 'gift-cards', loadComponent: () => import('./pages/gift-cards/gift-cards').then(m => m.GiftCards) },
        ]
      },
      {
        path: 'workshops/:id',
        loadComponent: () => import('./pages/workshops-detail/workshops-detail').then(m => m.WorkshopsDetail)
      },
      {
        path: 'shop',
        component: ShopTabs,
        children: [
          { path: '', component: Shop },
          { path: 'secrets', loadComponent: () => import('./pages/secrets/secrets').then(m => m.Secrets) },
        ]
      },
      { path: 'calendar', component: Calendar },
      { path: 'about', component: About },
      { path: 'studio', component: Studio }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule {}
