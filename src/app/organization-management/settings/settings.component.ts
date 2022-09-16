import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { filter, map, Observable, Subject, takeUntil } from 'rxjs';
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
  OrganizationSettingValueOptions,
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
import { User } from '@shared/models/user.model';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { OrganizationManagementState } from '../store/organization-management.state';
import { customEmailValidator } from '@shared/validators/email.validator';
import { UserState } from '../../store/user.state';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { OrganizationLocation, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { GetCurrentUserPermissions, GetOrganizationStructure } from '../../store/user.actions';

import { PermissionTypes } from '@shared/enums/permissions-types.enum';
import { CurrentUserPermission } from '@shared/models/permission.model';

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
export class SettingsComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;

  public organizationSettingsFormGroup: FormGroup;
  public regionFormGroup: FormGroup;
  public regionRequiredFormGroup: FormGroup;
  public locationFormGroup: FormGroup;
  public departmentFormGroup: FormGroup;
  public formBuilder: FormBuilder;

  @Select(UserState.currentUserPermissions) private readonly currentUserPermissions$: Observable<CurrentUserPermission[]>;

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
  public hasAccess = false;
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
  public permissionFields: string[] = [
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
  public filterColumns: any;

  public optionFields = {
    text: 'name',
    value: 'id',
  };

  constructor(
    private store: Store,
    @Inject(FormBuilder) private builder: FormBuilder,
    private confirmService: ConfirmService,
    private filterService: FilterService
  ) {
    super();
    this.formBuilder = builder;
    this.createSettingsForm();
    this.createRegionLocationDepartmentForm();
  }

  ngOnInit(): void {
    this.filterColumns = {
      regionIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      locationIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      departmentIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      attributes: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
    };
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe((id) => {
      if (id) {
        this.organizationId = id;
      } else {
        this.organizationId = this.store.selectSnapshot(UserState.user)?.businessUnitId as number;
      }
      this.clearFilters();
      this.store.dispatch(new GetOrganizationSettingsFilterOptions());
      this.getSettings();
    });
    this.mapGridData();
    this.isEditOverrideAccessible();

    this.organizationStructure$
      .pipe(takeUntil(this.unsubscribe$), filter(Boolean))
      .subscribe((structure: OrganizationStructure) => {
        this.orgStructure = structure;
        this.orgRegions = structure.regions;
        this.allRegions = [...this.orgRegions];
        this.filterColumns.regionIds.dataSource = this.allRegions;
      });

    this.organizationSettingsFilterOptions$
      .pipe(takeUntil(this.unsubscribe$), filter(Boolean))
      .subscribe((options: string[]) => {
        this.filterColumns.attributes.dataSource = options;
      });

    this.SettingsFilterFormGroup.get('regionIds')?.valueChanges.subscribe((val: number[]) => {
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

    this.SettingsFilterFormGroup.get('locationIds')?.valueChanges.subscribe((val: number[]) => {
      if (val?.length) {
        const selectedLocations: OrganizationLocation[] = [];
        val.forEach((id) =>
          selectedLocations.push(
            this.filterColumns.locationIds.dataSource.find((location: OrganizationLocation) => location.id === id)
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
      this.departmentFormGroup.dirty
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
      if (this.organizationSettingsFormGroup.valid) {
        this.sendForm();
      } else {
        this.organizationSettingsFormGroup.markAllAsTouched();
      }
    } else {
      if (this.regionRequiredFormGroup.valid) {
        if (this.organizationSettingsFormGroup.valid) {
          this.sendForm();
        } else {
          this.organizationSettingsFormGroup.markAllAsTouched();
        }
      } else {
        this.regionRequiredFormGroup.markAllAsTouched();
      }
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
    this.settings$.subscribe((data) => {
      this.lastAvailablePage = this.getLastPage(data);
      data.forEach((item) => {
        if (
          item.controlType === OrganizationSettingControlType.Select ||
          item.controlType === OrganizationSettingControlType.Multiselect
        ) {
          if (typeof item.value === 'string') {
            item.value = this.getDropDownOptionsFromString(item.value, item.valueOptions);
          }

          if (item.children && item.children.length > 0) {
            item.children.forEach((child) => {
              if (typeof child.value === 'string') {
                child.value = this.getDropDownOptionsFromString(child.value, item.valueOptions);
              }
            });
          }
        }
      });

      this.gridDataSource = this.getRowsPerPage(data, this.currentPagerPage);
      this.totalDataRecords = data.length;
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

    setTimeout(() => {
      this.organizationSettingsFormGroup.setValue({
        settingValueId: this.isParentEdit ? null : childData.settingValueId,
        settingKey: parentData.settingKey,
        controlType: parentData.controlType,
        name: parentData.name,
        value: dynamicValue,
      });
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

  private getDropDownOptionsFromString(
    text: string,
    valueOptions: OrganizationSettingValueOptions[]
  ): OrganizationSettingsDropDownOption[] {
    let options: OrganizationSettingsDropDownOption[] = [];
    if (text) {
      let optionIds = text.split(';');
      optionIds.forEach((id) => {
        const foundOption = valueOptions.find((option) => option.key === id);
        if (foundOption) {
          options.push({ value: foundOption.key, text: foundOption.value });
        }
      });
    }
    return options;
  }

  private getDropDownOptionIds(data: any): string[] {
    const ids: string[] = [];

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

  // TODO: remove after permission service implementation
  private isEditOverrideAccessible(): void {
    const storedUser = localStorage.getItem('User');
    if (storedUser) {
      const user = JSON.parse(storedUser) as User;
      if ([BusinessUnitType.Hallmark, BusinessUnitType.MSP].includes(user.businessUnitType)) {
        this.hasAccess = true;
      }
    }
  }

  private setPermissionsToManageSettings(): void {
    this.store.dispatch(new GetCurrentUserPermissions());

    this.currentUserPermissions$
      .pipe(
        filter((permissions) => !!permissions.length),
        map((permissions) => permissions.map((permission) => permission.permissionId)),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((permissions) => {
        const permission = permissions.includes(PermissionTypes.ManageOrganizationConfigurations);
        this.permissionFields.forEach((key) => this.hasPermissions[key] = permission);
      });
  }
}
