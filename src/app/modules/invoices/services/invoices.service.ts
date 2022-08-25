import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';

import { catchError, filter, Observable, take } from 'rxjs';
import { Store } from '@ngxs/store';

import { BaseObservable } from '@core/helpers';
import { CustomFormGroup, DataSourceItem } from '@core/interface';
import { OrganizationRegion } from '@shared/models/organization.model';

import { InvoiceFilterForm } from '../interfaces/form.interface';
import { InvoicesTableFiltersColumns } from '../enums/invoices.enum';
import { Invoices } from '../store/actions/invoices.actions';
import { ConfirmService } from '@shared/services/confirm.service';
import { approveInvoiceConfirmDialogConfig } from '../constants/approve-invoice-confirm-dialog-config.const';
import { TimesheetTargetStatus } from '../../timesheets/enums';
import { tap } from 'rxjs/internal/operators/tap';
import { ShowToast } from '../../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { getAllErrors } from '@shared/utils/error.utils';
import { InvoicesApiService } from './invoices-api.service';

@Injectable()
export class InvoicesService {
  private currentSelectedTableRowIndex: BaseObservable<number> = new BaseObservable<number>(null as any);

  constructor(
    private fb: FormBuilder,
    private confirmService: ConfirmService,
    private store: Store,
    private invoicesApiService: InvoicesApiService,
  ) {
  }

  public createForm(): CustomFormGroup<InvoiceFilterForm> {
    return this.fb.group({
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
    const { title, submitButtonText, getMessage } = approveInvoiceConfirmDialogConfig;

    return this.confirmService.confirm(getMessage(invoiceId), {
      title,
      okButtonLabel: submitButtonText,
      okButtonClass: 'delete-button'
    })
      .pipe(
        take(1),
        filter((submitted: boolean) => submitted),
      );
  }

  public approveInvoice(id: number) {
    return this.invoicesApiService.changeInvoiceStatus({
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
    return this.invoicesApiService.changeInvoiceStatus({
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
}
