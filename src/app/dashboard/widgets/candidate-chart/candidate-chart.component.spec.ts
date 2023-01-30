import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateChartComponent } from './candidate-chart.component';

describe('CandidateChartComponent', () => {
  let component: CandidateChartComponent;
  let fixture: ComponentFixture<CandidateChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CandidateChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CandidateChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
