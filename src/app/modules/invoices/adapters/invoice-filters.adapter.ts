import { FormGroup } from '@angular/forms';

import { DateTimeHelper, LeftOnlyValidValues } from '@core/helpers';

import { InvoiceManualPendingRecordsFilteringOptions, InvoicesFilterState, TypedInvoiceKey } from '../interfaces';
import { CreateInvoiceReasonList, CreateVendorFeeList } from '../helpers';
import { FiltersDateFields } from '../constants';

export class InvoiceFiltersAdapter {
  static prepareFilters(formGroup: FormGroup): InvoicesFilterState {
    const filters: InvoicesFilterState = LeftOnlyValidValues(formGroup);

    FiltersDateFields.forEach((key: TypedInvoiceKey) => {
      if (filters[key]) {
        (filters[key] as string) = DateTimeHelper.toUtcFormat(filters[key] as string, true);
      }
    });

    if (filters.formattedInvoiceIds) {
      filters.formattedInvoiceIds = [formGroup.getRawValue().formattedInvoiceIds];
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
