import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CeramicsDetail } from './ceramics-detail';

describe('CeramicsDetail', () => {
  let component: CeramicsDetail;
  let fixture: ComponentFixture<CeramicsDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CeramicsDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CeramicsDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
