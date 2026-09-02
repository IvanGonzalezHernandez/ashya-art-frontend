import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.html'
})
export class ConfirmModalComponent {
  @Input() title: string = 'Confirm';
  @Input() message: string = 'Are you sure?';
  @Input() confirmLabel: string = 'Delete';
  @Input() cancelLabel: string = 'Cancel';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}
