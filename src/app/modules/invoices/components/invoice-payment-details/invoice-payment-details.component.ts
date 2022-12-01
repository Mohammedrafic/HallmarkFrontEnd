import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';

import { Select, Store } from '@ngxs/store';
import { filter, Observable, switchMap, takeUntil, tap } from 'rxjs';
import { GridApi, GridReadyEvent, Module } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

import { DestroyDialog } from '@core/helpers';
import { InvoiceDetail, InvoicePayment, InvoicePaymentGetParams, PaymentMeta } from '../../interfaces';
import { InvoicesState } from '../../store/state/invoices.state';
import { InvoicesModel } from '../../store/invoices.model';
import { InvoicesApiService } from '../../services';
import { PaymentTableDefs } from './invoice-payment-details.constant';

@Component({
  selector: 'app-invoice-payment-details',
  templateUrl: './invoice-payment-details.component.html',
  styleUrls: ['./invoice-payment-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicePaymentDetailsComponent extends DestroyDialog implements OnInit {
  @Output() addPayment: EventEmitter<void> = new EventEmitter();

  @Output() editPaymentCheck: EventEmitter<string> = new EventEmitter();

  @Select(InvoicesState.invoiceDetails)
  private readonly invoiceDetail$: Observable<InvoiceDetail>;

  context: { componentParent: InvoicePaymentDetailsComponent };

  tableData: InvoicePayment[] = [];

  readonly paymentTableDefs = PaymentTableDefs;

  readonly modules: Module[] = [ClientSideRowModelModule];

  readonly invoiceData: PaymentMeta = {
    invoiceNumber: null,
    amount: null,
  };

  private isAgency = false;

  private currentOrgId: number;

  private gridApi: GridApi;

  constructor(
    private store: Store,
    private apiService: InvoicesApiService,
    private cd: ChangeDetectorRef,
  ) {
    super();
    this.isAgency = (this.store.snapshot().invoices as InvoicesModel).isAgencyArea;
    this.currentOrgId = (this.store.snapshot().invoices as InvoicesModel).selectedOrganizationId;
    this.context = {
      componentParent: this,
    };
  }

  ngOnInit(): void {
    this.watchForCloseStream();
    this.watchForInvoiceDetails();
  }

  addNewPayment(): void {
    this.addPayment.emit();
  }

  editPayment(id: string): void {
    this.editPaymentCheck.emit(id);
  }

  setGridApi(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridApi.showLoadingOverlay();
    this.gridApi.setDomLayout('autoHeight');

    this.gridApi.setRowData(this.tableData);
    this.cd.detectChanges();
  }

  private watchForInvoiceDetails(): void {
    this.invoiceDetail$.pipe(
      filter(Boolean),
      tap((invoice) => {
        this.invoiceData.invoiceNumber = invoice.meta.formattedInvoiceNumber;
        this.invoiceData.amount = invoice.totals.amount;
      }),
      switchMap((details) => {
        const dto: InvoicePaymentGetParams =  {
          InvoiceId: details.meta.invoiceId,
          OrganizationId: this.currentOrgId,
          ...this.isAgency ? { AgencySuffix: details.meta.agencySuffix } : {},
        };

        return this.apiService.getInvoicesPayments(dto);
      }),
      takeUntil(this.componentDestroy()),
    )
    .subscribe((response) => {
      this.gridApi.setRowData(response);
      this.cd.markForCheck();
    });
  }
}
