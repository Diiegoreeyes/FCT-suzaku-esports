import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRankingComponent } from './admin-ranking.component';

describe('AdminRankingComponent', () => {
  let component: AdminRankingComponent;
  let fixture: ComponentFixture<AdminRankingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRankingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminRankingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
