import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEditarproductoComponent } from './admin-editarproducto.component';

describe('AdminEditarproductoComponent', () => {
  let component: AdminEditarproductoComponent;
  let fixture: ComponentFixture<AdminEditarproductoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEditarproductoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminEditarproductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
