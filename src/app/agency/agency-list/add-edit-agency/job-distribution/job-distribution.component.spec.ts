import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobDistributionComponent } from './job-distribution.component';

describe('JobDistributionComponent', () => {
  let component: JobDistributionComponent;
  let fixture: ComponentFixture<JobDistributionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobDistributionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobDistributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
