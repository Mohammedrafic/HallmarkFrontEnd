import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateEducationComponent } from './candidate-education.component';

describe('CandidateEducationComponent', () => {
  let component: CandidateEducationComponent;
  let fixture: ComponentFixture<CandidateEducationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CandidateEducationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CandidateEducationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
