import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobFillRatioComponent } from './job-fill-ratio.component';

describe('JobFillRatioComponent', () => {
  let component: JobFillRatioComponent;
  let fixture: ComponentFixture<JobFillRatioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobFillRatioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobFillRatioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
