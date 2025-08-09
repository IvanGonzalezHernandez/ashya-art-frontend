import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkshopsDetail } from './workshops-detail';

describe('WorkshopsDetail', () => {
  let component: WorkshopsDetail;
  let fixture: ComponentFixture<WorkshopsDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkshopsDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkshopsDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
