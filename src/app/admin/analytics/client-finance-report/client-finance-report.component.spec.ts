import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientFinanceReportComponent } from './client-finance-report.component';

describe('ClientFinanceReportComponent', () => {
  let component: ClientFinanceReportComponent;
  let fixture: ComponentFixture<ClientFinanceReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientFinanceReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientFinanceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
