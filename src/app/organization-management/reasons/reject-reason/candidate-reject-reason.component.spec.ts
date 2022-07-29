import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateRejectReasonComponent } from './candidate-reject-reason.component';

describe('CandidateRejectReasonComponent', () => {
  let component: CandidateRejectReasonComponent;
  let fixture: ComponentFixture<CandidateRejectReasonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CandidateRejectReasonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CandidateRejectReasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
