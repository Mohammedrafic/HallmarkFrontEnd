import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClosureReasonComponent } from './closure-reason.component';

describe('CandidateRejectReasonComponent', () => {
  let component: ClosureReasonComponent;
  let fixture: ComponentFixture<ClosureReasonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClosureReasonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClosureReasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
