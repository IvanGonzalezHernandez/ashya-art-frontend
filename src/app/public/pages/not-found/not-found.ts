import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule, TranslatePipe],
  templateUrl: './not-found.html'
})
export class NotFound {}
