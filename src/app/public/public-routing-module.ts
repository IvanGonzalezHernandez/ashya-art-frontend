import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Layout } from './layout/layout';
import { Home } from './pages/home/home';
import { Workshops } from './pages/workshops/workshops';
import { Calendar } from './pages/calendar/calendar';
import { Shop } from './pages/shop/shop';
import { About } from './pages/about/about';
import { Studio } from './pages/studio/studio';
import { RouteSeo } from '../services/seo/seo';

/** SEO de una página estática: claves i18n SEO.<KEY>_TITLE y SEO.<KEY>_DESC */
const seo = (key: string): { seo: RouteSeo } => ({
  seo: { titleKey: `SEO.${key}_TITLE`, descriptionKey: `SEO.${key}_DESC` }
});

/** Fichas que fijan su propio SEO al cargar los datos de la API */
const dynamicSeo: { seo: RouteSeo } = { seo: { dynamic: true } };

const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', component: Home, data: { seo: { ...seo('HOME').seo, structuredData: 'business' } } },
      {
        path: 'workshops',
        children: [
          { path: '', component: Workshops, data: seo('WORKSHOPS') },
          { path: 'firing-services', loadComponent: () => import('./pages/firing-services/firing-services').then(m => m.FiringServices), data: seo('FIRING') },
          { path: 'gift-cards', loadComponent: () => import('./pages/gift-cards/gift-cards').then(m => m.GiftCards), data: seo('GIFT_CARDS') },
        ]
      },
      {
        path: 'gift-cards/:id',
        loadComponent: () => import('./pages/gift-cards-detail/gift-cards-detail').then(m => m.GiftCardsDetail),
        data: dynamicSeo
      },
      {
        path: 'workshops/:id',
        loadComponent: () => import('./pages/workshops-detail/workshops-detail').then(m => m.WorkshopsDetail),
        data: dynamicSeo
      },
      {
        path: 'products/:id',
        loadComponent: () => import('./pages/ceramics-detail/ceramics-detail').then(m => m.CeramicsDetail),
        data: dynamicSeo
      },
      { path: 'shop', component: Shop, data: seo('SHOP') },
      { path: 'calendar', component: Calendar, data: seo('CALENDAR') },
      { path: 'about', component: About, data: seo('ABOUT') },
      { path: 'studio', component: Studio, data: seo('STUDIO') },
      { path: 'conditions', loadComponent: () => import('./pages/shipping/shipping').then(m => m.Shipping), data: seo('CONDITIONS') },
      { path: 'imprint', loadComponent: () => import('./pages/imprint/imprint').then(m => m.Imprint), data: seo('IMPRINT') },
      { path: 'privacy-policy', loadComponent: () => import('./pages/privacy-policy/privacy-policy').then(m => m.PrivacyPolicy), data: seo('PRIVACY') },

      // Cualquier otra ruta: página 404 con noindex (antes redirigía a la home, que Google trata como contenido duplicado)
      {
        path: '**',
        loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFound),
        data: { seo: { titleKey: 'SEO.NOT_FOUND_TITLE', noindex: true } }
      },
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule {}
