import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackModal } from './feedback-modal';

describe('FeedbackModal', () => {
  let component: FeedbackModal;
  let fixture: ComponentFixture<FeedbackModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedbackModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
