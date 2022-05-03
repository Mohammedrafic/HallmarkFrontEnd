import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateGeneralInfoComponent } from './candidate-general-info.component';

describe('CandidateGeneralInfoComponent', () => {
  let component: CandidateGeneralInfoComponent;
  let fixture: ComponentFixture<CandidateGeneralInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CandidateGeneralInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CandidateGeneralInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
