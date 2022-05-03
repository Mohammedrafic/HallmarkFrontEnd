import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateProfessionalSummaryComponent } from './candidate-professional-summary.component';

describe('CandidateProfessionalSummaryComponent', () => {
  let component: CandidateProfessionalSummaryComponent;
  let fixture: ComponentFixture<CandidateProfessionalSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CandidateProfessionalSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CandidateProfessionalSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
