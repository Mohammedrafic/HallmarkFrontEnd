import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialTimesheetReportComponent } from './financial-timesheet-report.component';

describe('FinancialTimesheetReportComponent', () => {
  let component: FinancialTimesheetReportComponent;
  let fixture: ComponentFixture<FinancialTimesheetReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FinancialTimesheetReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FinancialTimesheetReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
