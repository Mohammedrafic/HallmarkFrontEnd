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
    isPosition: boolean,
    ): void;
  getMeta(form?: CustomFormGroup<AddManInvoiceForm>,organizationId?:number): Observable<null>;

  connectConfigOptions(config: AddManInvoiceDialogConfig, options: ManualInvoiceInputOptions): void;

  populateCandidates(
    id: number,
    meta: ManualInvoiceMeta[],
    options: ManualInvoiceInputOptions,
    config: AddManInvoiceDialogConfig,
    orderId?: number,
    ): void;
}
