import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { DetailRowService, GridComponent } from '@syncfusion/ej2-angular-grids';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Department } from '@shared/models/department.model';
import { Location } from '@shared/models/location.model';
import { Region } from '@shared/models/region.model';
import {
  OrganizationSettingFilter,
  OrganizationSettingsDropDownOption,
  OrganizationSettingsGet,
  OrganizationSettingsPost,
  OrganizationSettingValidation,
} from '@shared/models/organization-settings.model';
import { OrganizationSettingControlType } from '@shared/enums/organization-setting-control-type';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import {
  ClearDepartmentList,
  ClearLocationList,
  GetDepartmentsByLocationId,
  GetLocationsByRegionId,
  GetOrganizationSettings,
  GetOrganizationSettingsFilterOptions,
  GetRegions,
  SaveOrganizationSettings,
} from '../store/organization-management.actions';
import { ShowFilterDialog, ShowSideDialog } from '../../store/app.actions';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants/messages';
import { ConfirmService } from '@shared/services/confirm.service';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { OrganizationHierarchy } from '@shared/enums/organization-hierarchy';
import { OrganizationSettingValidationType } from '@shared/enums/organization-setting-validation-type';
import { OrganizationManagementState } from '../store/organization-management.state';
import { customEmailValidator } from '@shared/validators/email.validator';
import { UserState } from '../../store/user.state';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { OrganizationLocation, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { GetOrganizationStructure } from '../../store/user.actions';
import { PermissionService } from 'src/app/security/services/permission.service';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import { Days } from '@shared/enums/days';
import { groupInvoicesOptions } from 'src/app/modules/invoices/constants';
import { SettingsFilterCols } from './settings.constant';
import { SettingsDataAdapter } from './helpers/settings-data.adapter';

export enum TextFieldTypeControl {
  Email = 1,
  Numeric = 2,
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  providers: [DetailRowService, MaskedDateTimeService],
})
export class SettingsComponent extends AbstractPermissionGrid implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;

  public organizationSettingsFormGroup: FormGroup;
  public regionFormGroup: FormGroup;
  public regionRequiredFormGroup: FormGroup;
  public locationFormGroup: FormGroup;
  public departmentFormGroup: FormGroup;
  public pushStartDateFormGroup: FormGroup;
  public invoiceGeneratingFormGroup: FormGroup;
  public formBuilder: FormBuilder;

  public readonly daysOfWeek = Days;
  public readonly daysOfWeekFields = {
    text: 'text',
    value: 'id',
  };

  public readonly groupInvoicesOptions = groupInvoicesOptions;
  public readonly groupInvoicesFields = {
    text: 'text',
    value: 'id',
  };

  @Select(OrganizationManagementState.organizationSettings)
  public settings$: Observable<OrganizationSettingsGet[]>;

  @Select(OrganizationManagementState.regions)
  regions$: Observable<Region[]>;

  @Select(OrganizationManagementState.organizationSettingsFilterOptions)
  organizationSettingsFilterOptions$: Observable<string[]>;

  @Select(OrganizationManagementState.locationsByRegionId)
  locations$: Observable<Location[]>;

  public regionLocationFields: FieldSettingsModel = { text: 'name', value: 'id' };

  @Select(OrganizationManagementState.departments)
  departments$: Observable<Department[]>;
  public departmentFields: FieldSettingsModel = { text: 'departmentName', value: 'departmentId' };

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  @Select(UserState.organizationStructure)
  organizationStructure$: Observable<OrganizationStructure>;
  public orgStructure: OrganizationStructure;
  public orgRegions: OrganizationRegion[] = [];
  public allRegions: OrganizationRegion[] = [];

  public isEdit: boolean;
  public isParentEdit = false;
  public isFormShown = false;
  public organizationSettingControlType = OrganizationSettingControlType;
  public formControlType: number;

  public dropdownDataSource: OrganizationSettingsDropDownOption[];
  public dropdownFields: FieldSettingsModel = { text: 'value', value: 'key' };

  public organizationHierarchy: number;
  public organizationHierarchyId: number;

  public textFieldType: number;
  public textFieldTypeControl = TextFieldTypeControl;
  public organizationId: number;
  public maxFieldLength = 100;
  public hasPermissions: Record<string, boolean> = {};
  public settingKeys: string[] = [
    'AllowDocumentUpload',
    'AllowAgencyToBidOnCandidateBillRateBeyondOrderBillRate',
    'AutoLockOrder',
    'IsReOrder',
  ];

  get dialogHeader(): string {
    return this.isEdit ? 'Edit' : 'Add';
  }
  get switcherValue(): string {
    return this.organizationSettingsFormGroup.controls['value'].value ? 'on' : 'off';
  }

  private unsubscribe$: Subject<void> = new Subject();

  public SettingsFilterFormGroup: FormGroup;
  public filters: OrganizationSettingFilter = {};
  public filterColumns = SettingsFilterCols;

  public optionFields = {
    text: 'name',
    value: 'id',
  };

  constructor(
    protected override store: Store,
    @Inject(FormBuilder) private builder: FormBuilder,
    private confirmService: ConfirmService,
    private filterService: FilterService,
    private permissionService: PermissionService
  ) {
    super(store);
    this.formBuilder = builder;
    this.createSettingsForm();
    this.createRegionLocationDepartmentForm();
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.watchForOrgId();
    this.mapGridData();
    this.watchForStructure();
    this.watchForSFilterOptions();
    this.watchForRegionControl();
    this.watchForLocationControl();
    this.setPermissionsToManageSettings();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private getSettings(): void {
    this.store.dispatch(new GetOrganizationSettings(this.filters));
    this.store.dispatch(new GetRegions());
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public onFilterClose() {
    this.SettingsFilterFormGroup.setValue({
      regionIds: this.filters.regionIds || [],
      locationIds: this.filters.locationIds || [],
      departmentIds: this.filters.departmentIds || [],
      attributes: this.filters.attributes || [],
    });
    this.filteredItems = this.filterService.generateChips(this.SettingsFilterFormGroup, this.filterColumns);
  }

  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.SettingsFilterFormGroup, this.filterColumns);
  }

  private clearFilters(): void {
    this.SettingsFilterFormGroup.reset();
    this.filteredItems = [];
    this.currentPage = 1;
    this.filters = {};
  }

  public onFilterClearAll(): void {
    this.clearFilters();
    this.getSettings();
  }

  public onFilterApply(): void {
    this.filters = this.SettingsFilterFormGroup.getRawValue();
    this.filteredItems = this.filterService.generateChips(this.SettingsFilterFormGroup, this.filterColumns);
    this.getSettings();
    this.store.dispatch(new ShowFilterDialog(false));
  }

  public onOverrideButtonClick(data: any): void {
    this.isFormShown = true;
    this.formControlType = data.controlType;
    this.regionFormGroup.reset();
    this.regionRequiredFormGroup.reset();
    this.locationFormGroup.reset();
    this.departmentFormGroup.reset();
    this.store.dispatch(new ClearLocationList());
    this.store.dispatch(new ClearDepartmentList());
    this.setFormValidation(data);
    this.setFormValuesForOverride(data);
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onEditButtonClick(parentRecord: any, childRecord: any, event: any): void {
    this.store.dispatch(new GetOrganizationStructure());
    this.isFormShown = true;
    this.addActiveCssClass(event);
    this.isEdit = true;
    this.formControlType = parentRecord.controlType;
    this.setFormValidation(parentRecord);

    if (!childRecord) {
      this.isParentEdit = true;
      this.organizationHierarchy = OrganizationHierarchy.Organization;
      this.organizationHierarchyId = this.organizationId;
      this.setFormValuesForEdit(parentRecord, null);
    } else {
      if (childRecord.regionId) {
        this.regionChanged(childRecord.regionId);
      } else {
        this.store.dispatch(new ClearLocationList());
        this.store.dispatch(new ClearDepartmentList());
      }

      if (childRecord.locationId) {
        this.locationChanged(childRecord.locationId);
      } else {
        this.store.dispatch(new ClearDepartmentList());
      }

      if (childRecord.departmentId) {
        this.departmentChanged(childRecord.departmentId);
      }

      this.setFormValuesForEdit(parentRecord, childRecord);
    }

    this.store.dispatch(new ShowSideDialog(true));
  }

  public onFormCancelClick(): void {
    if (
      this.organizationSettingsFormGroup.dirty ||
      this.regionFormGroup.dirty ||
      this.regionRequiredFormGroup.dirty ||
      this.locationFormGroup.dirty ||
      this.departmentFormGroup.dirty ||
      this.pushStartDateFormGroup.dirty ||
      this.invoiceGeneratingFormGroup.dirty
    ) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(filter((confirm) => !!confirm))
        .subscribe(() => {
          this.store.dispatch(new ShowSideDialog(false));
          this.removeActiveCssClass();
          this.clearFormDetails();
          this.isFormShown = false;
        });
    } else {
      this.store.dispatch(new ShowSideDialog(false));
      this.removeActiveCssClass();
      this.clearFormDetails();
      this.isFormShown = false;
    }
  }

  public onFormSaveClick(): void {
    if (this.isEdit) {
      if (
        this.organizationSettingsFormGroup.valid &&
        this.isPushStartDateValid() &&
        this.invoiceAutoGeneratingValig()
      ) {
        this.sendForm();
      } else {
        this.organizationSettingsFormGroup.markAllAsTouched();
        this.validatePushStartDateForm();
        this.validateInvoiceGeneratingForm();
      }
    } else {
      if (this.regionRequiredFormGroup.valid && this.isPushStartDateValid() && this.invoiceAutoGeneratingValig()) {
        if (this.organizationSettingsFormGroup.valid) {
          this.sendForm();
        } else {
          this.organizationSettingsFormGroup.markAllAsTouched();
          this.validatePushStartDateForm();
          this.validateInvoiceGeneratingForm();
        }
      } else {
        this.regionRequiredFormGroup.markAllAsTouched();
        this.validatePushStartDateForm();
        this.validateInvoiceGeneratingForm();
      }
    }
  }

  private isPushStartDateValid(): boolean {
    return (
      this.formControlType !== OrganizationSettingControlType.FixedKeyDictionary || this.pushStartDateFormGroup.valid
    );
  }

  private validatePushStartDateForm(): void {
    if (
      this.formControlType === OrganizationSettingControlType.FixedKeyDictionary &&
      this.pushStartDateFormGroup.invalid
    ) {
      this.pushStartDateFormGroup.markAllAsTouched();
    }
  }

  private invoiceAutoGeneratingValig(): boolean {
    return (
      this.formControlType !== OrganizationSettingControlType.InvoiceAutoGeneration ||
      this.invoiceGeneratingFormGroup.valid
    );
  }

  private validateInvoiceGeneratingForm(): void {
    if (
      this.formControlType === OrganizationSettingControlType.InvoiceAutoGeneration &&
      this.invoiceGeneratingFormGroup.invalid
    ) {
      this.invoiceGeneratingFormGroup.markAllAsTouched();
    }
  }

  public onRegionChange(event: any): void {
    if (event.itemData && event.itemData.id) {
      this.store.dispatch(new ClearLocationList());
      this.store.dispatch(new ClearDepartmentList());
      this.regionChanged(event.itemData.id);
    }
  }

  public onLocationChange(event: any): void {
    if (event.itemData && event.itemData.id) {
      this.locationChanged(event.itemData.id);
    }
  }

  public onDepartmentChange(event: any): void {
    if (event.itemData && event.itemData.departmentId) {
      this.departmentChanged(event.itemData.departmentId);
    }
  }

  public mapGridData(): void {
    this.settings$
    .pipe(
      takeUntil(this.unsubscribe$),
    )
    .subscribe((data) => {
      this.lastAvailablePage = this.getLastPage(data);
      const adaptedData = SettingsDataAdapter.adaptSettings(data);
      this.gridDataSource = this.getRowsPerPage(adaptedData, this.currentPagerPage);
      this.totalDataRecords = adaptedData.length;
    });
  }

  public rowDataBound(args: any): void {
    // hides expand button if no children
    if (args.data.children.length === 0) {
      args.row.querySelector('td').innerHTML = ' ';
      args.row.querySelector('td').className = 'e-customized-expand-cell';
    }
  }

  public onRowsDropDownChanged(): void {
    this.grid.pageSettings.pageSize = this.pageSizePager = this.getActiveRowsPerPage();
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.settings$.subscribe((data) => {
        this.gridDataSource = this.getRowsPerPage(data, event.currentPage || event.value);
        this.currentPagerPage = event.currentPage || event.value;
      });
    }
  }

  private sendForm(): void {
    let dynamicValue: any;

    switch (this.organizationSettingsFormGroup.controls['controlType'].value) {
      case OrganizationSettingControlType.Multiselect:
        const options: string[] = [];
        if (this.organizationSettingsFormGroup.controls['value'].value) {
          this.organizationSettingsFormGroup.controls['value'].value.forEach((item: string) => options.push(item));
        }
        dynamicValue = options.join(';');
        break;
      case OrganizationSettingControlType.Checkbox:
        dynamicValue = this.organizationSettingsFormGroup.controls['value'].value
          ? this.organizationSettingsFormGroup.controls['value'].value.toString()
          : 'false';
        break;
      case OrganizationSettingControlType.Text:
        dynamicValue = this.organizationSettingsFormGroup.controls['value'].value?.toString();
        break;

      case OrganizationSettingControlType.FixedKeyDictionary:
        const pushStartDate = {
          isEnabled: this.organizationSettingsFormGroup.controls['value'].value,
          daysToPush: this.pushStartDateFormGroup.controls['daysToPush'].value,
          daysToConsider: this.pushStartDateFormGroup.controls['daysToConsider'].value,
        };
        dynamicValue = JSON.stringify(pushStartDate);
        break;

      case OrganizationSettingControlType.InvoiceAutoGeneration:
        const invoiceAutoGeneration = {
          isEnabled: this.organizationSettingsFormGroup.controls['value'].value,

          dayOfWeek: this.invoiceGeneratingFormGroup.controls['dayOfWeek'].value,

          groupingBy: this.invoiceGeneratingFormGroup.controls['groupingBy'].value,

          time: this.invoiceGeneratingFormGroup.controls['time'].value,
        };
        dynamicValue = JSON.stringify(invoiceAutoGeneration);
        break;

      default:
        dynamicValue = this.organizationSettingsFormGroup.controls['value'].value;
        break;
    }

    const setting: OrganizationSettingsPost = {
      settingValueId: this.organizationSettingsFormGroup.controls['settingValueId'].value,
      settingKey: this.organizationSettingsFormGroup.controls['settingKey'].value,
      hierarchyId: this.organizationHierarchyId,
      hierarchyLevel: this.organizationHierarchy,
      value: dynamicValue,
    };

    this.store.dispatch(new SaveOrganizationSettings(setting));
    this.store.dispatch(new ShowSideDialog(false));
    this.removeActiveCssClass();
    this.clearFormDetails();
    this.isFormShown = false;
  }

  private setFormValidation(data: any): void {
    let validators: ValidatorFn[] = [];
    data.validations.forEach((validation: OrganizationSettingValidation) => {
      switch (validation.key) {
        case OrganizationSettingValidationType.Required:
          validators.push(Validators.required);
          break;
        case OrganizationSettingValidationType.MaxLength:
          if (validation.value) {
            validators.push(Validators.maxLength(parseInt(validation.value)));
            this.maxFieldLength = parseInt(validation.value);
          }
          break;
        case OrganizationSettingValidationType.Email:
          this.textFieldType = TextFieldTypeControl.Email;
          validators.push(customEmailValidator);
          break;
        case OrganizationSettingValidationType.DigitsOnly:
          this.textFieldType = TextFieldTypeControl.Numeric;
          break;
      }
    });

    if (validators.length > 0) {
      this.organizationSettingsFormGroup.get('value')?.addValidators(validators);
    } else {
      this.organizationSettingsFormGroup.get('value')?.clearValidators();
    }
  }

  private setFormValuesForOverride(data: any): void {
    if (
      this.formControlType === OrganizationSettingControlType.Multiselect ||
      this.formControlType === OrganizationSettingControlType.Select
    ) {
      this.dropdownDataSource = data.valueOptions;
    }

    this.organizationSettingsFormGroup.setValue({
      settingValueId: null,
      settingKey: data.settingKey,
      controlType: data.controlType,
      name: data.name,
      value: null,
    });
  }

  private setFormValuesForEdit(parentData: any, childData: any): void {
    let dynamicValue: any;

    if (this.formControlType === OrganizationSettingControlType.Checkbox) {
      dynamicValue = this.isParentEdit ? parentData.value === 'true' : childData.value === 'true';
    }

    if (
      this.formControlType === OrganizationSettingControlType.DateTime ||
      this.formControlType === OrganizationSettingControlType.Text
    ) {
      dynamicValue = this.isParentEdit ? parentData.value : childData.value;
    }

    if (this.formControlType === OrganizationSettingControlType.Multiselect) {
      this.dropdownDataSource = parentData.valueOptions;
      if (this.isParentEdit) {
        dynamicValue = this.getDropDownOptionIds(parentData.value);
      } else {
        dynamicValue =
          typeof childData.value === 'string' ? childData.value.split(';') : this.getDropDownOptionIds(childData.value);
      }
    }

    if (this.formControlType === OrganizationSettingControlType.Select) {
      this.dropdownDataSource = parentData.valueOptions;
      dynamicValue = this.isParentEdit
        ? this.getDropDownOptionIds(parentData.value)
        : this.getDropDownOptionIds(childData.value);
      dynamicValue = dynamicValue.length !== 0 ? dynamicValue[0] : '';
    }

    if (this.formControlType === OrganizationSettingControlType.FixedKeyDictionary) {
      const valueOptions = this.isParentEdit ? parentData.value : childData.value;
      dynamicValue = { ...JSON.parse(valueOptions), isDictionary: true };
    }

    if (this.formControlType === OrganizationSettingControlType.InvoiceAutoGeneration) {
      const valueOptions = this.isParentEdit ? parentData.value : childData.value;
      dynamicValue = { ...JSON.parse(valueOptions), isInvoice: true };
    }

    // TODO: run outside zone
    setTimeout(() => {
      this.organizationSettingsFormGroup.setValue({
        settingValueId: this.isParentEdit ? null : childData.settingValueId,
        settingKey: parentData.settingKey,
        controlType: parentData.controlType,
        name: parentData.name,
        value: dynamicValue?.isDictionary || dynamicValue?.isInvoice ? !!dynamicValue.isEnabled : dynamicValue,
      });

      if (dynamicValue?.isDictionary) {
        this.pushStartDateFormGroup.setValue({
          daysToPush: dynamicValue.daysToPush || null,
          daysToConsider: dynamicValue.daysToConsider || null,
        });
      }

      if (dynamicValue?.isInvoice) {
        this.invoiceGeneratingFormGroup.setValue({
          time: dynamicValue.time,
          dayOfWeek: dynamicValue.dayOfWeek,
          groupingBy: dynamicValue.groupingBy,
        });
      }
    });
  }

  private regionChanged(regionId: number): void {
    if (regionId) {
      this.store.dispatch(new GetLocationsByRegionId(regionId));
      this.organizationHierarchy = OrganizationHierarchy.Region;
      this.organizationHierarchyId = regionId;
      this.regionFormGroup.setValue({ regionId: regionId });
      this.regionRequiredFormGroup.setValue({ regionId: regionId });
      this.locationFormGroup.reset();
      this.departmentFormGroup.reset();
    }
  }

  private locationChanged(locationId: number): void {
    if (locationId) {
      this.store.dispatch(new GetDepartmentsByLocationId(locationId));
      this.organizationHierarchy = OrganizationHierarchy.Location;
      this.organizationHierarchyId = locationId;
      this.locationFormGroup.setValue({ locationId: locationId });
    }
  }

  private departmentChanged(departmentId: number): void {
    if (departmentId) {
      this.organizationHierarchy = OrganizationHierarchy.Department;
      this.organizationHierarchyId = departmentId;
      this.departmentFormGroup.setValue({ departmentId: departmentId });
    }
  }

  // TODO: move to helper class
  private getDropDownOptionIds(data: any): string[] {
    const ids: string[] = [];
    // TODO: rework with map
    if (data) {
      data.forEach((item: OrganizationSettingsDropDownOption) => {
        ids.push(item.value);
      });
    }
    return ids;
  }

  private clearFormDetails(): void {
    this.organizationSettingsFormGroup.get('value')?.clearValidators();
    this.organizationSettingsFormGroup.reset();
    this.regionFormGroup.reset();
    this.regionRequiredFormGroup.reset();
    this.locationFormGroup.reset();
    this.departmentFormGroup.reset();
    this.pushStartDateFormGroup.reset();
    this.invoiceGeneratingFormGroup.reset();
    this.isEdit = false;
    this.isParentEdit = false;
    this.dropdownDataSource = [];
  }

  private createSettingsForm(): void {
    this.organizationSettingsFormGroup = this.formBuilder.group({
      settingValueId: [null],
      settingKey: [null],
      controlType: [null],
      name: [{ value: '', disabled: true }],
      value: [null],
    });
    this.SettingsFilterFormGroup = this.formBuilder.group({
      regionIds: [[]],
      locationIds: [[]],
      departmentIds: [[]],
      attributes: [[]],
    });
  }

  private createRegionLocationDepartmentForm(): void {
    this.regionFormGroup = this.formBuilder.group({ regionId: [null] });
    this.regionRequiredFormGroup = this.formBuilder.group({ regionId: [null, Validators.required] });
    this.locationFormGroup = this.formBuilder.group({ locationId: [null] });
    this.departmentFormGroup = this.formBuilder.group({ departmentId: [null] });
    this.pushStartDateFormGroup = this.formBuilder.group({
      daysToConsider: [null, Validators.required],
      daysToPush: [null, Validators.required],
    });
    this.invoiceGeneratingFormGroup = this.formBuilder.group({
      dayOfWeek: [null, Validators.required],
      time: [null, Validators.required],
      groupingBy: [null, Validators.required],
    });
  }

  private getActiveRowsPerPage(): number {
    return parseInt(this.activeRowsPerPageDropDown);
  }

  private getRowsPerPage(data: object[], currentPage: number): object[] {
    return data.slice(
      currentPage * this.getActiveRowsPerPage() - this.getActiveRowsPerPage(),
      currentPage * this.getActiveRowsPerPage()
    );
  }

  private getLastPage(data: object[]): number {
    return Math.round(data.length / this.getActiveRowsPerPage()) + 1;
  }

  private setPermissionsToManageSettings(): void {
    this.permissionService
      .getPermissions()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ canManageOrganizationConfigurations }) => {
        this.settingKeys.forEach((key) => (this.hasPermissions[key] = canManageOrganizationConfigurations));
      });
  }

  private watchForOrgId(): void {
    this.organizationId$.pipe(
      takeUntil(this.unsubscribe$),
    ).subscribe((id) => {
      this.organizationId = id || this.store.selectSnapshot(UserState.user)?.businessUnitId as number;
      this.clearFilters();
      this.store.dispatch(new GetOrganizationSettingsFilterOptions());
      this.getSettings();
    });
  }

  private watchForStructure(): void {
    this.organizationStructure$
    .pipe(takeUntil(this.unsubscribe$), filter(Boolean))
    .subscribe((structure: OrganizationStructure) => {
      this.orgStructure = structure;
      this.orgRegions = structure.regions;
      this.allRegions = [...this.orgRegions];
      this.filterColumns.regionIds.dataSource = this.allRegions;
    });
  }

  private watchForSFilterOptions(): void {
    this.organizationSettingsFilterOptions$
    .pipe(takeUntil(this.unsubscribe$), filter(Boolean))
    .subscribe((options: string[]) => {
      this.filterColumns.attributes.dataSource = options;
    });
  }

  private watchForRegionControl(): void {
    this.SettingsFilterFormGroup.get('regionIds')?.valueChanges
    .pipe(
      takeUntil(this.unsubscribe$),
    )
    .subscribe((val: number[]) => {
      if (val?.length) {
        const selectedRegions: OrganizationRegion[] = [];
        val.forEach((id) =>
          selectedRegions.push(this.allRegions.find((region) => region.id === id) as OrganizationRegion)
        );
        this.filterColumns.locationIds.dataSource = [];
        selectedRegions.forEach((region) => {
          this.filterColumns.locationIds.dataSource.push(...(region.locations as []));
        });
      } else {
        this.filterColumns.locationIds.dataSource = [];
        this.SettingsFilterFormGroup.get('locationIds')?.setValue([]);
        this.filteredItems = this.filterService.generateChips(this.SettingsFilterFormGroup, this.filterColumns);
      }
    });
  }

  private watchForLocationControl(): void {
    this.SettingsFilterFormGroup.get('locationIds')?.valueChanges
    .pipe(
      takeUntil(this.unsubscribe$),
    )
    .subscribe((val: number[]) => {
      if (val?.length) {
        const selectedLocations: OrganizationLocation[] = [];
        val.forEach((id) =>
          selectedLocations.push(
            this.filterColumns.locationIds.dataSource
            .find((location: OrganizationLocation) => location.id === id) as OrganizationLocation,
          )
        );
        this.filterColumns.departmentIds.dataSource = [];
        selectedLocations.forEach((location) => {
          this.filterColumns.departmentIds.dataSource.push(...(location.departments as []));
        });
      } else {
        this.filterColumns.departmentIds.dataSource = [];
        this.SettingsFilterFormGroup.get('departmentIds')?.setValue([]);
        this.filteredItems = this.filterService.generateChips(this.SettingsFilterFormGroup, this.filterColumns);
      }
    });
  }
}
