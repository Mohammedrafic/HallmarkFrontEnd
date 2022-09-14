import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobComplianceComponent } from './job-compliance.component';

describe('JobComplianceComponent', () => {
  let component: JobComplianceComponent;
  let fixture: ComponentFixture<JobComplianceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobComplianceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobComplianceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
