import { ChangeDetectionStrategy, Component, OnInit, ProviderToken } from '@angular/core';

import { ofActionDispatched, ofActionSuccessful, Select } from '@ngxs/store';
import { debounceTime, distinctUntilChanged, filter, map, Observable, takeUntil, tap } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

import { OutsideZone } from '@core/decorators';
import { DialogAction, FilesClearEvent, FileSize } from '@core/enums';
import { AddDialogHelper } from '@core/helpers';
import { CustomFormGroup, FileForUpload } from '@core/interface';
import { Attachment } from '@shared/components/attachments';
import { CustomFilesPropModel } from '@shared/components/file-uploader/custom-files-prop-model.interface';
import { MessageTypes } from '@shared/enums/message-types';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion } from '@shared/models/organization.model';
import { ShowToast } from 'src/app/store/app.actions';
import { ManualInvoiceDialogConfig } from '../../constants';
import { InvoiceConfirmMessages } from '../../constants/messages.constant';
import { InvoiceMetaAdapter, InvoicesAdapter, ManualInvoiceAdapter } from '../../helpers';
import { ManualInvoiceStrategy, ManualInvoiceStrategyMap } from '../../helpers/manual-invoice-strategy';
import {
  AddManInvoiceDialogConfig, AddManInvoiceForm, ManualInvoice, ManualInvoiceInputOptions, ManualInvoiceMeta,
  ManualInvoiceReason,
} from '../../interfaces';
import { Invoices } from '../../store/actions/invoices.actions';
import { InvoicesState } from "../../store/state/invoices.state";
import { ManInvoiceOptionsKeys } from '../../enums';
import { PUBLIC_ORDER_ID } from '@shared/constants';
import { AppState } from 'src/app/store/app.state';

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

  public invoiceToEdit: ManualInvoice | null = null;

  public filesForDelete: Attachment[] = [];

  public dialogShown = false;

  public title = '';

  public readonly maxFileSize: number = FileSize.MB_20;

  private searchOptions: ManualInvoiceMeta[];

  private strategy: ManualInvoiceStrategy;

  public reasonId: number;

  private readonly dropDownOptions: ManualInvoiceInputOptions = {
    invoiceLocations: [],
    invoiceDepartments: [],
    invoiceCandidates: [],
    invoiceAgencies: [],
    reasons: [],
  };

  private filesForUpload: FileForUpload[];
  public agencyOrganizationIds:number[]= [];

  private postionSearch: ManualInvoiceMeta | null;

  @Select(InvoicesState.invoiceReasons)
  public invoiceReasons$: Observable<ManualInvoiceReason[]>;

  @Select(InvoicesState.selectedOrgId)
  public selectedOrg$: Observable<number>;

  @Select(InvoicesState.agencyFeeApplicable)
  public agencyFeeApplicable$: Observable<boolean>;

  @Select(AppState.isMobileScreen)
  public readonly isMobile$: Observable<boolean>;

  ngOnInit(): void {
    this.strategy = this.injector.get<ManualInvoiceStrategy>(
      ManualInvoiceStrategyMap.get(this.isAgency) as ProviderToken<ManualInvoiceStrategy>);

    this.form = this.addService.createForm(this.isAgency) as CustomFormGroup<AddManInvoiceForm>;

    this.watchForSearch();
    this.watchForCandidate();
    this.watchForLocation();
    this.watchForAgency();
    this.watchForReason();
    this.getDialogState();
    this.getReasons();
    this.getVendorFee();
    this.confirmMessages = InvoiceConfirmMessages;
  }

  override closeDialog(): void {
    super.closeDialog();
    this.clearDialog();
    this.dropDownOptions.reasons = [];
    this.store.dispatch(new Invoices.ToggleManualInvoiceDialog(DialogAction.Close));
    this.clearFiles = FilesClearEvent.ClearAll;
    this.cd.markForCheck();
  }

  saveManualInvoice(): void {
    if (!this.form?.valid) {
      this.form?.markAllAsTouched();
      this.form?.updateValueAndValidity();
      this.cd.markForCheck();
      return;
    }

    this.selectedOrg$.pipe(takeUntil(this.componentDestroy()))
      .subscribe((orgId: number) => {
        if(this.invoiceToEdit){
          orgId = this.invoiceToEdit.organizationId;
        }
        const dto = this.form?.value ? ManualInvoiceAdapter.adapPostDto(this.form.value, this.searchOptions, orgId) : null;

        if (!dto) {
          this.store.dispatch(new ShowToast(MessageTypes.Warning, 'Sorry such job ID not found'));
          return;
        }

        if (this.invoiceToEdit) {
          this.store.dispatch(new Invoices.UpdateManualInvoice({
            ...dto,
            timesheetId: this.invoiceToEdit.id,
          }, this.agencyOrganizationIds, this.filesForUpload, this.filesForDelete, this.isAgency));
        } else {
          this.store.dispatch(new Invoices.SaveManulaInvoice(dto, this.filesForUpload, this.isAgency));
        }

        this.actions$
        .pipe(
          ofActionSuccessful(Invoices.UpdateManualInvoice, Invoices.SaveManulaInvoice),
          take(1)
        ).subscribe(() => {
          this.closeDialog();
        });
      });
  }

  setFilesForUpload(files: FileForUpload[]): void {
    this.filesForUpload = files;
  }

  setOrderIdOnEdit(): void {
    if (this.invoiceToEdit) {
      const { formattedOrderIdFull } = this.invoiceToEdit;

      this.handleOrderIdChange(formattedOrderIdFull);
    }
  }

  populateLocations(id: number): void {
    const regions = this.store.snapshot().invoices.regions as OrganizationRegion[];
    const [, orderId] = ManualInvoiceAdapter.parseOrderId(this.form?.get('orderId')?.value);

    const candidateLocationId = this.searchOptions?.find((item) => {
      return (item.orderPublicId === orderId
      && item.candidateId === Number(id));
    })?.locationId;

    const candidateRegion = regions.find((item) => {
      return !!item.locations?.find((location) => location.id === candidateLocationId);
    }) as OrganizationRegion;

    const locations = InvoiceMetaAdapter.createLocationsOptions(candidateRegion?.locations || [] as OrganizationLocation[]);
    this.dropDownOptions.invoiceLocations = sortByField(locations, 'text');
    this.strategy.connectConfigOptions(this.dialogConfig, this.dropDownOptions);

    if (this.postionSearch) {
      this.form?.get('locationId')?.patchValue(this.postionSearch.locationId);
    } else {
      this.form?.get('locationId')?.patchValue(this.dropDownOptions.invoiceLocations[0].value);
    }
    this.cd.detectChanges();
  }

  deleteFile({ id }: CustomFilesPropModel): void {
    const file = this.invoiceToEdit?.attachments.find((attachment: Attachment) => attachment.id === id);

    if (file) {
      this.filesForDelete = [...this.filesForDelete, file];
    }
  }

  clearDialogData(): void {
    this.invoiceToEdit = null;
    this.filesForDelete = [];
    this.filesForUpload = [];
    this.dialogShown = false;
  }

  private watchForCandidate(): void {
    this.form?.get('nameId')?.valueChanges
    .pipe(
      filter((value) => !!value),
      takeUntil(this.componentDestroy()),
    )
    .subscribe((id) => {
      this.populateLocations(id);
    });
  }

  private getDialogState(): void {
    this.actions$
    .pipe(
      ofActionDispatched(Invoices.ToggleManualInvoiceDialog),
      filter((payload: Invoices.ToggleManualInvoiceDialog) => payload.action === DialogAction.Open),
      tap(({ invoice,agencyOrganizationIds }) => {
        this.invoiceToEdit = invoice || null;
        this.title = invoice ? this.dialogConfig.editTitle : this.dialogConfig.title;
        this.clearFiles = null;
        this.dialogShown = true;
        if(agencyOrganizationIds){
          this.agencyOrganizationIds = agencyOrganizationIds;
        }
        this.strategy.connectConfigOptions(this.dialogConfig, this.dropDownOptions);
        this.sideAddDialog.show();
        this.cd.markForCheck();
      }),
      switchMap(() => this.strategy.getMeta(this.form as CustomFormGroup<AddManInvoiceForm>,this.invoiceToEdit?.organizationId)),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(() => {
      this.searchOptions = this.store.snapshot().invoices.invoiceMeta;

      this.setOrderIdOnEdit();
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
        this.setOrderIdOnEdit();
        this.cd.markForCheck();
      });
  }

  private watchForSearch(): void {
    this.form?.get('orderId')?.valueChanges
    .pipe(
      debounceTime(1000),
      tap((value) => {
        if (!value) {
           this.clearOptions();
        }
      }),
      filter((value) => !!value && PUBLIC_ORDER_ID.test(value)),
      distinctUntilChanged(),
      tap(() => this.clearDialog()),
      takeUntil(this.componentDestroy()),
    )
    .subscribe((value: string) => this.handleOrderIdChange(value));
  }

  @OutsideZone
  private handleOrderIdChange(value: string): void {
    const concatenatedValue: string = value.replace(/\s/g, '').toUpperCase();
    const [currentOrgPrefix, currentOrderId, currentPosition] = ManualInvoiceAdapter.parseOrderId(concatenatedValue);

    this.form?.get('orderId')?.patchValue(concatenatedValue, { emitEvent: false, onlySelf: true });
    this.form?.get('nameId')?.patchValue(null);

    if (this.isAgency) {
      this.form?.get('unitId')?.patchValue(this.store.snapshot().invoices.selectedOrganizationId);
    }

    const items = this.searchOptions?.filter((item: ManualInvoiceMeta) => {
      const [orgPrefix, orderId, position] = ManualInvoiceAdapter.parseOrderId(item.formattedOrderIdFull);
      const orgPrefixMatch: boolean = currentOrgPrefix ? currentOrgPrefix === orgPrefix : true;
      const orderIdMatch: boolean = currentOrderId === orderId;
      const positionMatch: boolean =  currentPosition === null || currentPosition === position;

      return orgPrefixMatch && orderIdMatch && positionMatch;
    });

    setTimeout(() => {
      if (!items?.length) {
        this.postionSearch = null;
        const basedOnOrder = this.searchOptions?.filter((item) => item.orderPublicId.toString() === concatenatedValue) || [];

        this.strategy.populateOptions(basedOnOrder, this.dropDownOptions,
          this.form as CustomFormGroup<AddManInvoiceForm>, this.dialogConfig, false);

      } else {
        this.postionSearch = items[0];

        this.strategy.populateOptions(items, this.dropDownOptions,
          this.form as CustomFormGroup<AddManInvoiceForm>, this.dialogConfig, true);
      }

      this.setFormValuesOnEdit();
    });
    this.cd.markForCheck();
  }

  private setFormValuesOnEdit(): void {
    if (this.invoiceToEdit) {
      const {
        amount: value,
        serviceDate: date,
        linkedInvoiceId: link,
        vendorFeeApplicable: vendorFee,
        reasonId,
        comment,
        locationId,
      } = this.invoiceToEdit;

      this.form?.patchValue({
        value,
        link,
        date,
        vendorFee,
        reasonId,
        description: comment,
      }, { emitEvent: false });
      this.form?.get('locationId')?.patchValue(locationId);
      this.cd.markForCheck();
    }
  }

  private watchForLocation(): void {
    this.form?.controls['locationId'].valueChanges
    .pipe(
      filter((value) => !!value),
      takeUntil(this.componentDestroy())
    )
    .subscribe((id) => {
      this.populateDepartments(id);
    });
  }

  private watchForAgency(): void {
    this.form?.controls['unitId'].valueChanges
    .pipe(
      filter((value) => !!value),
      takeUntil(this.componentDestroy())
    )
    .subscribe((id) => {
      const orderId = this.form?.get('orderId')?.value;

      this.strategy.populateCandidates(id, this.searchOptions, this.dropDownOptions, this.dialogConfig, orderId);
      this.cd.markForCheck();
    });
  }

  private watchForReason(): void {
    this.form?.controls['reasonId'].valueChanges
      .pipe(
        filter((value) => !!value),
        takeUntil(this.componentDestroy())
      )
      .subscribe(() => {
        const reasonId = this.form?.get('reasonId')?.value;

        if (this.dropDownOptions.reasons) {
          this.store.dispatch(new Invoices.GetAgencyFeeApplicable(reasonId));
        }
      });
  }

  private getVendorFee(): void {
    this.agencyFeeApplicable$
      .pipe(
        takeUntil(this.componentDestroy())
      )
      .subscribe((data) => {
        this.form?.get('vendorFee')?.patchValue(data);
      }
    )
  }

  private clearDialog(): void {
    this.form?.reset({
      vendorFee: true,
    }, { emitEvent: false });
    this.dropDownOptions.invoiceLocations = [];
    this.dropDownOptions.invoiceAgencies = [];
    this.dropDownOptions.invoiceCandidates = [];
    this.dropDownOptions.invoiceDepartments = [];
    this.filesForUpload = [];
  }

  private populateDepartments(id: number): void {
    const locations: OrganizationLocation[] = this.store.snapshot().invoices.organizationLocations;
    const deps = locations.find((location) => location.id === id)?.departments as OrganizationDepartment[];
    if(deps.length){
      this.dropDownOptions.invoiceDepartments=[];
      this.dropDownOptions.invoiceDepartments = sortByField(InvoiceMetaAdapter.createDepartmentsOptions(deps), 'text');
      this.strategy.connectConfigOptions(this.dialogConfig, this.dropDownOptions);
      this.dropDownOptions.invoiceDepartments = [...this.dropDownOptions.invoiceDepartments];
      this.updateOptions();
    }

  }

  private updateOptions(): void {
    this.strategy.connectConfigOptions(this.dialogConfig, this.dropDownOptions);
    if(this.invoiceToEdit?.departmentId){
      this.form?.get('departmentId')?.patchValue(this.invoiceToEdit?.departmentId);
    }else{
      if (this.postionSearch) {
        this.form?.get('departmentId')?.patchValue(this.postionSearch.departmentId);
      } else {
        this.form?.get('departmentId')?.patchValue(this.dropDownOptions.invoiceDepartments[0].value);
      }
    }
    this.cd.markForCheck();
  }

  private clearOptions(): void {
    this.form?.reset({
      vendorFee: true,
    }, { emitEvent: false });
    this.dropDownOptions.invoiceLocations = [];
    this.dropDownOptions.invoiceAgencies = [];
    this.dropDownOptions.invoiceCandidates = [];
    this.dropDownOptions.invoiceDepartments = [];
    this.filesForUpload = [];
    this.dialogConfig.fields.forEach((conf) => {
      if (conf.optionsStateKey && conf.optionsStateKey !== ManInvoiceOptionsKeys.Reasons) {
        conf.options = [];
      }
    });

    this.cd.markForCheck();
  }
}
