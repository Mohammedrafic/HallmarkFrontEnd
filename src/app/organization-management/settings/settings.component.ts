import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { DateTimeHelper, MultiEmailValidator } from '@core/helpers';
import { Select, Store } from '@ngxs/store';
import { ORG_SETTINGS } from '@organization-management/organization-management-menu.config';
import { SideMenuService } from '@shared/components/side-menu/services';
import { OrganizationSettingKeys, OrganizationSettings } from '@shared/constants';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants/messages';
import { Days } from '@shared/enums/days';
import { OrganizationHierarchy } from '@shared/enums/organization-hierarchy';
import { OrganizationSettingControlType } from '@shared/enums/organization-setting-control-type';
import { OrganizationSettingValidationType } from '@shared/enums/organization-setting-validation-type';
import { PermissionTypes } from '@shared/enums/permissions-types.enum';
import { SystemType } from '@shared/enums/system-type.enum';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { ButtonModel } from '@shared/models/buttons-group.model';
import { Department } from '@shared/models/department.model';
import { FilteredItem } from '@shared/models/filter.model';
import { Location } from '@shared/models/location.model';
import {
  OrganizationSettingFilter,
  OrganizationSettingsDropDownOption,
  OrganizationSettingsGet,
  OrganizationSettingsPost,
  OrganizationSettingValidation,
} from '@shared/models/organization-settings.model';
import {
  OrganizationDepartment,
  OrganizationLocation,
  OrganizationRegion,
  OrganizationStructure,
} from '@shared/models/organization.model';
import { Region } from '@shared/models/region.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { FilterService } from '@shared/services/filter.service';
import { customEmailValidator } from '@shared/validators/email.validator';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { DetailRowService, GridComponent } from '@syncfusion/ej2-angular-grids';
import { distinctUntilChanged, filter, Observable, skip, Subject, takeUntil } from 'rxjs';
import { SettingsGroupInvoicesOptions } from 'src/app/modules/invoices/constants';
import { PermissionService } from 'src/app/security/services/permission.service';
import { AppState } from 'src/app/store/app.state';
import { ShowFilterDialog, ShowSideDialog } from '../../store/app.actions';
import { GetOrganizationStructure } from '../../store/user.actions';
import { UserState } from '../../store/user.state';
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
import { OrganizationManagementState } from '../store/organization-management.state';
import { Weeks } from '@shared/enums/weeks';
import {
  AssociatedLink,
  billingSettingsKey,
  DisabledSettingsByDefault,
  GetSettingSystemButtons,
  invoiceGeneratingSettingsKey,
  SettingsAppliedToPermissions,
  SettingsFilterCols,
  SettingsSystemFilterCols,
  tierSettingsKey,
} from './settings.constant';
import { SettingsDataAdapter } from './helpers/settings-data.adapter';

import { AutoGenerationPayload, SwitchValuePayload,PayPeriodPayload } from './settings.interface';

export enum TextFieldTypeControl {
  Email = 1,
  Numeric = 2,
}
/**
 * TODO: component needs to be rework with configurable dialog and form.
 * Component can be slightly simplified. A lot of code smells.
 */
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
  public switchedValueForm: FormGroup;
  public checkboxValueForm: FormGroup;
  public OThoursSettingsFormGroup: FormGroup;
  public formBuilder: FormBuilder;
  public payPeriodFormGroup: FormGroup;

  public readonly daysOfWeek = Days;
  public readonly noOfWeek = Weeks;
  public readonly daysOfWeekFields = {
    text: 'text',
    value: 'id',
  };

  public readonly noOfWeekFields = {
    text: 'text',
    value: 'id',
  };

  public readonly groupInvoicesOptions = SettingsGroupInvoicesOptions;
  public readonly groupInvoicesFields = {
    text: 'text',
    value: 'id',
  };

  @Select(OrganizationManagementState.organizationSettings)
  public settings$: Observable<OrganizationSettingsGet[]>;

  @Select(OrganizationManagementState.sortedRegions)
  regions$: Observable<Region[]>;

  @Select(OrganizationManagementState.organizationSettingsFilterOptions)
  organizationSettingsFilterOptions$: Observable<string[]>;

  @Select(OrganizationManagementState.sortedLocationsByRegionId)
  locations$: Observable<Location[]>;

  public regionLocationFields: FieldSettingsModel = { text: 'name', value: 'id' };

  @Select(OrganizationManagementState.sortedDepartments)
  departments$: Observable<Department[]>;
  public departmentFields: FieldSettingsModel = { text: 'departmentName', value: 'departmentId' };

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  @Select(UserState.organizationStructure)
  organizationStructure$: Observable<OrganizationStructure>;
  public orgStructure: OrganizationStructure;
  public orgRegions: OrganizationRegion[] = [];
  public allRegions: OrganizationRegion[] = [];
  public regionBasedLocations: OrganizationLocation[] = [];

  public isEdit: boolean;
  public isParentEdit = false;
  public isFormShown = false;
  public organizationSettingControlType = OrganizationSettingControlType;
  public formControlType: number;

  public dropdownDataSource: OrganizationSettingsDropDownOption[];
  public dropdownFields: FieldSettingsModel = { text: 'value', value: 'key' };
  public dropdownCheckboxValueDataSource: any[] = [{ key: 'Apply', value: 'Apply' }, { key: 'Accept', value: 'Accept' }];


  public organizationHierarchy: number;
  public organizationHierarchyId: number;
  public showToggleMessage = false;
  public showBillingMessage = false;
  public readonly associateLink: string = AssociatedLink;

  public textFieldType: number;
  public textFieldTypeControl = TextFieldTypeControl;
  public organizationId: number;
  public maxFieldLength = 100;
  public hasPermissions: Record<string, boolean> = {};
  public settingsAppliedToPermissions: string[] = SettingsAppliedToPermissions;
  public disabledSettings = DisabledSettingsByDefault;
  public dataSource: any;
  public regularLocalRatesToggleMessage: boolean = false;

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

  private organizationSettingKey: OrganizationSettingKeys;

  set setOrganizationSettingKey(key: string) {
    this.organizationSettingKey = Number(OrganizationSettingKeys[key as keyof object]);
  }

  public IsSettingKeyOtHours: boolean = false;
  public allRegionsSelected: boolean = false;
  public allLocationsSelected: boolean = false;
  public IsSettingKeyPayPeriod: boolean = false;

  separateValuesInSystems = false;
  configurationSystemType: SystemType = SystemType.VMS;
  systemButtons: ButtonModel[] = [];
  readonly orgSystems = {
    IRP: false,
    VMS: false,
    IRPAndVMS: false,
  };

  private configurations: OrganizationSettingsGet[] = [];

  constructor(
    protected override store: Store,
    @Inject(FormBuilder) private builder: FormBuilder,
    private confirmService: ConfirmService,
    private filterService: FilterService,
    private permissionService: PermissionService,
    private sideMenuService: SideMenuService
  ) {
    super(store);
    this.formBuilder = builder;
    this.createSettingsForm();
    this.createRegionLocationDepartmentForm();
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.watchForOrgId();
    this.watchForSettings();
    this.watchForStructure();
    this.watchForFilterOptions();
    this.watchForRegionControl();
    this.watchForLocationControl();
    this.setPermissionsToManageSettings();
    this.watchRegionControlChanges();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  setConfigurationSystemType(system: SystemType, updateButtons = false): void {
    this.configurationSystemType = system;

    if (updateButtons) {
      this.systemButtons = GetSettingSystemButtons(this.configurationSystemType === SystemType.IRP);
    }
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
      includeInIRP: this.filters.includeInIRP || false,
      includeInVMS: this.filters.includeInVMS || false,
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
    this.filters.includeInVMS = this.filters.includeInVMS ?? false;
    this.filters.includeInIRP = this.filters.includeInIRP ?? false;
    this.filteredItems = this.filterService.generateChips(this.SettingsFilterFormGroup, this.filterColumns);
    this.getSettings();
    this.store.dispatch(new ShowFilterDialog(false));
  }

  formatCheckboxValue(data: any) {
    if (data.value === null) {
      return 'No';
    } else {
      if (JSON.parse(data.value).isEnabled) {
        return 'Yes'
      } else {
        return 'No';
      }
    }

  }

  public onOverrideButtonClick(data: any): void {
    this.setConfigurationSystemType(this.getParentConfigurationSystemType(), true);
    this.separateValuesInSystems = data.separateValuesInSystems;
    this.enableOtForm();
    this.IsSettingKeyOtHours = OrganizationSettingKeys[OrganizationSettingKeys['OTHours']].toString() == data.settingKey ? true : false;
    this.IsSettingKeyPayPeriod = OrganizationSettingKeys[OrganizationSettingKeys['PayPeriod']].toString() == data.settingKey ? true : false;
    this.handleShowToggleMessage(data.settingKey);
    this.isFormShown = true;
    this.setOrganizationSettingKey = data.settingKey;
    this.formControlType = data.controlType;
    this.disableDepForInvoiceGeneration();
    this.regionFormGroup.reset();
    this.regionRequiredFormGroup.reset();
    this.OThoursSettingsFormGroup.reset();
    this.locationFormGroup.reset();
    this.departmentFormGroup.reset();
    this.payPeriodFormGroup.reset();
    this.store.dispatch(new ClearLocationList());
    this.store.dispatch(new ClearDepartmentList());
    this.setFormValidation(data);
    this.setFormValuesForOverride(data);
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onEditButtonClick(parentRecord: any, childRecord: any, event: any): void {
    if (childRecord) {
      this.setConfigurationSystemType( childRecord.isIRPConfigurationValue ? SystemType.IRP : SystemType.VMS, true);
    } else {
      this.setConfigurationSystemType(this.getParentConfigurationSystemType(), true);
    }

    this.separateValuesInSystems = parentRecord.separateValuesInSystems;
    this.IsSettingKeyOtHours = OrganizationSettingKeys[OrganizationSettingKeys['OTHours']].toString() == parentRecord.settingKey ? true : false;
    this.IsSettingKeyPayPeriod = OrganizationSettingKeys[OrganizationSettingKeys['PayPeriod']].toString() == parentRecord.settingKey ? true : false;
    this.enableOtForm();
    this.handleShowToggleMessage(parentRecord.settingKey);
    this.store.dispatch(new GetOrganizationStructure());
    this.isFormShown = true;
    this.addActiveCssClass(event);
    this.isEdit = true;
    this.setOrganizationSettingKey = parentRecord.settingKey;
    this.regularLocalRatesToggleMessage = false;
    if (OrganizationSettings.MandateCandidateAddress === parentRecord.settingKey &&
      this.dataSource.find((data: any) => data.settingKey === OrganizationSettings.EnableRegularLocalRates).value == 'true') {
      this.regularLocalRatesToggleMessage = true;
    }
    this.formControlType = parentRecord.controlType;
    this.disableDepForInvoiceGeneration();
    this.setFormValidation(parentRecord);

    if (!childRecord) {
      this.isParentEdit = true;
      this.organizationHierarchy = OrganizationHierarchy.Organization;
      this.organizationHierarchyId = this.organizationId;
      this.setFormValuesForEdit(parentRecord, null);
    } else {
      if (childRecord.regionId) {
        this.IsSettingKeyOtHours ? this.otHoursRegionChangesEdit(childRecord.regionId) : this.regionChanged(childRecord.regionId);
      } else {
        this.IsSettingKeyOtHours ? this.otHoursRegionChangesEdit(childRecord.regionId) :null;
        this.store.dispatch(new ClearLocationList());
        this.store.dispatch(new ClearDepartmentList());
      }

      if (childRecord.locationId) {
        this.IsSettingKeyOtHours ? this.otHoursLocationsEdit(childRecord.locationId) : this.locationChanged(childRecord.locationId);
      } else {
        this.IsSettingKeyOtHours ? this.otHoursLocationsEdit(childRecord.locationId) : null;
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
      this.organizationSettingsFormGroup.touched ||
      this.regionFormGroup.touched ||
      this.regionRequiredFormGroup.touched ||
      this.locationFormGroup.touched ||
      this.departmentFormGroup.touched ||
      this.pushStartDateFormGroup.touched ||
      this.invoiceGeneratingFormGroup.touched ||
      this.OThoursSettingsFormGroup.touched ||
      this.payPeriodFormGroup.touched
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
        && this.switchedValueForm.valid
        && this.checkboxValueForm.valid
      ) {
        this.sendForm();
      } else {
        this.organizationSettingsFormGroup.markAllAsTouched();
        this.validatePushStartDateForm();
        this.validateInvoiceGeneratingForm();
      }
    } else {
      if (this.regionRequiredFormGroup.valid && this.isPushStartDateValid()
        && this.invoiceAutoGeneratingValig()
        && this.switchedValueForm.valid
        && this.checkboxValueForm.valid) {
        if (this.organizationSettingsFormGroup.valid) {
          this.sendForm();
        } else {
          this.organizationSettingsFormGroup.markAllAsTouched();
          this.validatePushStartDateForm();
          this.validateInvoiceGeneratingForm();
        }
      } else {
        if (this.IsSettingKeyOtHours && this.allLocationsSelected && this.allRegionsSelected) {
          this.organizationHierarchy = OrganizationHierarchy.Organization;
          this.organizationHierarchyId = this.organizationId;
          if (this.organizationSettingsFormGroup.valid) {
            this.sendForm();
          } else {
            this.organizationSettingsFormGroup.markAllAsTouched();
          }
        }
        if (this.OThoursSettingsFormGroup.valid) {
          this.organizationHierarchy = OrganizationHierarchy.Organization;
          this.organizationHierarchyId = this.organizationId;
          if (this.organizationSettingsFormGroup.valid) {
            this.sendForm();
          } else {
            this.organizationSettingsFormGroup.markAllAsTouched();
          }
        }
        if (this.payPeriodFormGroup.valid) {
          this.organizationHierarchy = OrganizationHierarchy.Organization;
          this.organizationHierarchyId = this.organizationId;
          if (this.organizationSettingsFormGroup.valid) {
            this.sendForm();
          } else {
            this.organizationSettingsFormGroup.markAllAsTouched();
          }
        }

        this.OThoursSettingsFormGroup.markAllAsTouched();
        this.regionRequiredFormGroup.markAllAsTouched();
        this.payPeriodFormGroup.markAllAsTouched();
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

  watchForSettings(): void {
    this.settings$
      .pipe(
        skip(1),
        takeUntil(this.unsubscribe$),
      )
      .subscribe((data: OrganizationSettingsGet[]) => {
        const adaptedData = SettingsDataAdapter.adaptSettings(data, this.orgSystems.IRPAndVMS);

        this.configurations = data;
        this.lastAvailablePage = this.getLastPage(data);
        this.gridDataSource = this.getRowsPerPage(adaptedData, this.currentPagerPage);
        this.totalDataRecords = adaptedData.length;
        this.dataSource = adaptedData;
        this.grid?.refresh();
      });
  }

  public rowDataBound(args: any): void {
    // hides expand button if no children
    if (args.data.children.length === 0) {
      args.row.querySelector('td').innerHTML = ' ';
      args.row.querySelector('td').className = 'e-customized-expand-cell';
    }
  }

  public redirectToTiers(): void {
    this.sideMenuService.selectedMenuItem$.next(ORG_SETTINGS[13]);
  }

  changePageSize(event: { isInteracted: boolean }): void {
    if (event.isInteracted) {
      this.grid.pageSettings.pageSize = this.pageSizePager = this.getActiveRowsPerPage();
      this.lastAvailablePage = this.getLastPage(this.configurations);
    }
  }

  changePage(event: { currentPage: number, value: number }): void {
    if ((event.currentPage && event.currentPage !== this.currentPagerPage) || event.value) {
      this.gridDataSource = this.getRowsPerPage(this.configurations, event.currentPage || event.value);
      this.lastAvailablePage = this.getLastPage(this.configurations);
      this.currentPagerPage = event.currentPage || event.value;
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
        dynamicValue = JSON.stringify(this.createAutoGenerationPayload());
        break;
      case OrganizationSettingControlType.EmailAria:
        dynamicValue = this.organizationSettingsFormGroup.controls['value'].value;
        break;
      case OrganizationSettingControlType.SwitchedValue:
        dynamicValue = JSON.stringify(this.createSwitchValuePayload());
        break;
      case OrganizationSettingControlType.CheckboxValue:
        dynamicValue = JSON.stringify(this.createCheckboxValuePayload());
        break;
        case OrganizationSettingControlType.PayPeriod:
        dynamicValue = JSON.stringify(this.createPayPeriodPayload());
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
      regionId: this.OThoursSettingsFormGroup.controls['regionId'].value || null,
      locationId: this.OThoursSettingsFormGroup.controls['locationId'].value ||null,
      isIRPConfigurationValue: this.configurationSystemType === SystemType.IRP,
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
        case OrganizationSettingValidationType.MultipleEmails:
          validators.push(MultiEmailValidator);
          break;
        case OrganizationSettingValidationType.MinNumberValue:
          validators.push(Validators.min(parseInt(validation.value as string)));
          break;
        case OrganizationSettingValidationType.MaxNumberValue:
          validators.push(Validators.max(parseInt(validation.value as string)));
          break;
      }
    });

    if (this.formControlType === OrganizationSettingControlType.SwitchedValue) {
      this.switchedValueForm.get('value')?.addValidators(validators);
      this.observeToggleControl();
    }
    if (this.formControlType === OrganizationSettingControlType.CheckboxValue) {
      this.checkboxValueForm.get('value')?.addValidators(validators);
      this.observeCheckboxValueToggleControl();
    }

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
      this.dropdownDataSource = data.valueOptions.sort((a: any, b: any) => a.value?.localeCompare(b.value));
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

    if (this.formControlType === OrganizationSettingControlType.EmailAria) {
      dynamicValue = this.isParentEdit ? parentData.value : childData.value;
    }

    if (this.formControlType === OrganizationSettingControlType.SwitchedValue) {
      const valueOptions = this.isParentEdit ? parentData.value : childData.value;
      dynamicValue = { ...JSON.parse(valueOptions), isSwitchedValue: true };
    }
    if (this.formControlType === OrganizationSettingControlType.CheckboxValue) {
      const valueOptions = this.isParentEdit ? parentData.value : childData.value;
      dynamicValue = { ...JSON.parse(valueOptions), isCheckboxValue: true };
    }
    if (this.formControlType === OrganizationSettingControlType.PayPeriod) {
      const valueOptions = this.isParentEdit ? parentData.value : childData.value;
      dynamicValue = { ...JSON.parse(valueOptions), isPayPeriod: true };
    }



    // TODO: run outside zone
    setTimeout(() => {
      this.organizationSettingsFormGroup.setValue({
        settingValueId: this.isParentEdit ? null : childData.settingValueId,
        settingKey: parentData.settingKey,
        controlType: parentData.controlType,
        name: parentData.name,
        value: (dynamicValue?.isDictionary || dynamicValue?.isInvoice || dynamicValue?.isPayPeriod)? !!dynamicValue.isEnabled : dynamicValue,
      });

      if (dynamicValue?.isDictionary) {
        this.pushStartDateFormGroup.setValue({
          daysToPush: dynamicValue.daysToPush || null,
          daysToConsider: dynamicValue.daysToConsider || null,
        });
      }

      if (dynamicValue?.isInvoice) {
        this.invoiceGeneratingFormGroup.setValue({
          time: dynamicValue.time ? DateTimeHelper.convertDateToUtc(dynamicValue.time) : '',
          dayOfWeek: dynamicValue.dayOfWeek,
          groupingBy: dynamicValue.groupingBy,
        });
      }

      if (dynamicValue.isSwitchedValue) {
        this.switchedValueForm.setValue({
          value: dynamicValue.value,
          isEnabled: dynamicValue.isEnabled,
        });
      }

    });
    if (dynamicValue.isCheckboxValue) {
      this.checkboxValueForm.setValue({
        value: dynamicValue.value ? dynamicValue.value : '',
        isEnabled: dynamicValue.isEnabled ? dynamicValue.isEnabled : false,
      });
    }

    if (dynamicValue?.isPayPeriod) {
      this.payPeriodFormGroup.setValue({
        date: dynamicValue.date,
        noOfWeek: dynamicValue.noOfWeek
      });
    }
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
      this.locationFormGroup.patchValue({ locationId: locationId }, { emitEvent: false, onlySelf: true });
    }
  }

  private departmentChanged(departmentId: number): void {
    if (departmentId) {
      this.organizationHierarchy = OrganizationHierarchy.Department;
      this.organizationHierarchyId = departmentId;
      this.departmentFormGroup.patchValue({ departmentId: departmentId }, { emitEvent: false, onlySelf: true });
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
    this.OThoursSettingsFormGroup.reset();
    this.locationFormGroup.reset();
    this.departmentFormGroup.reset();
    this.pushStartDateFormGroup.reset();
    this.invoiceGeneratingFormGroup.reset();
    this.payPeriodFormGroup.reset();
    this.switchedValueForm.reset();
    this.checkboxValueForm.reset();
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
      includeInIRP: [false],
      includeInVMS: [false],
    });
  }

  private createRegionLocationDepartmentForm(): void {
    this.regionFormGroup = this.formBuilder.group({ regionId: [null] });
    this.regionRequiredFormGroup = this.formBuilder.group({ regionId: [null, Validators.required] });
    this.OThoursSettingsFormGroup = this.formBuilder.group({
      regionId: [null, Validators.required],
      locationId: [null, Validators.required]
    });
    this.locationFormGroup = this.formBuilder.group({ locationId: [null] });
    this.departmentFormGroup = this.formBuilder.group({ departmentId: [{ value: null, disabled: true }] });
    this.pushStartDateFormGroup = this.formBuilder.group({
      daysToConsider: [null, Validators.required],
      daysToPush: [null, Validators.required],
    });
    this.invoiceGeneratingFormGroup = this.formBuilder.group({
      dayOfWeek: [null, Validators.required],
      time: [null, Validators.required],
      groupingBy: [null, Validators.required],
    });
    this.payPeriodFormGroup = this.formBuilder.group({
      noOfWeek: [null],
      date: [null]
    });

    // Remove this validation after be implementation. This is be bug.
    this.switchedValueForm = this.formBuilder.group({
      isEnabled: [false],
      value: [null, [Validators.min(1), Validators.max(99)]],
    });
    // Remove this validation after be implementation. This is be bug.
    this.checkboxValueForm = this.formBuilder.group({
      isEnabled: [false],
      value: [null],
    });
  }

  private getActiveRowsPerPage(): number {
    return parseInt(this.activeRowsPerPageDropDown);
  }

  private getRowsPerPage(data: object[], currentPage: number): object[] {
    const invoiceGneration: any = data.find((setting: any) => {
      return setting.controlType === this.organizationSettingControlType.InvoiceAutoGeneration;
    });

    if (invoiceGneration && invoiceGneration.value && typeof invoiceGneration.value === 'string') {
      invoiceGneration.parsedValue = JSON.parse(invoiceGneration.value);
    }

    const payPeriodGneration: any = data.find((setting: any) => {
      return setting.controlType === this.organizationSettingControlType.PayPeriod;
    });

    if (payPeriodGneration && payPeriodGneration.value && typeof payPeriodGneration.value === 'string') {
      payPeriodGneration.parsedValue = JSON.parse(payPeriodGneration.value);
    }

    const switchedValues: any[] = data.filter((setting: any) => {
      return setting.controlType === this.organizationSettingControlType.SwitchedValue;
    });

    switchedValues.forEach((setting) => {
      if (setting.value && typeof setting.value === 'string') {
        setting.parsedValue = JSON.parse(setting.value);
      }

      if (setting.children && setting.children.length) {
        setting.children.forEach((child: any) => {
          if (child.value && typeof child.value === 'string') {
            child.parsedValue = JSON.parse(child.value);
          }
        });
      }
    });

    return data.slice(
      currentPage * this.getActiveRowsPerPage() - this.getActiveRowsPerPage(),
      currentPage * this.getActiveRowsPerPage()
    );
  }

  private getLastPage(data: object[]): number {
    return Math.round(data.length / this.getActiveRowsPerPage()) + 1;
  }

  private setPermissionsToManageSettings(): void {
    this.settingsAppliedToPermissions.forEach((key) => {
      this.hasPermissions[key] = this.userPermission[PermissionTypes.ManageOrganizationConfigurations];
    });
  }

  private watchForOrgId(): void {
    this.organizationId$.pipe(
      distinctUntilChanged(),
      takeUntil(this.unsubscribe$),
    ).subscribe((id) => {
      this.organizationId = id || this.store.selectSnapshot(UserState.user)?.businessUnitId as number;
      this.setOrgSystems();
      this.clearFilters();
      this.store.dispatch(new GetOrganizationSettingsFilterOptions());
      this.getSettings();
    });
  }

  private watchForStructure(): void {
    this.organizationStructure$
      .pipe(filter(Boolean), takeUntil(this.unsubscribe$))
      .subscribe((structure: OrganizationStructure) => {
        this.orgStructure = structure;
        this.orgRegions = structure.regions;
        this.allRegions = [...this.orgRegions];
        this.filterColumns.regionIds.dataSource = this.allRegions;
      });
  }

  private watchForFilterOptions(): void {
    this.organizationSettingsFilterOptions$
      .pipe(filter(Boolean), takeUntil(this.unsubscribe$))
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
          const locations: OrganizationLocation[] = [];
          val.forEach((id) =>
            selectedRegions.push(this.allRegions.find((region) => region.id === id) as OrganizationRegion)
          );
          this.filterColumns.locationIds.dataSource = [];
          selectedRegions.forEach((region) => {
            locations.push(...(region.locations as []));
          });
          this.filterColumns.locationIds.dataSource = sortByField(locations, 'name');
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
          const departments: OrganizationDepartment[] = [];
          val.forEach((id) =>
            selectedLocations.push(
              this.filterColumns.locationIds.dataSource
                .find((location: OrganizationLocation) => location.id === id) as OrganizationLocation,
            )
          );
          this.filterColumns.departmentIds.dataSource = [];
          selectedLocations.forEach((location) => {
            departments.push(...(location.departments as []));
          });
          this.filterColumns.departmentIds.dataSource = sortByField(departments, 'name');
        } else {
          this.filterColumns.departmentIds.dataSource = [];
          this.SettingsFilterFormGroup.get('departmentIds')?.setValue([]);
          this.filteredItems = this.filterService.generateChips(this.SettingsFilterFormGroup, this.filterColumns);
        }
      });
  }

  private handleShowToggleMessage(key: string): void {
    this.showToggleMessage = key === tierSettingsKey;
    this.showBillingMessage = key === billingSettingsKey || key === invoiceGeneratingSettingsKey;
  }

  private disableDepForInvoiceGeneration(): void {
    if (this.organizationSettingKey === OrganizationSettingKeys.InvoiceAutoGeneration
      || this.organizationSettingKey === OrganizationSettingKeys.PayHigherBillRates
      || this.organizationSettingKey === OrganizationSettingKeys.OTHours) {
      this.departmentFormGroup.get('departmentId')?.disable();
    } else {
      this.departmentFormGroup.get('departmentId')?.enable();
    }
  }

  private createAutoGenerationPayload(): AutoGenerationPayload {
    return ({
      isEnabled: !!this.organizationSettingsFormGroup.controls['value'].value,
      dayOfWeek: this.invoiceGeneratingFormGroup.controls['dayOfWeek'].value,
      groupingBy: this.invoiceGeneratingFormGroup.controls['groupingBy'].value,
      time: DateTimeHelper.toUtcFormat(this.invoiceGeneratingFormGroup.controls['time'].value),
    });
  }

  private createSwitchValuePayload(): SwitchValuePayload {
    return ({
      value: this.switchedValueForm.get('value')?.value,
      isEnabled: !!this.switchedValueForm.get('isEnabled')?.value,
    });
  }

  private createCheckboxValuePayload(): SwitchValuePayload {
    return ({
      value: this.checkboxValueForm.get('value')?.value,
      isEnabled: !!this.checkboxValueForm.get('isEnabled')?.value,
    });
  }

  private createPayPeriodPayload(): PayPeriodPayload {
    return ({
      isEnabled:  !!this.organizationSettingsFormGroup.controls['value'].value,
      noOfWeek: this.payPeriodFormGroup.controls['noOfWeek'].value,
      date: this.payPeriodFormGroup.controls['date'].value
  });
  }

  private observeToggleControl(): void {
    this.switchedValueForm.get('isEnabled')?.valueChanges
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((value: boolean) => {
        if (value) {
          this.switchedValueForm.get('value')?.addValidators(Validators.required);
        } else {
          this.switchedValueForm.get('value')?.removeValidators(Validators.required);
        }
        this.switchedValueForm.get('value')?.updateValueAndValidity();
      });
  }

  private observeCheckboxValueToggleControl(): void {
    this.checkboxValueForm.get('isEnabled')?.valueChanges
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((value: boolean) => {
        if (value) {
          this.checkboxValueForm.get('value')?.addValidators(Validators.required);
        } else {
          this.checkboxValueForm.get('value')?.removeValidators(Validators.required);
        }
        this.checkboxValueForm.get('value')?.updateValueAndValidity();
      });
  }

  watchRegionControlChanges() {
    this.OThoursSettingsFormGroup.get('regionId')?.valueChanges
      .pipe(
        takeUntil(this.unsubscribe$),
      )
      .subscribe((val: number[]) => {
        if (val?.length) {
          const selectedRegions: OrganizationRegion[] = [];
          const locations: OrganizationLocation[] = [];
          val.forEach((id) =>
            selectedRegions.push(this.allRegions.find((region) => region.id === id) as OrganizationRegion)
          );
          this.regionBasedLocations = [];
          selectedRegions.forEach((region) => {
            locations.push(...(region.locations as []));
          });
          this.regionBasedLocations = sortByField(locations, 'name');
        } else {
          this.regionBasedLocations = [];
          this.OThoursSettingsFormGroup.get('locationId')?.setValue([]);
        }
      });
  }

  public allRegionsChange(event: { checked: boolean }): void {
    this.allRegionsSelected = event.checked;
    const regionsControl = this.OThoursSettingsFormGroup.controls['regionId'];
    if (this.allRegionsSelected) {
      regionsControl.setValue(null);
      regionsControl.disable();
      let locations: Location[] = [];
      this.orgRegions.forEach((region: OrganizationRegion) => {
        const filteredLocation = region.locations || [];
        locations = [...locations, ...filteredLocation] as Location[];
      });
      this.regionBasedLocations = sortByField(locations, 'name');
    } else {
      regionsControl.enable({ emitEvent: false });
    }
  }
  public allLocationsChange(event: { checked: boolean }): void {
    this.allLocationsSelected = event.checked;
    const locationsControl = this.OThoursSettingsFormGroup.controls['locationId'];
    if (this.allLocationsSelected) {
      locationsControl.setValue(null);
      locationsControl.disable();
    } else {
      locationsControl.enable({ emitEvent: false });
    }
  }

  public otHoursRegionChangesEdit(regionId: number): void {
    if(regionId==null){
      this.allRegionsSelected=true;
      this.OThoursSettingsFormGroup.controls['regionId'].disable();
    }else{
      this.OThoursSettingsFormGroup.controls['regionId'].enable();
      this.OThoursSettingsFormGroup.controls['regionId'].setValue([regionId]);
    }

  }
  public otHoursLocationsEdit(locationId: number): void {
    if(locationId==null){
      this.allLocationsSelected=true;
      this.OThoursSettingsFormGroup.controls['locationId'].disable();
      this.organizationHierarchy = OrganizationHierarchy.Organization;
      this.organizationHierarchyId = this.organizationId;
      this.OThoursSettingsFormGroup.controls['locationId'].setValue(null);
    }else{
      this.organizationHierarchy = OrganizationHierarchy.Location;
      this.organizationHierarchyId = locationId;
      this.OThoursSettingsFormGroup.controls['locationId'].enable();
      this.OThoursSettingsFormGroup.controls['locationId'].setValue([locationId]);
    }

  }
  public enableOtForm(){
    this.allLocationsSelected=false;
    this.allRegionsSelected=false;
    this.OThoursSettingsFormGroup.controls['locationId'].enable();
    this.OThoursSettingsFormGroup.controls['regionId'].enable();
  }
  onlyNumerics(event:any){
    if (event.key === '.') {
      event.preventDefault();
    }
  }

  private setOrgSystems(): void {
    const orgPreferences = this.store.selectSnapshot(OrganizationManagementState.organization)?.preferences;
    const isIRPFlagEnabled = this.store.selectSnapshot(AppState.isIrpFlagEnabled);

    this.orgSystems.IRPAndVMS = isIRPFlagEnabled && !!(orgPreferences?.isIRPEnabled && orgPreferences?.isVMCEnabled);
    this.orgSystems.IRP = isIRPFlagEnabled && !!orgPreferences?.isIRPEnabled;
    this.orgSystems.VMS = !!orgPreferences?.isVMCEnabled;
    this.setConfigurationSystemType(this.getParentConfigurationSystemType());

    if (this.orgSystems.IRPAndVMS) {
      this.updateFilterColumns();
    }
  }

  private updateFilterColumns(): void {
    this.filterColumns = {
      ...this.filterColumns,
      ...SettingsSystemFilterCols,
    };
  }

  private getParentConfigurationSystemType(): SystemType {
    if (this.orgSystems.IRPAndVMS || (this.orgSystems.IRP && !this.orgSystems.VMS)) {
      return SystemType.IRP;
    } else {
      return SystemType.VMS;
    }
  }
}
