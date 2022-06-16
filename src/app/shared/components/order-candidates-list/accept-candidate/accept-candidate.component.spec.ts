import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptCandidateComponent } from './accept-candidate.component';

describe('AcceptCandidateComponent', () => {
  let component: AcceptCandidateComponent;
  let fixture: ComponentFixture<AcceptCandidateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AcceptCandidateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AcceptCandidateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
