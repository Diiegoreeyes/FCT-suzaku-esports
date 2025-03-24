import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCrearproductoComponent } from './admin-crearproducto.component';

describe('AdminCrearproductoComponent', () => {
  let component: AdminCrearproductoComponent;
  let fixture: ComponentFixture<AdminCrearproductoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCrearproductoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCrearproductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
