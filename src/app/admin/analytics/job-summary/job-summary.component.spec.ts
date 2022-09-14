import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobSummaryComponent } from './job-summary.component';

describe('JobSummaryComponent', () => {
  let component: JobSummaryComponent;
  let fixture: ComponentFixture<JobSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
