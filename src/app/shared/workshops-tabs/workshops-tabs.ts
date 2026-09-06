import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-workshops-tabs',
  imports: [RouterModule, TranslatePipe],
  templateUrl: './workshops-tabs.html',
  styleUrl: './workshops-tabs.scss'
})
export class WorkshopsTabs {

}
