import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffScheduleByShiftComponent } from './staff-schedule-by-shift.component';

describe('StaffScheduleByShiftComponent', () => {
  let component: StaffScheduleByShiftComponent;
  let fixture: ComponentFixture<StaffScheduleByShiftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StaffScheduleByShiftComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffScheduleByShiftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
