import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialTimeSheetReportComponent } from './financial-time-sheet-report.component';

describe('ClientFinanceAccrualReportComponent', () => {
  let component: FinancialTimeSheetReportComponent;
  let fixture: ComponentFixture<FinancialTimeSheetReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FinancialTimeSheetReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FinancialTimeSheetReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
