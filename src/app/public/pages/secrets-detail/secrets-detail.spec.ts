import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecretsDetail } from './secrets-detail';

describe('SecretsDetail', () => {
  let component: SecretsDetail;
  let fixture: ComponentFixture<SecretsDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecretsDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecretsDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
