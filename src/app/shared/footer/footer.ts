import { Component } from '@angular/core';
import { NewsletterService } from '../../services/newsletter/newsletter';
import { Newsletter } from '../../models/newsletter.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss']
})
export class Footer {

  emailSuscripcion: string = '';

  constructor(private newsletterService: NewsletterService) {}

  suscribirse() {
    if (!this.emailSuscripcion.trim()) {
      alert('Introduce un email válido');
      return;
    }

    const nuevoNewsletter: Partial<Newsletter> = {
      email: this.emailSuscripcion
    };

    this.newsletterService.suscribirse(nuevoNewsletter).subscribe({
      next: () => {
        this.emailSuscripcion = '';
        alert('¡Suscripción realizada con éxito!');
      },
      error: err => {
        console.error('Error al suscribirse:', err);
        alert('Ya estás suscrito o ha ocurrido un error.');
      }
    });
  }
}
