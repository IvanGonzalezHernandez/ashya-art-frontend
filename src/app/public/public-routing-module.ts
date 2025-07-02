import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Layout } from './layout/layout';
import { Home } from './pages/home/home';
import { Workshops } from './pages/workshops/workshops';
import { Calendar } from './pages/calendar/calendar';
import { Shop } from './pages/shop/shop';
import { About } from './pages/about/about';
import { Studio } from './pages/studio/studio';

const routes: Routes = [
  {
    path: '',
    component: Layout, // layout con navbar/footer
    children: [
      { path: '', component: Home },
      { path: 'workshops', component: Workshops },
      { path: 'calendar', component: Calendar },
      { path: 'shop', component: Shop },
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
