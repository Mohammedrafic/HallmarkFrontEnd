import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CustomFormGroup } from '@core/interface';
import { intervalMaxValidator, intervalMinValidator } from '@shared/validators/interval.validator';
import { endDateValidator, startDateValidator } from '@shared/validators/date.validator';

import {
  InvoiceFilterColumns,
  InvoiceManualPendingRecordsFilteringOptions,
  InvoicesFilteringOptions,
  InvoicesPendingInvoiceRecordsFilteringOptions,
} from '../interfaces';
import {
  FilteringInvoicesOptionsFields,
  FilteringManualPendingInvoiceRecordsOptionsFields,
  FilteringPendingInvoiceRecordsOptionsFields,
} from '../enums';
import {
  InvoicesFilteringOptionsMapping,
  ManualPendingInvoiceRecordsFilteringOptionsMapping,
  PendingInvoiceRecordsFilteringOptionsMapping,
} from '../constants';
import { BaseObservable } from '@core/helpers';
import { filter, Observable } from 'rxjs';

@Injectable()
export class InvoicesFiltersService {
  private readonly slectedTabIndex = new BaseObservable<number | null>(null);
  
  constructor(private fb: FormBuilder) {
  }

  createForm(): CustomFormGroup<InvoiceFilterColumns> {
    return this.fb.group({
      searchTerm: [null],
      formattedInvoiceIds: [null],
      organizationId: [null],
      invoiceState: [null],
      amountFrom: [null, [Validators.min(0), Validators.max(Number.MAX_SAFE_INTEGER)]],
      amountTo: [null, [Validators.min(0), Validators.max(Number.MAX_SAFE_INTEGER)]],
      statusIds: [null],
      apDelivery: [null],
      aggregateByType: [null],
      invoiceIds: [null],
      agencyIds: [null],
      issueDateFrom: [null],
      issueDateTo: [null],
      dueDateFrom: [null],
      dueDateTo: [null],
      paidDateFrom: [null],
      paidDateTo: [null],

      orderIds: [null],
      timesheetType: [null],
      regionIds: [null],
      locationIds: [null],
      departmentIds: [null],
      skillIds: [null],
      weekPeriodFrom: [null],
      weekPeriodTo: [null],

      orderId: [null],
      serviceDateFrom: [null],
      serviceDateTo: [null],
      vendorFee: [null],
      reasonCodeIds: [null],
      candidateName: [null],
    }) as CustomFormGroup<InvoiceFilterColumns>;
  }


  setupValidators(formGroup: FormGroup): void {
    formGroup.get('amountFrom')?.addValidators([intervalMinValidator(formGroup, 'amountTo', true)]);
    formGroup.get('amountTo')?.addValidators([intervalMaxValidator(formGroup, 'amountFrom', true)]);

    formGroup.get('issueDateFrom')?.setValidators([startDateValidator(formGroup, 'issueDateTo')]);
    formGroup.get('issueDateTo')?.setValidators([endDateValidator(formGroup, 'issueDateFrom')]);
    formGroup.get('dueDateFrom')?.setValidators([startDateValidator(formGroup, 'dueDateTo')]);
    formGroup.get('dueDateTo')?.setValidators([endDateValidator(formGroup, 'dueDateFrom')]);
    formGroup.get('paidDateFrom')?.setValidators([startDateValidator(formGroup, 'paidDateTo')]);
    formGroup.get('paidDateTo')?.setValidators([endDateValidator(formGroup, 'paidDateFrom')]);
    formGroup.get('weekPeriodFrom')?.setValidators([startDateValidator(formGroup, 'weekPeriodTo')]);
    formGroup.get('weekPeriodTo')?.setValidators([endDateValidator(formGroup, 'weekPeriodFrom')]);
  }

  prepareAllFiltersDataSources(
    stateCols: InvoicesFilteringOptions,
    invoiceFiltersColumns: InvoiceFilterColumns,
  ): InvoiceFilterColumns {
    return Object.keys(stateCols).reduce((acc: InvoiceFilterColumns, key: string) => {
      const typedKey = key as FilteringInvoicesOptionsFields;
      const optionsKey = InvoicesFilteringOptionsMapping.get(typedKey);

      if (!optionsKey) {
        return acc;
      }

      acc[optionsKey] = {
        ...invoiceFiltersColumns[optionsKey],
        dataSource: stateCols[typedKey],
      };

      return acc;
    }, {} as InvoiceFilterColumns);
  }

  preparePendingFiltersDataSources(
    stateCols: InvoicesPendingInvoiceRecordsFilteringOptions,
    invoiceFiltersColumns: InvoiceFilterColumns,
  ): InvoiceFilterColumns {
    return Object.keys(stateCols).reduce((acc: InvoiceFilterColumns, key: string) => {
      const typedKey = key as FilteringPendingInvoiceRecordsOptionsFields;
      const optionsKey = PendingInvoiceRecordsFilteringOptionsMapping.get(typedKey);

      if (!optionsKey) {
        return acc;
      }

      acc[optionsKey] = {
        ...invoiceFiltersColumns[optionsKey],
        dataSource: stateCols[typedKey],
      };

      return acc;
    }, {} as InvoiceFilterColumns);
  }

  prepareManualPendingInvoiceFiltersDataSources(
    stateCols: InvoiceManualPendingRecordsFilteringOptions,
    invoiceFiltersColumns: InvoiceFilterColumns,
  ): InvoiceFilterColumns {
    return Object.keys(stateCols).reduce((acc: InvoiceFilterColumns, key: string) => {
      const typedKey = key as FilteringManualPendingInvoiceRecordsOptionsFields;
      const optionsKey = ManualPendingInvoiceRecordsFilteringOptionsMapping.get(typedKey);

      if (!optionsKey) {
        return acc;
      }

      acc[optionsKey] = {
        ...invoiceFiltersColumns[optionsKey],
        dataSource: stateCols[typedKey],
      };

      return acc;
    }, {} as InvoiceFilterColumns);
  }

  getSelectedTabStream(): Observable<number | null> {
    return this.slectedTabIndex.getStream()
    .pipe(filter((id) => id !== null));
  }

  setTabIndex(id: number): void {
    this.slectedTabIndex.set(id);
  }
}
