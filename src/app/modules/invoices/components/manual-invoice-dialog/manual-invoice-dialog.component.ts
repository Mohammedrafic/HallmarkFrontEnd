import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import {ofActionCompleted, ofActionDispatched, Select} from '@ngxs/store';
import { filter, Observable, takeUntil, tap, distinctUntilChanged, debounceTime, map } from 'rxjs';

import { AddDialogHelper } from '@core/helpers';
import { CustomFormGroup, DropdownOption } from '@core/interface';
import { DialogAction } from '@core/enums';
import { ManualInvoiceDialogConfig } from '../../constants';
import {
  AddManInvoiceDialogConfig,  AddManInvoiceForm,  ManualInvoiceInputOptions,  ManualInvoiceMeta,
  ManualInvoiceReason } from '../../interfaces';
import { Invoices } from '../../store/actions/invoices.actions';
import { InvoiceConfirmMessages } from '../../constants/messages.constant';
import {InvoicesState} from "../../store/state/invoices.state";
import { InvoicesAdapter, InvoiceMetaAdapter } from '../../helpers';

@Component({
  selector: 'app-manual-invoice-dialog',
  templateUrl: './manual-invoice-dialog.component.html',
  styleUrls: ['./manual-invoice-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManualInvoiceDialogComponent extends AddDialogHelper<AddManInvoiceForm> implements OnInit {
  public readonly dialogConfig: AddManInvoiceDialogConfig = ManualInvoiceDialogConfig;

  private searchOptions: ManualInvoiceMeta[];

  private readonly dropDownOptions: ManualInvoiceInputOptions = {
    invoiceLocations: [],
    invoiceDepartments: [],
    invoiceCandidates: [],
    invoiceAgencies: [],
    reasons: [],
  }

  @Select(InvoicesState.invoiceReasons)
  public invoiceReasons$: Observable<ManualInvoiceReason[]>;

  ngOnInit(): void {
    this.getDialogState();
    this.getReasons();
    this.getMeta();
    this.confirmMessages = InvoiceConfirmMessages;
  }

  private getDialogState(): void {
    this.actions$
    .pipe(
      ofActionDispatched(Invoices.ToggleManualInvoiceDialog),
      filter((payload: Invoices.ToggleManualInvoiceDialog) => payload.action === DialogAction.Open),
      tap(() => {
        this.form = this.addService.createForm() as CustomFormGroup<AddManInvoiceForm>;
        this.connectConfigOptions();
        this.watchForSearch();
      }),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(() => {
      this.sideAddDialog.show();
      this.cd.markForCheck();
    });
  }

  public override closeDialog(): void {
    super.closeDialog();
    this.clearDialog();
    this.store.dispatch(new Invoices.ToggleManualInvoiceDialog(DialogAction.Close));
  }

  private getMeta(): void {
    this.actions$
      .pipe(
        ofActionCompleted(Invoices.GetManInvoiceMeta),
        takeUntil(this.componentDestroy()),
      ).subscribe(() => {
      this.searchOptions = this.store.snapshot().invoices.invoiceMeta;
    });
  }

  private getReasons(): void {
    this.invoiceReasons$
      .pipe(
        map((data) => InvoicesAdapter.adaptReasonsToOptions(data)),
        takeUntil(this.componentDestroy()),
      )
      .subscribe((data) => {
        this.dropDownOptions.reasons = data;
      });
  }

  private watchForSearch(): void {
    this.form.get('orderId')?.valueChanges
    .pipe(
      filter((value) => !!value),
      distinctUntilChanged(),
      debounceTime(1000),
      takeUntil(this.componentDestroy()),
    )
    .subscribe((value) => {
      const concatedValue = value.replace(/\s/g, '').toLowerCase();
      this.form.get('orderId')?.patchValue(concatedValue, { emitEvent: false, onlySelf: true });

      const item = this.searchOptions.find((item) => {
        const concatedInputValue = item.formattedOrderId.replace(/\s/g, '').toLowerCase();
        return concatedInputValue === concatedValue;
      });
      
      if (!item) {
        const basedOnOrder = this.searchOptions.filter((item) => item.orderId.toString() === concatedValue);
        this.populateOptions(basedOnOrder);
      } else {
        this.populateOptions([item]);
      }
      this.cd.markForCheck();
    });
  }

  private populateOptions(meta: ManualInvoiceMeta[]): void {
    this.dropDownOptions.invoiceLocations = InvoiceMetaAdapter.createLocationsOptions(meta);
    this.dropDownOptions.invoiceAgencies = InvoiceMetaAdapter.createAgencyOptions(meta);
    this.dropDownOptions.invoiceCandidates = InvoiceMetaAdapter.createCandidateOptions(meta);
    this.dropDownOptions.invoiceDepartments = InvoiceMetaAdapter.createDepartmentsOptions(meta);

    this.connectConfigOptions();

    this.form.get('locationId')?.patchValue(this.dropDownOptions.invoiceLocations[0].value);
    this.form.get('departmentId')?.patchValue(this.dropDownOptions.invoiceDepartments[0].value);
    this.form.get('name')?.patchValue(this.dropDownOptions.invoiceCandidates[0].value);
    this.form.get('unitId')?.patchValue(this.dropDownOptions.invoiceAgencies[0].value);

    console.log(this.form)
  }

  private connectConfigOptions(): void {
    this.dialogConfig.fields.forEach((item) => {
      if (item.optionsStateKey) {
        item.options = this.dropDownOptions[item.optionsStateKey] as DropdownOption[];
        this.cd.markForCheck();
      }
    });
  }

  private clearDialog(): void {
    this.form.reset();
    this.dropDownOptions.invoiceLocations = [];
    this.dropDownOptions.invoiceAgencies = [];
    this.dropDownOptions.invoiceCandidates = [];
    this.dropDownOptions.invoiceDepartments = [];
  }
}
