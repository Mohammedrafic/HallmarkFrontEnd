import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { RowNode } from '@ag-grid-community/core';
import { Store } from '@ngxs/store';
import { catchError, filter, Observable, take } from 'rxjs';
import { tap } from 'rxjs/internal/operators/tap';

import { BaseObservable } from '@core/helpers';
import { CustomFormGroup, DataSourceItem } from '@core/interface';
import { MessageTypes } from '@shared/enums/message-types';
import { OrganizationRegion } from '@shared/models/organization.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { getAllErrors } from '@shared/utils/error.utils';
import { ShowToast } from '../../../store/app.actions';
import { TimesheetTargetStatus } from '../../timesheets/enums';
import { ApproveInvoiceConfirmDialogConfig } from '../constants';
import { InvoicesTableFiltersColumns } from '../enums';
import { InvoiceFilterForm, InvoicePaymentData } from '../interfaces';
import { PendingApprovalInvoice } from '../interfaces/pending-approval-invoice.interface';
import { Invoices } from '../store/actions/invoices.actions';
import { InvoicesApiService } from './invoices-api.service';

@Injectable()
export class InvoicesService {
  private currentSelectedTableRowIndex: BaseObservable<number> = new BaseObservable<number>(null as unknown as number);

  constructor(
    private fb: FormBuilder,
    private confirmService: ConfirmService,
    private store: Store,
    private invoicesApiService: InvoicesApiService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
  }

  public createForm(): CustomFormGroup<InvoiceFilterForm> {
    return this.fb.group({
      searchTerm: [''],
      orderIds: [''],
      regionsIds: [''],
      locationIds: [''],
      departmentIds: [''],
      agencyIds: [''],
      skillIds: [''],
    }) as CustomFormGroup<InvoiceFilterForm>;
  }

  public setDataSourceByFormKey(
    key: InvoicesTableFiltersColumns,
    source: DataSourceItem[] | OrganizationRegion[]
  ): void {
    this.store.dispatch(new Invoices.SetFiltersDataSource(key, source));
  }

  public getCurrentTableIdxStream(): Observable<number> {
    return this.currentSelectedTableRowIndex.getStream();
  }

  public setNextValue(next: boolean): void {
    this.currentSelectedTableRowIndex.set(next ?
      this.currentSelectedTableRowIndex.get() + 1 :
      this.currentSelectedTableRowIndex.get() - 1);
  }

  public setCurrentSelectedIndexValue(value: number): void {
    this.currentSelectedTableRowIndex.set(value);
  }

  public getNextIndex(): number {
    return this.currentSelectedTableRowIndex.get();
  }

  public confirmInvoiceApprove(invoiceId: number): Observable<boolean> {
    const { title, submitButtonText, getMessage } = ApproveInvoiceConfirmDialogConfig;

    return this.confirmService.confirm(getMessage(invoiceId), {
      title,
      okButtonLabel: submitButtonText,
      okButtonClass: 'delete-button',
    })
      .pipe(
        take(1),
        filter((submitted: boolean) => submitted),
      );
  }

  public approveInvoice(id: number) {
    return this.invoicesApiService.changeManualInvoiceStatus({
      organizationId: null,
      reason: null,
      targetStatus: TimesheetTargetStatus.Approved,
      timesheetId: id,
    })
      .pipe(
        tap(() => this.store.dispatch([
          new ShowToast(MessageTypes.Success, 'Record has been approved'),
          new Invoices.GetManualInvoices(null),
        ])),
        catchError((error: HttpErrorResponse) => this.store.dispatch(
          new ShowToast(MessageTypes.Error, getAllErrors(error.error))
        ))
      );
  }

  public rejectInvoice(invoiceId: number, rejectionReason: string): Observable<void> {
    return this.invoicesApiService.changeManualInvoiceStatus({
      organizationId: null,
      reason: rejectionReason,
      targetStatus: TimesheetTargetStatus.Rejected,
      timesheetId: invoiceId,
    }).pipe(
      tap(() => this.store.dispatch([
        new ShowToast(MessageTypes.Success, 'Record has been rejected'),
        new Invoices.GetManualInvoices(null),
      ])),
      catchError((error: HttpErrorResponse) => this.store.dispatch(
        new ShowToast(MessageTypes.Error, getAllErrors(error.error))
      )),
    );
  }

  public createPaymentRecords(nodes: RowNode[]): InvoicePaymentData[] {
    return nodes.filter((node) => (node.data as PendingApprovalInvoice).invoiceState === 2 || (node.data as PendingApprovalInvoice).invoiceState === 4 || (node.data as PendingApprovalInvoice).invoiceState === 5)
    .map((node) => {
      const data = node.data as PendingApprovalInvoice;
      return ({
        invoiceId: data.invoiceId,
        invoiceNumber: data.formattedInvoiceId,
        amount: data.amountToPay,
        agencySuffix: data.agencySuffix,
      });
    });
  }

  public removeQueryParams(): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: {
      invoiceId: null,
      orgId: null,
    }, queryParamsHandling: 'merge'});
  }
}
