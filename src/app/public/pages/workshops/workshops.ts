import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-workshops',
  standalone: true,
  templateUrl: './workshops.html',
  styleUrls: ['./workshops.scss'],
  imports: [CommonModule, RouterModule]
})
export class Workshops {}
