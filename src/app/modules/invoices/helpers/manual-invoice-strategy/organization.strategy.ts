import { Injectable } from '@angular/core';

import { Actions, ofActionCompleted, Store } from '@ngxs/store';
import { map, Observable, zip } from 'rxjs';

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

  public populateOptions(
    meta: ManualInvoiceMeta[],
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

        options.invoiceAgencies = [{
          text: meta[0].agencyName,
          value: meta[0].agencyId,
        }];

        this.connectConfigOptions(config, options);
        form.get('unitId')?.patchValue(meta[0].agencyId, { emitEvent: false, onlySelf: true });
        form.get('nameId')?.patchValue(meta[0].candidateId);

      } else {

        options.invoiceAgencies = InvoiceMetaAdapter.createAgencyOptions(meta);
        this.connectConfigOptions(config, options);
        form.get('unitId')?.patchValue(options.invoiceAgencies[0].value);
        form.get('nameId')?.patchValue(options.invoiceCandidates[0].value);
      }      
  }

  public populateCandidates(
    id: number,
    meta: ManualInvoiceMeta[],
    options: ManualInvoiceInputOptions,
    config: AddManInvoiceDialogConfig,
    orderId: number,
    ): void {
    const metaData = meta.filter((item) => (item.agencyId === id && item.orderId === Number(orderId)));
    options.invoiceCandidates =  InvoiceMetaAdapter.createCandidateOptions(metaData);

    this.connectConfigOptions(config, options);
  }

  public getMeta(): Observable<null> {
    this.store.dispatch(new Invoices.GetManInvoiceMeta());
    this.store.dispatch(new Invoices.GetOrganizationStructure(0, false));

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


}
