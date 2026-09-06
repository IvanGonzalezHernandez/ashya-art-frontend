import { Component } from '@angular/core';
import { RevealAnimateDirective } from '../../../utils/Reveal- animate-directive';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-about',
  imports: [RevealAnimateDirective, TranslatePipe],
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class About {

}
