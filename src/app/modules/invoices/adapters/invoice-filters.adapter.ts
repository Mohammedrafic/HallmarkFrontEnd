import { FormGroup } from '@angular/forms';

import { DateTimeHelper, LeftOnlyValidValues } from '@core/helpers';

import { InvoicesFilterState } from '../interfaces';

type TypedKey = keyof InvoicesFilterState;

export class InvoiceFiltersAdapter {
  static prepareFilters(formGroup: FormGroup): InvoicesFilterState {
    const filters: InvoicesFilterState | any = LeftOnlyValidValues(formGroup);
    const dateFieldsKeys: TypedKey[] = [
      'issueDateFrom',
      'issueDateTo',
      'dueDateFrom',
      'dueDateTo',
      'paidDateFrom',
      'paidDateTo',
      'weekPeriodFrom',
      'weekPeriodTo',
    ];

    dateFieldsKeys.forEach((key: TypedKey) => {
      if (filters[key]) {
        filters[key] = DateTimeHelper.toUtcFormat(filters[key]);
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
}
