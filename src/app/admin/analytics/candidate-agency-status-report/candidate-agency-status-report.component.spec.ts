import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateAgencyStatusReportComponent } from './candidate-agency-status-report.component';

describe('CandidateAgencyStatusReportComponent', () => {
  let component: CandidateAgencyStatusReportComponent;
  let fixture: ComponentFixture<CandidateAgencyStatusReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CandidateAgencyStatusReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CandidateAgencyStatusReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
