import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduledHoursComponent } from './scheduled-hours.component';

describe('ScheduledHoursComponent', () => {
  let component: ScheduledHoursComponent;
  let fixture: ComponentFixture<ScheduledHoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScheduledHoursComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduledHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
