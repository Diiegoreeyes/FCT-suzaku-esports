import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEquipoComponent } from './admin-equipo.component';

describe('AdminEquipoComponent', () => {
  let component: AdminEquipoComponent;
  let fixture: ComponentFixture<AdminEquipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEquipoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminEquipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
