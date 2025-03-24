import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminListarproductoComponent } from './admin-listarproducto.component';

describe('AdminListarproductoComponent', () => {
  let component: AdminListarproductoComponent;
  let fixture: ComponentFixture<AdminListarproductoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminListarproductoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminListarproductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
