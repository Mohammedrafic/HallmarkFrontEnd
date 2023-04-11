import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceMedicareWageReportComponent } from './finance-medicare-wage-report.component';

describe('FinanceMedicareWageReportComponent', () => {
  let component: FinanceMedicareWageReportComponent;
  let fixture: ComponentFixture<FinanceMedicareWageReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FinanceMedicareWageReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FinanceMedicareWageReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
