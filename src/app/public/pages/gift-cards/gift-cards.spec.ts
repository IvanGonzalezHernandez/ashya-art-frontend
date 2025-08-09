import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GiftCards } from './gift-cards';

describe('GiftCards', () => {
  let component: GiftCards;
  let fixture: ComponentFixture<GiftCards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GiftCards]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GiftCards);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
