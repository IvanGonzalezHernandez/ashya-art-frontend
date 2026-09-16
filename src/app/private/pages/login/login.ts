// src/app/components/login/login.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService, AuthResponse } from '../../../services/login/auth';
import { FeedbackModalComponent } from '../../../shared/feedback-modal/feedback-modal';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, FeedbackModalComponent],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  email = '';
  password = '';

  mostrarFeedback = false;
  feedbackTitulo = '';
  feedbackMensaje = '';
  feedbackTipo: 'success' | 'error' | 'info' = 'error';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    this.authService.login(this.email, this.password).subscribe({
      next: (res: AuthResponse) => {
        this.authService.guardarToken(res.token);
        this.router.navigate(['/private/dashboard/inicio']);
      },
      error: () => {
        this.mostrarModalFeedback('error', 'Login failed', 'Invalid email or password.');
      }
    });
  }

  mostrarModalFeedback(tipo: 'success' | 'error' | 'info', titulo: string, mensaje: string) {
    this.feedbackTipo = tipo;
    this.feedbackTitulo = titulo;
    this.feedbackMensaje = mensaje;
    this.mostrarFeedback = true;
  }

  cerrarFeedback() {
    this.mostrarFeedback = false;
  }
}
