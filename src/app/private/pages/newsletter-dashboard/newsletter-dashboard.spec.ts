import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsletterDashboard } from './newsletter-dashboard';

describe('NewsletterDashboard', () => {
  let component: NewsletterDashboard;
  let fixture: ComponentFixture<NewsletterDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsletterDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsletterDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
