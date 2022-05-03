import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateContactDetailsComponent } from './candidate-contact-details.component';

describe('CandidateContactDetailsComponent', () => {
  let component: CandidateContactDetailsComponent;
  let fixture: ComponentFixture<CandidateContactDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CandidateContactDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CandidateContactDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
