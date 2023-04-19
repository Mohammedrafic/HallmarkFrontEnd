import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VmsInvoiceReportBetaComponent } from './vms-invoice-report-beta.component';

describe('VmsInvoiceReportBetaComponent', () => {
  let component: VmsInvoiceReportBetaComponent;
  let fixture: ComponentFixture<VmsInvoiceReportBetaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VmsInvoiceReportBetaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VmsInvoiceReportBetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
