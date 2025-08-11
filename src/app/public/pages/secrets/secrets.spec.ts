import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Secrets } from './secrets';

describe('Secrets', () => {
  let component: Secrets;
  let fixture: ComponentFixture<Secrets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Secrets]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Secrets);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
