import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PublicRoutingModule } from './public-routing-module'; // <-- importa el routing

@NgModule({
  imports: [
    RouterModule,
    PublicRoutingModule
  ]
})
export class PublicModule {}