import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateStatsComponent } from './candidate-stats.component';

describe('CandidateStatsComponent', () => {
  let component: CandidateStatsComponent;
  let fixture: ComponentFixture<CandidateStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CandidateStatsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CandidateStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
