import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardedCandidateComponent } from './onboarded-candidate.component';

describe('OnboardedCandidateComponent', () => {
  let component: OnboardedCandidateComponent;
  let fixture: ComponentFixture<OnboardedCandidateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OnboardedCandidateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardedCandidateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
