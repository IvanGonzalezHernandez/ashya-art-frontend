import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductosDashboard } from './productos-dashboard';

describe('ProductosDashboard', () => {
  let component: ProductosDashboard;
  let fixture: ComponentFixture<ProductosDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductosDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductosDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
