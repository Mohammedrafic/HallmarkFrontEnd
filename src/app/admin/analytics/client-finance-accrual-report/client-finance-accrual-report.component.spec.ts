import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientFinanceAccrualReportComponent } from './client-finance-accrual-report.component';

describe('ClientFinanceAccrualReportComponent', () => {
  let component: ClientFinanceAccrualReportComponent;
  let fixture: ComponentFixture<ClientFinanceAccrualReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientFinanceAccrualReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientFinanceAccrualReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
