import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridApi, GridReadyEvent, Module } from '@ag-grid-community/core';

import { DestroyDialog } from '@core/helpers';
import { CustomFormGroup } from '@core/interface';
import { FieldType } from '@core/enums';
import { AddPaymentFormConfig, CheckPaymentsDefs } from './invoice-add-payment.constant';
import { CheckForm, PaymentForm, PaymentFormConfig, PaymentsTableData } from './invoice-add-payment.interface';
import { InvoiceAddPaymentService } from './invoice-add-payment.service';
import { InvoicePaymentData } from '../../interfaces';

@Component({
  selector: 'app-invoice-add-payment',
  templateUrl: './invoice-add-payment.component.html',
  styleUrls: ['./invoice-add-payment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceAddPaymentComponent extends DestroyDialog implements OnInit {
  @Input() invoicesToPay: InvoicePaymentData[] = [];

  paymentsForm: Record<string, CustomFormGroup<PaymentForm>>;

  checkForm: CustomFormGroup<CheckForm>;

  tableData: PaymentsTableData[];

  gridApi: GridApi;

  readonly addPaymentFormConfig = AddPaymentFormConfig;

  readonly checkTableDef = CheckPaymentsDefs;

  readonly fieldTypes = FieldType;

  readonly tableContext: { componentParent: InvoiceAddPaymentComponent };

  readonly tableModules: Module[] = [ClientSideRowModelModule];

  readonly today = new Date();

  constructor(
    private paymentService: InvoiceAddPaymentService,
    private cd: ChangeDetectorRef,
  ) {
    super();
    this.checkForm = this.paymentService.createCheckForm();
    this.tableContext = {
      componentParent: this,
    };
  }

  ngOnInit(): void {
    this.watchForCloseStream();
    this.setTableData();
  }

  savePayment(): void {
    if (this.checkForm.valid && this.checkPaymentForms()) {
      const checkValue = this.checkForm.value;
      console.log(checkValue)
    }
  }

  deletePayment(invoiceId: string): void {
    delete this.paymentsForm[invoiceId];

    this.tableData = this.tableData.filter((payment) => payment.invoiceNumber !== invoiceId);
  }

  trackByField(index: number, item: PaymentFormConfig): string {
    return item.field;
  }

  setGridApi(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridApi.showLoadingOverlay();
    this.gridApi.setDomLayout('autoHeight');

    this.gridApi.setRowData(this.tableData);
    this.cd.detectChanges();
  }

  private setTableData(): void {
    this.paymentsForm = this.paymentService.createPaymentsForm(this.invoicesToPay);
    this.tableData = this.paymentService.createTableData(this.invoicesToPay, this.paymentsForm); 
  }

  private checkPaymentForms(): boolean {
    return Object.keys(this.paymentsForm).every((key) => this.paymentsForm[key].valid);
  }
}
