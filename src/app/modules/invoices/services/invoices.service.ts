import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';

import { filter, Observable, switchMap, take } from 'rxjs';
import { Store } from '@ngxs/store';

import { BaseObservable } from '@core/helpers';
import { CustomFormGroup, DataSourceItem } from '@core/interface';
import { OrganizationRegion } from '@shared/models/organization.model';

import { InvoiceFilterForm } from '../interfaces/form.interface';
import { InvoicesTableFiltersColumns } from '../enums/invoices.enum';
import { Invoices } from '../store/actions/invoices.actions';
import { ConfirmService } from '@shared/services/confirm.service';
import { rejectInvoiceConfirmDialogConfig } from '../constants/reject-invoice-confirm-dialog-config.const';
import { approveInvoiceConfirmDialogConfig } from '../constants/approve-invoice-confirm-dialog-config.const';

@Injectable()
export class InvoicesService {
  private currentSelectedTableRowIndex: BaseObservable<number> = new BaseObservable<number>(null as any);

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private confirmService: ConfirmService,
    private store: Store,
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

  public approveInvoice(invoiceId: number): Observable<void> {
    const { title, submitButtonText, getMessage } = approveInvoiceConfirmDialogConfig;

    return this.confirmService.confirm(getMessage(invoiceId), {
      title,
      okButtonLabel: submitButtonText,
      okButtonClass: 'delete-button'
    })
      .pipe(
        take(1),
        filter((submitted: boolean) => submitted),
        switchMap(() => this.store.dispatch(new Invoices.ApproveInvoice(invoiceId))),
      );
  }

  public rejectInvoice(invoiceId: number): Observable<void> {
    const {
      title, okButtonLabel, okButtonClass
    } = rejectInvoiceConfirmDialogConfig;

    return this.confirmService.confirm(`Are you sure you want to reject invoice ${invoiceId}?`, {
      title,
      okButtonLabel,
      okButtonClass,
    })
      .pipe(
        take(1),
        filter((submitted: boolean) => submitted),
        switchMap(() => this.store.dispatch(new Invoices.RejectInvoice(invoiceId))),
      );
  }
}
