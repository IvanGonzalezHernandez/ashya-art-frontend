import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MaintenanceService } from '../../../services/maintenance/maintenance';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="wrap">
      <div class="card">
        <h1 class="title">Ashya Art</h1>
        <p class="subtitle">We are currently updating the website.</p>

        <div class="box">
          <label class="label">Access password</label>
          <input
            class="input"
            type="password"
            [(ngModel)]="pass"
            (keydown.enter)="enter()"
            placeholder="Enter password" />

          <button class="btn" type="button" (click)="enter()">Enter</button>

          <p class="error" *ngIf="error">Incorrect password</p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .wrap{
      min-height: 100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      padding: 24px;
      background: #f7f3ee;
    }
    .card{
      width: min(460px, 100%);
      background: #fff;
      border-radius: 26px;
      padding: 28px;
      box-shadow: 0 25px 60px rgba(0,0,0,.12);
      text-align:center;
      border: 1px solid rgba(62,48,40,.12);
    }
    .title{ margin:0; color:#3E3028; font-weight:800; }
    .subtitle{ margin:10px 0 18px; color:#6b5e52; font-size:15px; }
    .box{ display:flex; flex-direction:column; gap:12px; }
    .label{ text-align:left; font-weight:600; color:#3E3028; font-size:13px; }
    .input{
      border-radius: 14px;
      padding: 12px 14px;
      border: 1px solid rgba(62,48,40,.25);
      outline: none;
      font-size: 14px;
    }
    .btn{
      border: none;
      border-radius: 999px;
      padding: 12px 18px;
      background: #2f6f8a;
      color: #fff;
      font-weight: 700;
      cursor: pointer;
    }
    .error{ margin:0; color:#b42318; font-size:13px; }
  `]
})
export class MaintenanceComponent {
  pass = '';
  error = false;

  constructor(
    private maintenance: MaintenanceService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  enter(): void {
    this.error = false;

    if (this.maintenance.unlock(this.pass)) {
      const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/';
      this.router.navigateByUrl(redirect);
    } else {
      this.error = true;
    }
  }
}
