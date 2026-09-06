import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
  selector: 'app-shipping',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './shipping.html'
})
export class Shipping {}
