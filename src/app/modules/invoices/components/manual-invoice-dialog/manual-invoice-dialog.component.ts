import { switchMap } from 'rxjs/operators';
import { ChangeDetectionStrategy, Component, OnInit, ProviderToken } from '@angular/core';

import {ofActionCompleted, ofActionDispatched, Select} from '@ngxs/store';
import { filter, Observable, takeUntil, tap, distinctUntilChanged, debounceTime, map } from 'rxjs';

import { AddDialogHelper } from '@core/helpers';
import { CustomFormGroup, DropdownOption } from '@core/interface';
import { DialogAction } from '@core/enums';
import { ManualInvoiceDialogConfig } from '../../constants';
import {
  AddManInvoiceDialogConfig,   AddManInvoiceForm, ManualInvoiceInputOptions,  ManualInvoiceMeta,
  ManualInvoiceReason } from '../../interfaces';
import { Invoices } from '../../store/actions/invoices.actions';
import { InvoiceConfirmMessages } from '../../constants/messages.constant';
import {InvoicesState} from "../../store/state/invoices.state";
import { InvoicesAdapter } from '../../helpers';
import { ManualInvoiceStrategy, ManualInvoiceStrategyMap } from '../../helpers/manual-invoice-strategy';


@Component({
  selector: 'app-manual-invoice-dialog',
  templateUrl: './manual-invoice-dialog.component.html',
  styleUrls: ['./manual-invoice-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManualInvoiceDialogComponent extends AddDialogHelper<AddManInvoiceForm> implements OnInit {
  public readonly dialogConfig: AddManInvoiceDialogConfig = ManualInvoiceDialogConfig(this.isAgency);

  private searchOptions: ManualInvoiceMeta[];

  private strategy: ManualInvoiceStrategy;

  private readonly dropDownOptions: ManualInvoiceInputOptions = {
    invoiceLocations: [],
    invoiceDepartments: [],
    invoiceCandidates: [],
    invoiceAgencies: [],
    reasons: [],
    organizations: [],
  }

  @Select(InvoicesState.invoiceReasons)
  public invoiceReasons$: Observable<ManualInvoiceReason[]>;

  ngOnInit(): void {
    this.strategy = this.injector.get<ManualInvoiceStrategy>(
      ManualInvoiceStrategyMap.get(this.isAgency) as ProviderToken<ManualInvoiceStrategy>);
    this.getDialogState();
    this.getReasons();
    this.getOrganizationList();
    this.confirmMessages = InvoiceConfirmMessages;
  }

  private getDialogState(): void {
    this.actions$
    .pipe(
      ofActionDispatched(Invoices.ToggleManualInvoiceDialog),
      filter((payload: Invoices.ToggleManualInvoiceDialog) => payload.action === DialogAction.Open),
      tap(() => {
        this.form = this.addService.createForm() as CustomFormGroup<AddManInvoiceForm>;
        this.strategy.connectConfigOptions(this.dialogConfig, this.dropDownOptions);
        this.watchForSearch();
        this.sideAddDialog.show();
        this.cd.markForCheck();
      }),
      switchMap(() => this.strategy.getMeta(this.form)),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(() => {
      console.log()
      this.searchOptions = this.store.snapshot().invoices.invoiceMeta;
      this.cd.markForCheck();
    });;
  }

  public override closeDialog(): void {
    super.closeDialog();
    this.clearDialog();
    this.store.dispatch(new Invoices.ToggleManualInvoiceDialog(DialogAction.Close));
  }

  public saveManualInvoice(): void {
    if (this.form.valid) {

    }
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
        const basedOnOrder = this.searchOptions.filter((item) => item.orderId.toString() === concatedValue) || [];
        this.strategy.populateOptions(basedOnOrder, this.dropDownOptions, this.form, this.dialogConfig);
      } else {
        this.strategy.populateOptions([item], this.dropDownOptions, this.form, this.dialogConfig);
      }
      this.cd.markForCheck();
    });
  }

  private clearDialog(): void {
    this.form.reset();
    this.searchOptions = [];
    this.dropDownOptions.invoiceLocations = [];
    this.dropDownOptions.invoiceAgencies = [];
    this.dropDownOptions.invoiceCandidates = [];
    this.dropDownOptions.invoiceDepartments = [];
    this.dropDownOptions.organizations = [];
  }

  private getOrganizationList(): void {
    if (this.isAgency) {
      this.store.dispatch(new Invoices.GetOrganizations());

      this.actions$
      .pipe(
        ofActionCompleted(Invoices.GetOrganizations),
        takeUntil(this.componentDestroy()),
      )
      .subscribe(() => {
        this.dropDownOptions.organizations = this.store.snapshot().invoices.organizations;
        this.cd.markForCheck();
      })
    }
  }
}
