import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobEventComponent } from './job-event.component';

describe('JobEventComponent', () => {
  let component: JobEventComponent;
  let fixture: ComponentFixture<JobEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobEventComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
