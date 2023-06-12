import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridApi, GridReadyEvent, Module } from '@ag-grid-community/core';
import { Store } from '@ngxs/store';
import { debounceTime, filter, of, switchMap, take, takeUntil } from 'rxjs';

import { FieldType } from '@core/enums';
import { DateTimeHelper, DestroyDialog } from '@core/helpers';
import { CustomFormGroup } from '@core/interface';
import { PaymentsAdapter } from '../../helpers/payments.adapter';
import { InvoicePaymentData } from '../../interfaces';
import { Invoices } from '../../store/actions/invoices.actions';
import { InvoicesModel } from '../../store/invoices.model';
import { AddPaymentFormConfig, CheckPaymentsDefs, PaymentMessages } from './invoice-add-payment.constant';
import { CheckForm, PaymentForm, PaymentFormConfig, PaymentsTableData } from './invoice-add-payment.interface';
import { InvoiceAddPaymentService } from './invoice-add-payment.service';
import { InvoicesApiService } from '../../services';
import { ConfirmService } from '@shared/services/confirm.service';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { PaymentDialogTitle } from '../../enums';


@Component({
  selector: 'app-invoice-add-payment',
  templateUrl: './invoice-add-payment.component.html',
  styleUrls: ['./invoice-add-payment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceAddPaymentComponent extends DestroyDialog implements OnInit {
  @Input() invoicesToPay: InvoicePaymentData[] = [];

  @Input() checkNumber: string | null;

  @Input() dialogTitle = PaymentDialogTitle.Add;

  @Input() public container: HTMLElement;

  paymentsForm: Record<string, CustomFormGroup<PaymentForm>>;

  checkForm: CustomFormGroup<CheckForm>;

  tableData: PaymentsTableData[];

  gridApi: GridApi;

  calculatedLeftAmount = 0;

  readonly optionFields = { text: 'text', value: 'value' };

  readonly addPaymentFormConfig = AddPaymentFormConfig;

  readonly checkTableDef = CheckPaymentsDefs;

  readonly fieldTypes = FieldType;

  readonly tableContext: { componentParent: InvoiceAddPaymentComponent };

  readonly tableModules: Module[] = [ClientSideRowModelModule];

  readonly today = new Date();

  private organizationId: number;

  private initialAmount: number;

  constructor(
    private paymentService: InvoiceAddPaymentService,
    private confirmService: ConfirmService,
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
    this.watchForCheckAmountControl();
    this.setTableData();

    if (this.checkNumber) {
      this.checkForm.patchValue({ checkNumber: this.checkNumber });
    }
  }

  savePayment(): void {
    if (!this.checkForm.valid || !this.checkPaymentForms()) {
      return;
    }

    const balanceCovered = this.paymentService.calcBalanceCovered(this.paymentsForm);

    if (!Object.keys(this.paymentsForm).length || (this.calculatedLeftAmount === 0 && balanceCovered)) {
      this.savePaymentDto();
      return;
    }

    if (this.calculatedLeftAmount > 0 && balanceCovered) {
      this.confirmService.confirm(PaymentMessages.lowerAmount, {
        title: 'Check Payment Amount',
        okButtonLabel: 'Yes',
        okButtonClass: 'delete-button',
      })
      .pipe(
        take(1),
        filter(Boolean),
      )
      .subscribe(() => {
        this.savePaymentDto();
      });

    } else if (this.calculatedLeftAmount > 0 && !balanceCovered) {
      this.confirmService.confirm(
        PaymentMessages.partialyCovered(this.paymentService.findPartialyCoveredIds(this.paymentsForm)),
        {
          title: 'Check Payment Amount',
          okButtonLabel: 'Yes',
          okButtonClass: 'delete-button',
        })
        .pipe(
          take(1),
          filter(Boolean),
        )
        .subscribe(() => {
          this.savePaymentDto();
        });

    } else if (this.calculatedLeftAmount < 0) {
      this.store.dispatch(new ShowToast(MessageTypes.Error, PaymentMessages.negativeAmount));
    } else if (this.calculatedLeftAmount === 0 && !balanceCovered) {
      this.confirmService.confirm(
        PaymentMessages.partialyNullAmount(this.paymentService.findPartialyCoveredIds(this.paymentsForm)),
        {
          title: 'Check Payment Amount',
          okButtonLabel: 'Yes',
          okButtonClass: 'delete-button',
        })
        .pipe(
          take(1),
          filter(Boolean),
        )
        .subscribe(() => {
          this.savePaymentDto();
        });
    }
  }

  deletePayment(invoiceId: string, invoiceDbid: number): void {
    this.confirmService.confirm(PaymentMessages.deleteInvoice, {
      title: 'Check Payment Amount',
      okButtonLabel: 'Yes',
      okButtonClass: 'delete-button',
    })
    .pipe(
      filter(Boolean),
      switchMap(() => {
        delete this.paymentsForm[invoiceId];

        this.tableData = this.tableData.filter((payment) => payment.invoiceNumber !== invoiceId);
        this.cd.markForCheck();

        if (invoiceDbid) {
          return this.apiService.deletePayment(invoiceDbid);
        }
        return of();
      }),
      take(1),
    )
    .subscribe();
  }

  setGridApi(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridApi.showLoadingOverlay();
    this.gridApi.setDomLayout('autoHeight');

    this.gridApi.setRowData(this.tableData);
    this.cd.detectChanges();
  }

  calcCheckAmount(): void {
    this.calcLeftAmount();
  }

  closePaymentDialog(): void {
    if (this.checkForm.touched) {
      this.confirmService.confirm(
        PaymentMessages.unsavedData,
        {
          title: 'Unsaved Progress',
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(
          take(1),
          filter(Boolean),
        )
        .subscribe(() => {
          this.closeDialog();
        });
    } else {
      this.closeDialog();
    }
  }

  private setTableData(): void {
    this.paymentsForm = this.paymentService.createPaymentsForm(this.invoicesToPay);
    this.tableData = this.paymentService.createTableData(this.invoicesToPay, this.paymentsForm);
    this.calcLeftAmount();
    this.cd.markForCheck();
  }

  private checkPaymentForms(): boolean {
    return Object.keys(this.paymentsForm).every((key) => this.paymentsForm[key].valid);
  }

  private watchForCheckControl(): void {
    this.checkForm.get('checkNumber')?.valueChanges
    .pipe(
      debounceTime(1000),
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

      this.initialAmount = response.check.initialAmount;
      const tableRecords = this.paymentService.mergeTableData(this.tableData, response.payments, this.paymentsForm);

      this.invoicesToPay = this.paymentService.createInitialInvoicesData(response, this.invoicesToPay);
      this.gridApi.setRowData(tableRecords);
      this.calcLeftAmount();
      this.cd.markForCheck();
    });
  }

  private calcLeftAmount(): void {
    this.calculatedLeftAmount = this.paymentService.calculateCheckAmount(this.paymentsForm, this.initialAmount);
  }

  private watchForCheckAmountControl(): void {
    this.checkForm.get('initialAmount')?.valueChanges
    .pipe(
      takeUntil(this.componentDestroy()),
    )
    .subscribe((value) => {
      this.initialAmount = parseFloat(value);
      this.calcLeftAmount();
      this.cd.markForCheck();
    });
  }

  private savePaymentDto(): void {
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
