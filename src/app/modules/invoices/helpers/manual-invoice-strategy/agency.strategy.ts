import { Injectable } from '@angular/core';

import { map, Observable, zip } from 'rxjs';
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

  public populateOptions(meta: ManualInvoiceMeta[],
    options: ManualInvoiceInputOptions,
    form: CustomFormGroup<AddManInvoiceForm>,
    config: AddManInvoiceDialogConfig,
    isPosition: boolean,
    ): void {
      if (!meta.length) {
        this.store.dispatch(new ShowToast(MessageTypes.Warning, 'Sorry, but such order or position was not found'));
        return;
      }

      if (isPosition) {
        options.invoiceCandidates = [{
          text: `${meta[0].candidateFirstName} ${meta[0].candidateLastName}`,
          value: meta[0].candidateId,
        }];
      } else {
        options.invoiceCandidates = InvoiceMetaAdapter.createCandidateOptions(meta);
      }
      this.connectConfigOptions(config, options);
      form.get('nameId')?.patchValue(meta[0].candidateId);
      form.get('locationId')?.patchValue(meta[0].locationId);
      form.get('departmentId')?.patchValue(meta[0].departmentId);
  }

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
    )
  }

  public connectConfigOptions(config: AddManInvoiceDialogConfig, options: ManualInvoiceInputOptions): void {
    config.fields.forEach((item) => {
      if (item.optionsStateKey) {
        item.options = options[item.optionsStateKey] as DropdownOption[];
      }
    });
  }

  public populateCandidates(): void {}
}