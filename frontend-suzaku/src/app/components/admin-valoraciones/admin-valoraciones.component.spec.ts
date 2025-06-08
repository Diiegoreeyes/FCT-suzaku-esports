import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminValoracionesComponent } from './admin-valoraciones.component';

describe('AdminValoracionesComponent', () => {
  let component: AdminValoracionesComponent;
  let fixture: ComponentFixture<AdminValoracionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminValoracionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminValoracionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
