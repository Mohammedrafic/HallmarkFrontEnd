import { FormGroup } from '@angular/forms';

import { DateTimeHelper, LeftOnlyValidValues } from '@core/helpers';

import { InvoiceManualPendingRecordsFilteringOptions, InvoicesFilterState, TypedKey } from '../interfaces';
import { CreateInvoiceReasonList, CreateVendorFeeList } from '../helpers';

export class InvoiceFiltersAdapter {
  static prepareFilters(formGroup: FormGroup): InvoicesFilterState {
    const filters: InvoicesFilterState = LeftOnlyValidValues(formGroup);

    const dateFieldsKeys: TypedKey[] = [
      'issueDateFrom',
      'issueDateTo',
      'dueDateFrom',
      'dueDateTo',
      'paidDateFrom',
      'paidDateTo',
      'weekPeriodFrom',
      'weekPeriodTo',
      'serviceDateFrom',
      'serviceDateTo',
    ];


    dateFieldsKeys.forEach((key: TypedKey) => {
      if (filters[key]) {
        (filters[key] as string) = DateTimeHelper.toUtcFormat(filters[key] as string);
      }
    });

    if (filters.formattedInvoiceIds) {
      filters.formattedInvoiceIds = [formGroup.getRawValue().formattedInvoiceIds];
    }

    if (filters.orderIds) {
      filters.orderIds = [formGroup.getRawValue().orderIds];
    }

    return filters;
  }

  static prepareDateToManualPendingInvoice(
    data: InvoiceManualPendingRecordsFilteringOptions
  ): InvoiceManualPendingRecordsFilteringOptions {
    return {
      ...data,
      regions: [],
      locations: [],
      departments: [],
      reasons: CreateInvoiceReasonList(data.reasons),
      vendorFee: CreateVendorFeeList(),
    } as InvoiceManualPendingRecordsFilteringOptions;
  }
}
