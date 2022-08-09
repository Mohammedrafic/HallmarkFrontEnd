import { Injectable } from '@angular/core';

import { Actions, ofActionCompleted, Store } from '@ngxs/store';
import { map, Observable } from 'rxjs';

import { CustomFormGroup, DropdownOption } from '@core/interface';
import { MessageTypes } from '@shared/enums/message-types';
import { ShowToast } from 'src/app/store/app.actions';
import { AddManInvoiceDialogConfig, AddManInvoiceForm, ManualInvoiceInputOptions,
  ManualInvoiceMeta } from '../../interfaces';
import { InvoiceMetaAdapter } from '../invoice-meta.adapter';
import { ManualInvoiceStrategy } from './strategy.interface';
import { Invoices } from '../../store/actions/invoices.actions';

@Injectable({ providedIn: 'any'})
export class OrganizationStrategy implements ManualInvoiceStrategy {

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
        this.store.dispatch(new ShowToast(MessageTypes.Warning, 'Sorry but such order or position was not found'));
        return;
      }
  
      options.invoiceLocations = InvoiceMetaAdapter.createLocationsOptions(meta);
      options.invoiceCandidates = InvoiceMetaAdapter.createCandidateOptions(meta);
      options.invoiceDepartments = InvoiceMetaAdapter.createDepartmentsOptions(meta);
      options.invoiceAgencies = InvoiceMetaAdapter.createAgencyOptions(meta);

      this.connectConfigOptions(config, options);
  
      form.get('locationId')?.patchValue(options.invoiceLocations[0].value);
      form.get('departmentId')?.patchValue(options.invoiceDepartments[0].value);
      form.get('name')?.patchValue(options.invoiceCandidates[0].value);
      form.get('unitId')?.patchValue(options.invoiceAgencies[0].value);
  }

  getMeta(): Observable<null> {
    this.store.dispatch(new Invoices.GetManInvoiceMeta());

    return this.actions$
      .pipe(
        ofActionCompleted(Invoices.GetManInvoiceMeta),
        map(() => null),
      )
  }

  connectConfigOptions(config: AddManInvoiceDialogConfig, options: ManualInvoiceInputOptions): void {
    config.fields.forEach((item) => {
      if (item.optionsStateKey) {
        item.options = options[item.optionsStateKey] as DropdownOption[];
      }
    });
  }
}