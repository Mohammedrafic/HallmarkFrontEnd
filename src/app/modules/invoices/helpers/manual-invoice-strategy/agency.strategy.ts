import { Injectable } from '@angular/core';

import { Actions, ofActionCompleted, Store } from '@ngxs/store';
import { map, Observable, zip } from 'rxjs';

import { CustomFormGroup, DropdownOption } from '@core/interface';
import { MessageTypes } from '@shared/enums/message-types';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { ShowToast } from 'src/app/store/app.actions';
import {
  AddManInvoiceDialogConfig, AddManInvoiceForm, ManInvoiceInputConfig, ManualInvoiceInputOptions,
  ManualInvoiceMeta,
} from '../../interfaces';
import { Invoices } from '../../store/actions/invoices.actions';
import { InvoiceMetaAdapter } from '../invoice-meta.adapter';
import { ManualInvoiceStrategy } from './strategy.interface';

@Injectable({ providedIn: 'any'})
export class AgencyStrategy implements ManualInvoiceStrategy {

  constructor(
    private actions$: Actions,
    private store: Store,
    ) {}

  public populateOptions(
    meta: ManualInvoiceMeta[],
    options: ManualInvoiceInputOptions,
    form: CustomFormGroup<AddManInvoiceForm>,
    config: AddManInvoiceDialogConfig,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isPosition: boolean,
    ): void {
      if (!meta.length) {
        this.store.dispatch(new ShowToast(MessageTypes.Warning, 'Sorry, but such order or position was not found'));
        return;
      }

      options.invoiceCandidates = sortByField(InvoiceMetaAdapter.createCandidateOptions(meta), 'text');
      this.connectConfigOptions(config, options);
      form.get('nameId')?.patchValue(meta[0].candidateId);
      form.get('locationId')?.patchValue(meta[0].locationId);
      form.get('departmentId')?.patchValue(meta[0].departmentId);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getMeta(form: CustomFormGroup<AddManInvoiceForm>): Observable<null> {
    const id = this.store.snapshot().invoices.selectedOrganizationId;
    this.store.dispatch(new Invoices.GetManInvoiceMeta(id));
    this.store.dispatch(new Invoices.GetOrganizationStructure(id, true));

    return zip(
      this.actions$.pipe(ofActionCompleted(Invoices.GetManInvoiceMeta)),
      this.actions$.pipe(ofActionCompleted(Invoices.GetOrganizationStructure)),
    )
    .pipe(
      map(() => null),
    );
  }

  public connectConfigOptions(config: AddManInvoiceDialogConfig, options: ManualInvoiceInputOptions): void {
    config.fields.forEach((item: ManInvoiceInputConfig) => {
      if (item.optionsStateKey) {
        item.options = options[item.optionsStateKey] as DropdownOption[];
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public populateCandidates(): void {}
}
