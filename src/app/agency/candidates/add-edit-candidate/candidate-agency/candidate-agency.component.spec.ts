import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateAgencyComponent } from './candidate-agency.component';

describe('CandidateAgencyComponent', () => {
  let component: CandidateAgencyComponent;
  let fixture: ComponentFixture<CandidateAgencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CandidateAgencyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CandidateAgencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
