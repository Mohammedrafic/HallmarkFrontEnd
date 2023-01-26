import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CustomFormGroup } from '@core/interface';
import { intervalMaxValidator, intervalMinValidator } from '@shared/validators/interval.validator';
import { endDateValidator, startDateValidator } from '@shared/validators/date.validator';

import { InvoiceFilterColumns } from '../interfaces';

@Injectable()
export class InvoicesFiltersService {
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
  }
}
