import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GiftCardsDetail } from './gift-cards-detail';

describe('GiftCardsDetail', () => {
  let component: GiftCardsDetail;
  let fixture: ComponentFixture<GiftCardsDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GiftCardsDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GiftCardsDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
