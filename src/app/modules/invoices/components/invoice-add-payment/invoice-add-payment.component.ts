import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridApi, GridReadyEvent, Module } from '@ag-grid-community/core';
import { Store } from '@ngxs/store';
import { debounceTime, filter, switchMap, takeUntil } from 'rxjs';

import { FieldType } from '@core/enums';
import { DateTimeHelper, DestroyDialog } from '@core/helpers';
import { CustomFormGroup } from '@core/interface';
import { PaymentsAdapter } from '../../helpers/payments.adapter';
import { InvoicePaymentData } from '../../interfaces';
import { Invoices } from '../../store/actions/invoices.actions';
import { InvoicesModel } from '../../store/invoices.model';
import { AddPaymentFormConfig, CheckPaymentsDefs } from './invoice-add-payment.constant';
import { CheckForm, PaymentForm, PaymentFormConfig, PaymentsTableData } from './invoice-add-payment.interface';
import { InvoiceAddPaymentService } from './invoice-add-payment.service';
import { InvoicesApiService } from '../../services';


@Component({
  selector: 'app-invoice-add-payment',
  templateUrl: './invoice-add-payment.component.html',
  styleUrls: ['./invoice-add-payment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceAddPaymentComponent extends DestroyDialog implements OnInit {
  @Input() invoicesToPay: InvoicePaymentData[] = [];

  @Input() checkNumber: string | null;

  paymentsForm: Record<string, CustomFormGroup<PaymentForm>>;

  checkForm: CustomFormGroup<CheckForm>;

  tableData: PaymentsTableData[];

  gridApi: GridApi;

  readonly optionFields = { text: 'text', value: 'value' };

  readonly addPaymentFormConfig = AddPaymentFormConfig;

  readonly checkTableDef = CheckPaymentsDefs;

  readonly fieldTypes = FieldType;

  readonly tableContext: { componentParent: InvoiceAddPaymentComponent };

  readonly tableModules: Module[] = [ClientSideRowModelModule];

  readonly today = new Date();

  private organizationId: number;

  constructor(
    private paymentService: InvoiceAddPaymentService,
    private store: Store,
    private apiService: InvoicesApiService,
    private cd: ChangeDetectorRef,
  ) {
    super();
    this.checkForm = this.paymentService.createCheckForm();
    this.organizationId = (this.store.snapshot().invoices as InvoicesModel).selectedOrganizationId;
    this.tableContext = {
      componentParent: this,
    };
  }

  ngOnInit(): void {
    this.watchForCloseStream();
    this.watchForCheckControl();
    this.setTableData();

    if (this.checkNumber) {
      this.checkForm.patchValue({ checkNumber: this.checkNumber });
    }
  }

  savePayment(): void {
    if (this.checkForm.valid && this.checkPaymentForms()) {

      const dto = PaymentsAdapter.adaptPaymentForPost(
        this.checkForm.value, this.paymentsForm, this.organizationId, this.invoicesToPay);

      this.store.dispatch(new Invoices.SavePayment(dto))
      .pipe(
        takeUntil(this.componentDestroy())
      ).subscribe(() => {
        this.closeDialog();
      });
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

  private watchForCheckControl(): void {
    this.checkForm.get('checkNumber')?.valueChanges
    .pipe(
      debounceTime(1500),
      filter(Boolean),
      switchMap((value) => this.apiService.getCheckData(value)),
      filter((response) => !!response),
      takeUntil(this.componentDestroy()),
    )
    .subscribe((response) => {
      this.checkForm.patchValue({
        id: response.check.id,
        checkDate: DateTimeHelper.convertDateToUtc(response.check.checkDate),
        initialAmount: response.check.initialAmount,
        paymentMode: response.check.paymentMode,
        isRefund: response.check.isRefund,
      });
      
      const tableRecords = this.paymentService.mergeTableData(this.tableData, response.payments, this.paymentsForm);
      this.gridApi.setRowData(tableRecords);

      this.cd.markForCheck();
    });
  }
}
