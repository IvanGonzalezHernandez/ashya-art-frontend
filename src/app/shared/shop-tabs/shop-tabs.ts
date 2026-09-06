import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-shop-tabs',
  imports: [RouterModule, TranslatePipe],
  templateUrl: './shop-tabs.html',
  styleUrl: './shop-tabs.scss'
})
export class ShopTabs {

}
