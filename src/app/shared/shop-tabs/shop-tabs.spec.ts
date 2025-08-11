import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopTabs } from './shop-tabs';

describe('ShopTabs', () => {
  let component: ShopTabs;
  let fixture: ComponentFixture<ShopTabs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopTabs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShopTabs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
