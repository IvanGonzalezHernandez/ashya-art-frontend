import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Workshops } from './workshops';

describe('Workshops', () => {
  let component: Workshops;
  let fixture: ComponentFixture<Workshops>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Workshops]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Workshops);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
