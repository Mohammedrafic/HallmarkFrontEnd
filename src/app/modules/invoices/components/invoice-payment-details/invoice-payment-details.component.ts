import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { filter, Observable, switchMap, take, takeUntil, tap } from 'rxjs';
import { GridApi, GridReadyEvent, Module } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

import { DestroyDialog } from '@core/helpers';
import { InvoiceDetail, InvoicePayment, InvoicePaymentGetParams, PaymentMeta } from '../../interfaces';
import { InvoicesState } from '../../store/state/invoices.state';
import { InvoicesModel } from '../../store/invoices.model';
import { InvoicesApiService } from '../../services';
import { PaymentTableDefs } from './invoice-payment-details.constant';
import { Invoices } from '../../store/actions/invoices.actions';
import { InvoiceState } from '../../enums';
import { Permission } from '@core/interface';
import { UserState } from 'src/app/store/user.state';
import { UserPermissions } from '@core/enums';

@Component({
  selector: 'app-invoice-payment-details',
  templateUrl: './invoice-payment-details.component.html',
  styleUrls: ['./invoice-payment-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicePaymentDetailsComponent extends DestroyDialog implements OnInit {
  @Input() public container: HTMLElement;

  @Output() addPayment: EventEmitter<void> = new EventEmitter();

  @Output() editPaymentCheck: EventEmitter<string> = new EventEmitter();

  @Select(InvoicesState.invoiceDetails)
  private readonly invoiceDetail$: Observable<InvoiceDetail>;

  context: { componentParent: InvoicePaymentDetailsComponent };

  tableData: InvoicePayment[] = [];

  actionsAllowed = true;

  readonly paymentTableDefs = PaymentTableDefs;

  readonly modules: Module[] = [ClientSideRowModelModule];

  readonly invoiceData: PaymentMeta = {
    invoiceNumber: null,
    amount: null,
    invoiceId: null,
    agencySuffix: null,
  };

  public isAgency = false;

  private currentOrgId: number;

  private gridApi: GridApi;

  public userPermission: Permission = {};
  public readonly userPermissions = UserPermissions;

  constructor(
    private store: Store,
    private apiService: InvoicesApiService,
    private actions$: Actions,
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
    this.watchForPaymentSaveAction();
    this.getuserPermission()
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
        this.invoiceData.amount = invoice.totals.calculatedTotal;
      }),
      switchMap((details) => {
        this.invoiceData.invoiceId = details.meta.invoiceId;
        this.invoiceData.agencySuffix = details.meta.agencySuffix as number;
        this.actionsAllowed = details.meta.invoiceState === InvoiceState.PendingPayment;

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
      this.setTableRowData(response);
    });
  }

  private watchForPaymentSaveAction(): void {
    this.actions$
    .pipe(
      ofActionSuccessful(Invoices.SavePayment),
      switchMap(() => {
        const dto: InvoicePaymentGetParams =  {
          InvoiceId: this.invoiceData.invoiceId as number,
          OrganizationId: this.currentOrgId,
          ...this.isAgency ? { AgencySuffix: this.invoiceData.agencySuffix as number } : {},
        };

        return this.apiService.getInvoicesPayments(dto);
      }),
      takeUntil(this.componentDestroy()),
    )
    .subscribe((response) => {
      this.setTableRowData(response);
    });
  }

  private setTableRowData(data: InvoicePayment[]): void {
    this.gridApi.setRowData(data);
    this.cd.markForCheck();
  }
  private getuserPermission(): void {
    this.store.select(UserState.userPermission).pipe(
      filter((permissions: Permission) => !!Object.keys(permissions).length),take(1)
    ).subscribe((permissions: Permission) => {
      this.userPermission = permissions;
    });
  }
}
