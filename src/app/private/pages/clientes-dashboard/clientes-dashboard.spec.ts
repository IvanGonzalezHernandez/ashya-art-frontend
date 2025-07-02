import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientesDashboard } from './clientes-dashboard';

describe('ClientesDashboard', () => {
  let component: ClientesDashboard;
  let fixture: ComponentFixture<ClientesDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientesDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientesDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
