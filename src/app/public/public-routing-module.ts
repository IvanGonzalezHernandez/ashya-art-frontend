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
        path: 'gift-cards/:id',
        loadComponent: () => import('./pages/gift-cards-detail/gift-cards-detail').then(m => m.GiftCardsDetail)
      },
      {
        path: 'workshops/:id',
        loadComponent: () => import('./pages/workshops-detail/workshops-detail').then(m => m.WorkshopsDetail)
      },
      {
        path: 'products/:id',
        loadComponent: () => import('./pages/ceramics-detail/ceramics-detail').then(m => m.CeramicsDetail)
      },
            {
        path: 'secrets/:id',
        loadComponent: () => import('./pages/secrets-detail/secrets-detail').then(m => m.SecretsDetail)
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
      { path: 'studio', component: Studio },
      { path: 'conditions', loadComponent: () => import('./pages/shipping/shipping').then(m => m.Shipping) },
      { path: 'imprint', loadComponent: () => import('./pages/imprint/imprint').then(m => m.Imprint) },
      { path: 'privacy-policy', loadComponent: () => import('./pages/privacy-policy/privacy-policy').then(m => m.PrivacyPolicy) },

    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule {}
