import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderGeneralComponent } from './header-general.component';

describe('HeaderGeneralComponent', () => {
  let component: HeaderGeneralComponent;
  let fixture: ComponentFixture<HeaderGeneralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderGeneralComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
