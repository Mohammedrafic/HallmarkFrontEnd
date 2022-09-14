import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobDetailsSummaryComponent } from './job-details-summary.component';

describe('JobDetailsSummaryComponent', () => {
  let component: JobDetailsSummaryComponent;
  let fixture: ComponentFixture<JobDetailsSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobDetailsSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobDetailsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
