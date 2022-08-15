import { ChangeDetectionStrategy, Component, OnInit, ProviderToken } from '@angular/core';

import { ofActionDispatched, Select } from '@ngxs/store';
import { filter, Observable, takeUntil, tap, distinctUntilChanged, debounceTime, map } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { AddDialogHelper } from '@core/helpers';
import { CustomFormGroup, FileForUpload } from '@core/interface';
import { DialogAction, FilesClearEvent } from '@core/enums';
import { OrganizationLocation, OrganizationDepartment, OrganizationRegion } from '@shared/models/organization.model';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { ManualInvoiceDialogConfig } from '../../constants';
import {
  AddManInvoiceDialogConfig,   AddManInvoiceForm, ManualInvoiceInputOptions,  ManualInvoiceMeta,
  ManualInvoiceReason } from '../../interfaces';
import { Invoices } from '../../store/actions/invoices.actions';
import { InvoiceConfirmMessages } from '../../constants/messages.constant';
import { InvoicesState } from "../../store/state/invoices.state";
import { InvoiceMetaAdapter, InvoicesAdapter, ManualInvoiceAdapter } from '../../helpers';
import { ManualInvoiceStrategy, ManualInvoiceStrategyMap } from '../../helpers/manual-invoice-strategy';

@Component({
  selector: 'app-manual-invoice-dialog',
  templateUrl: './manual-invoice-dialog.component.html',
  styleUrls: ['./manual-invoice-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManualInvoiceDialogComponent extends AddDialogHelper<AddManInvoiceForm> implements OnInit {
  public readonly dialogConfig: AddManInvoiceDialogConfig = ManualInvoiceDialogConfig(this.isAgency);

  public readonly today = new Date();

  public clearFiles: FilesClearEvent | null;

  private searchOptions: ManualInvoiceMeta[];

  private strategy: ManualInvoiceStrategy;

  private readonly dropDownOptions: ManualInvoiceInputOptions = {
    invoiceLocations: [],
    invoiceDepartments: [],
    invoiceCandidates: [],
    invoiceAgencies: [],
    reasons: [],
  }

  private filesForUpload: FileForUpload[];

  private postionSearch: ManualInvoiceMeta | null;

  @Select(InvoicesState.invoiceReasons)
  public invoiceReasons$: Observable<ManualInvoiceReason[]>;

  @Select(InvoicesState.selectedOrgId)
  public selectedOrg$: Observable<number>;

  ngOnInit(): void {
    this.strategy = this.injector.get<ManualInvoiceStrategy>(
      ManualInvoiceStrategyMap.get(this.isAgency) as ProviderToken<ManualInvoiceStrategy>);
      
    this.form = this.addService.createForm(this.isAgency) as CustomFormGroup<AddManInvoiceForm>;

    this.watchForSearch();
    this.watchForCandidate();
    this.watchForLocation();
    this.watchForAgency();
    this.watchForCandidate();
    this.watchForLocation();
    this.watchForAgency();
    this.getDialogState();
    this.getReasons();
    this.confirmMessages = InvoiceConfirmMessages;
  }

  public override closeDialog(): void {
    super.closeDialog();
    this.clearDialog();
    this.dropDownOptions.reasons = [];
    this.store.dispatch(new Invoices.ToggleManualInvoiceDialog(DialogAction.Close));
    this.clearFiles = FilesClearEvent.ClearAll;
    this.cd.markForCheck();
  }

  public saveManualInvoice(): void {
    if (!this.form.valid) {
      this.form.updateValueAndValidity();
      this.cd.markForCheck();
      return;
    }

    const orgId = this.store.snapshot().user.lastSelectedOrganizationId;
    const dto = ManualInvoiceAdapter.adapPostDto(this.form.value, this.searchOptions, orgId);

    if (!dto) {
      this.store.dispatch(new ShowToast(MessageTypes.Warning, 'Sorry such job ID not found'));
      return;
    }

    this.store.dispatch(new Invoices.SaveManulaInvoice(dto, this.filesForUpload, this.isAgency));
    this.closeDialog();
  }

  public setFilesForUpload(files: FileForUpload[]): void {
    this.filesForUpload = files;
  }

  private getDialogState(): void {
    this.actions$
    .pipe(
      ofActionDispatched(Invoices.ToggleManualInvoiceDialog),
      filter((payload: Invoices.ToggleManualInvoiceDialog) => payload.action === DialogAction.Open),
      tap(() => {
        this.clearFiles = null;
        this.strategy.connectConfigOptions(this.dialogConfig, this.dropDownOptions);
        this.sideAddDialog.show();
        this.cd.markForCheck();
      }),
      switchMap(() => this.strategy.getMeta(this.form)),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(() => {
      this.searchOptions = this.store.snapshot().invoices.invoiceMeta;
      this.cd.markForCheck();
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
        this.cd.markForCheck();
      });
  }

  private watchForSearch(): void {
    this.form.get('orderId')?.valueChanges
    .pipe(
      filter((value) => !!value),
      distinctUntilChanged(),
      debounceTime(1000),
      tap(() => this.clearDialog()),
      takeUntil(this.componentDestroy()),
    )
    .subscribe((value) => {
      const concatedValue = value.replace(/\s/g, '').toLowerCase();
      this.form.get('orderId')?.patchValue(concatedValue, { emitEvent: false, onlySelf: true });
      if (this.isAgency) {
        this.form.get('unitId')?.patchValue(this.store.snapshot().invoices.selectedOrganizationId);
      }
      const item = this.searchOptions.find((item) => {
        const concatedInputValue = item.formattedOrderId.replace(/\s/g, '').toLowerCase();
        return concatedInputValue === concatedValue;
      });
      
      if (!item) {
        this.postionSearch = null;
        this.postionSearch = null;
        const basedOnOrder = this.searchOptions.filter((item) => item.orderId.toString() === concatedValue) || [];
        this.strategy.populateOptions(basedOnOrder, this.dropDownOptions, this.form, this.dialogConfig, false);
      } else {
        this.postionSearch = item;
        this.strategy.populateOptions([item], this.dropDownOptions, this.form, this.dialogConfig, true);
      }
      this.cd.markForCheck();
    });
  }

  private watchForCandidate(): void {
    this.form.get('nameId')?.valueChanges
    .pipe(
      filter((value) => !!value),
      takeUntil(this.componentDestroy()),
    )
    .subscribe((id) => {
      this.populateLocations(id);
    });
  }

  public populateLocations(id: number): void {
    const regions = this.store.snapshot().invoices.regions as OrganizationRegion[];
    const orderId = this.form.get('orderId')?.value.split('-')[0];

    const candidateLocationId = this.searchOptions.find((item) => {
      return (item.orderId === Number(orderId)
      && item.candidateId === Number(id));
    })?.locationId;

    const candidateRegion = regions.find((item) => {
      return !!item.locations?.find((location) => location.id === candidateLocationId)
    }) as OrganizationRegion;

    const locations = InvoiceMetaAdapter.createLocationsOptions(candidateRegion?.locations || [] as OrganizationLocation[]);
    this.dropDownOptions.invoiceLocations = locations;
    this.strategy.connectConfigOptions(this.dialogConfig, this.dropDownOptions);
    if (this.postionSearch) {
      this.form.get('locationId')?.patchValue(this.postionSearch.locationId);
    } else {
      this.form.get('locationId')?.patchValue(this.dropDownOptions.invoiceLocations[0].value);
    }
    this.cd.markForCheck();
  }

  private watchForLocation(): void {
    this.form.controls['locationId'].valueChanges
    .pipe(
      filter((value) => !!value),
      takeUntil(this.componentDestroy())
    )
    .subscribe((id) => {
      this.populateDepartments(id);
    });
  }

  private watchForAgency(): void {
    this.form.controls['unitId'].valueChanges
    .pipe(
      filter((value) => !!value),
      takeUntil(this.componentDestroy())
    )
    .subscribe((id) => {
      const orderId = this.form.get('orderId')?.value;

      this.strategy.populateCandidates(id, this.searchOptions, this.dropDownOptions, this.dialogConfig, orderId);
      this.cd.markForCheck();
    });
  }

  private clearDialog(): void {
    this.form.reset({
      vendorFee: true,
    });
    this.dropDownOptions.invoiceLocations = [];
    this.dropDownOptions.invoiceAgencies = [];
    this.dropDownOptions.invoiceCandidates = [];
    this.dropDownOptions.invoiceDepartments = [];
    this.filesForUpload = [];
  }

  private populateDepartments(id: number): void {
    const locations: OrganizationLocation[] = this.store.snapshot().invoices.organizationLocations;
    const deps = locations.find((location) => location.id === id)?.departments as OrganizationDepartment[];
    
    this.dropDownOptions.invoiceDepartments = InvoiceMetaAdapter.createDepartmentsOptions(deps);
    this.updateOptions();
  }

  private updateOptions(): void {
    this.strategy.connectConfigOptions(this.dialogConfig, this.dropDownOptions);
    if (this.postionSearch) {
      this.form.get('departmentId')?.patchValue(this.postionSearch.departmentId);
    } else {
      this.form.get('departmentId')?.patchValue(this.dropDownOptions.invoiceDepartments[0].value);
    }
    this.cd.markForCheck();
  }
}
