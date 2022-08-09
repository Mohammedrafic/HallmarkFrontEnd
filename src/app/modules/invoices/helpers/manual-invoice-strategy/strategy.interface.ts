import { Observable } from 'rxjs';

import { CustomFormGroup } from '@core/interface';
import { AddManInvoiceDialogConfig, AddManInvoiceForm, ManualInvoiceInputOptions,
  ManualInvoiceMeta } from '../../interfaces';

export interface ManualInvoiceStrategy {
  populateOptions(
    meta: ManualInvoiceMeta[],
    options: ManualInvoiceInputOptions,
    form: CustomFormGroup<AddManInvoiceForm>,
    config: AddManInvoiceDialogConfig,
    ): void;
  getMeta(form?: CustomFormGroup<AddManInvoiceForm>): Observable<null>;

  connectConfigOptions(config: AddManInvoiceDialogConfig, options: ManualInvoiceInputOptions): void;
}
