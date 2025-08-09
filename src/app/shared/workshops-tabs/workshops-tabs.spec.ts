import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkshopsTabs } from './workshops-tabs';

describe('WorkshopsTabs', () => {
  let component: WorkshopsTabs;
  let fixture: ComponentFixture<WorkshopsTabs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkshopsTabs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkshopsTabs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
