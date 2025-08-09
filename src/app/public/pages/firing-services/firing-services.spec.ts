import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiringServices } from './firing-services';

describe('FiringServices', () => {
  let component: FiringServices;
  let fixture: ComponentFixture<FiringServices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiringServices]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiringServices);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
