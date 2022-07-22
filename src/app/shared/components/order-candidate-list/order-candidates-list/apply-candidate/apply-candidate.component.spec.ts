import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplyCandidateComponent } from './apply-candidate.component';

describe('ApplyCandidateComponent', () => {
  let component: ApplyCandidateComponent;
  let fixture: ComponentFixture<ApplyCandidateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApplyCandidateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplyCandidateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
