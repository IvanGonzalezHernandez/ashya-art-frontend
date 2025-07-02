import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CursosDashboard } from './cursos-dashboard';

describe('CursosDashboard', () => {
  let component: CursosDashboard;
  let fixture: ComponentFixture<CursosDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CursosDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CursosDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
