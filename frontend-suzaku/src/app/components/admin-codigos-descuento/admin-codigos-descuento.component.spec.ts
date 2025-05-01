import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCodigosDescuentoComponent } from './admin-codigos-descuento.component';

describe('AdminCodigosDescuentoComponent', () => {
  let component: AdminCodigosDescuentoComponent;
  let fixture: ComponentFixture<AdminCodigosDescuentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCodigosDescuentoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCodigosDescuentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
