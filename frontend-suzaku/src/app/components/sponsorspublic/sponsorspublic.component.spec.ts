import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SponsorspublicComponent } from './sponsorspublic.component';

describe('SponsorspublicComponent', () => {
  let component: SponsorspublicComponent;
  let fixture: ComponentFixture<SponsorspublicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SponsorspublicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SponsorspublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
