import { Injectable } from '@angular/core';

import { switchMap } from 'rxjs/operators';
import { map, Observable, distinctUntilChanged, debounceTime } from 'rxjs';
import { Actions, ofActionCompleted, Store } from '@ngxs/store';

import { CustomFormGroup, DropdownOption } from '@core/interface';
import { MessageTypes } from '@shared/enums/message-types';
import { AddManInvoiceDialogConfig, AddManInvoiceForm, ManualInvoiceInputOptions,
  ManualInvoiceMeta } from '../../interfaces';
import { InvoiceMetaAdapter } from '../invoice-meta.adapter';
import { ManualInvoiceStrategy } from './strategy.interface';
import { Invoices } from '../../store/actions/invoices.actions';
import { ShowToast } from 'src/app/store/app.actions';

@Injectable({ providedIn: 'any'})
export class AgencyStrategy implements ManualInvoiceStrategy {

  constructor(
    private actions$: Actions,
    private store: Store,
    ) {}

  populateOptions(meta: ManualInvoiceMeta[],
    options: ManualInvoiceInputOptions,
    form: CustomFormGroup<AddManInvoiceForm>,
    config: AddManInvoiceDialogConfig,
    ): void {
      if (!meta.length) {
        this.store.dispatch(new ShowToast(MessageTypes.Warning, 'Sorry, but such order or position was not found'));
        return;
      }
  
      options.invoiceLocations = InvoiceMetaAdapter.createLocationsOptions(meta);
      options.invoiceCandidates = InvoiceMetaAdapter.createCandidateOptions(meta);
      options.invoiceDepartments = InvoiceMetaAdapter.createDepartmentsOptions(meta);

      this.connectConfigOptions(config, options);
  
      form.get('locationId')?.patchValue(options.invoiceLocations[0].value);
      form.get('departmentId')?.patchValue(options.invoiceDepartments[0].value);
      form.get('name')?.patchValue(options.invoiceCandidates[0].value);
  }

  getMeta(form: CustomFormGroup<AddManInvoiceForm>): Observable<null> {
    return form.get('unitId')?.valueChanges
    .pipe(
      distinctUntilChanged(),
      debounceTime(1000),
      switchMap((value) => {
        this.store.dispatch(new Invoices.GetManInvoiceMeta(value));
        return this.actions$;
      }),
      ofActionCompleted(Invoices.GetManInvoiceMeta),
      map(() => null)
    ) as Observable<null>;
  }

  connectConfigOptions(config: AddManInvoiceDialogConfig, options: ManualInvoiceInputOptions): void {
    config.fields.forEach((item) => {
      if (item.optionsStateKey) {
        item.options = options[item.optionsStateKey] as DropdownOption[];
      }
    });
  }
}