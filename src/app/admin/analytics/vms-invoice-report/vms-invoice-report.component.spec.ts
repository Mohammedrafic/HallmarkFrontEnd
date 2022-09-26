import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VmsInvoiceReportComponent } from './vms-invoice-report.component';

describe('VmsInvoiceReportComponent', () => {
  let component: VmsInvoiceReportComponent;
  let fixture: ComponentFixture<VmsInvoiceReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VmsInvoiceReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VmsInvoiceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
