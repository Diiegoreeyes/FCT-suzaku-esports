import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipopublicComponent } from './equipopublic.component';

describe('EquipopublicComponent', () => {
  let component: EquipopublicComponent;
  let fixture: ComponentFixture<EquipopublicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipopublicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipopublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
