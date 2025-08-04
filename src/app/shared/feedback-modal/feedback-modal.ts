import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-feedback-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feedback-modal.html'
})
export class FeedbackModalComponent {
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() status: 'success' | 'error' | 'info' = 'info';

  @Output() closed = new EventEmitter<void>();

  closeModal() {
    this.closed.emit();
  }
}
