import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TarjetasRegaloDashboard } from './tarjetas-regalo-dashboard';

describe('TarjetasRegaloDashboard', () => {
  let component: TarjetasRegaloDashboard;
  let fixture: ComponentFixture<TarjetasRegaloDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TarjetasRegaloDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TarjetasRegaloDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
