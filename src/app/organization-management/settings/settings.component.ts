import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';

import { Select, Store } from '@ngxs/store';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { DetailRowService, GridComponent } from '@syncfusion/ej2-angular-grids';
import { distinctUntilChanged, filter, Observable, skip, Subject, take, takeUntil } from 'rxjs';

import { OutsideZone } from '@core/decorators';
import { DateTimeHelper, MultiEmailValidator } from '@core/helpers';
import { ORG_SETTINGS } from '@organization-management/organization-management-menu.config';
import { TextFieldTypeControl } from '@organization-management/settings/enums/settings.enum';
import { SideMenuService } from '@shared/components/side-menu/services';
import { OrganizationSettingKeys, OrganizationSettings } from '@shared/constants';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants/messages';
import { Days } from '@shared/enums/days';
import { OrganizationHierarchy } from '@shared/enums/organization-hierarchy';
import { OrganizationSettingControlType } from '@shared/enums/organization-setting-control-type';
import { OrganizationSettingValidationType } from '@shared/enums/organization-setting-validation-type';
import { PermissionTypes } from '@shared/enums/permissions-types.enum';
import { SystemType } from '@shared/enums/system-type.enum';
import { Weeks } from '@shared/enums/weeks';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { ButtonModel } from '@shared/models/buttons-group.model';
import { Department } from '@shared/models/department.model';
import { FilteredItem } from '@shared/models/filter.model';
import { Location } from '@shared/models/location.model';
import {
  OrganizationSettingChild,
  OrganizationSettingFilter,
  OrganizationSettingsGet,
  OrganizationSettingsPost,
  OrganizationSettingValidation,
  OrganizationSettingValueOptions,
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
import { SettingsGroupInvoicesOptions } from 'src/app/modules/invoices/constants';
import { PermissionService } from 'src/app/security/services/permission.service';
import { AppState } from 'src/app/store/app.state';

import { ShowFilterDialog, ShowSideDialog, ShowToast } from '../../store/app.actions';
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
import { SettingsDataAdapter } from './helpers/settings-data.adapter';
import {
  AssociatedLink,
  BillingSettingsKey,
  DepartmentFields,
  DepartmentSkillRequired,
  DisabledSettingsByDefault,
  DropdownCheckboxValueDataSource,
  DropdownFields,
  GetSettingSystemButtons,
  InvoiceGeneratingSettingsKey,
  OptionFields,
  OrganizationSystems,
  SettingsAppliedToPermissions,
  SettingsFilterCols,
  SettingsSystemFilterCols,
  TextOptionFields,
  TierSettingsKey,
} from './settings.constant';
import { AutoGenerationPayload, PayPeriodPayload, SwitchValuePayload } from './settings.interface';
import { MessageTypes } from '@shared/enums/message-types';

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

  @Select(OrganizationManagementState.organizationSettings)
  settings$: Observable<OrganizationSettingsGet[]>;

  @Select(OrganizationManagementState.sortedRegions)
  regions$: Observable<Region[]>;

  @Select(OrganizationManagementState.organizationSettingsFilterOptions)
  organizationSettingsFilterOptions$: Observable<string[]>;

  @Select(OrganizationManagementState.sortedLocationsByRegionId)
  locations$: Observable<Location[]>;

  @Select(OrganizationManagementState.sortedDepartments)
  departments$: Observable<Department[]>;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  @Select(UserState.organizationStructure)
  organizationStructure$: Observable<OrganizationStructure>;

  readonly daysOfWeek = Days;
  readonly noOfWeek = Weeks;
  readonly orgSystems = OrganizationSystems;
  readonly associateLink = AssociatedLink;
  readonly dropdownFields = DropdownFields;
  readonly departmentFields = DepartmentFields;
  readonly textOptionFields = TextOptionFields;
  readonly optionFields: FieldSettingsModel = OptionFields;
  readonly groupInvoicesOptions = SettingsGroupInvoicesOptions;
  readonly textFieldTypeControl = TextFieldTypeControl;
  readonly dropdownCheckboxValueDataSource = DropdownCheckboxValueDataSource;
  readonly organizationSettingControlType = OrganizationSettingControlType;
  readonly disabledSettings = DisabledSettingsByDefault;


  organizationSettingsFormGroup: FormGroup;
  regionFormGroup: FormGroup;
  regionRequiredFormGroup: FormGroup;
  locationFormGroup: FormGroup;
  departmentFormGroup: FormGroup;
  pushStartDateFormGroup: FormGroup;
  invoiceGeneratingFormGroup: FormGroup;
  switchedValueForm: FormGroup;
  checkboxValueForm: FormGroup;
  RegionLocationSettingsMultiFormGroup: FormGroup;
  payPeriodFormGroup: FormGroup;

  dropdownDataSource: OrganizationSettingValueOptions[];
  allRegions: OrganizationRegion[] = [];
  regionBasedLocations: OrganizationLocation[] = [];
  SettingsFilterFormGroup: FormGroup;
  filterColumns = SettingsFilterCols;
  IsSettingKeyOtHours = false;
  allRegionsSelected = false;
  allLocationsSelected = false;
  allDepartmentSelected = false;
  IsSettingKeyPayPeriod = false;
  separateValuesInSystems = false;
  IsSettingKeyScheduleOnlyWithAvailability: boolean = false;
  IsSettingKeyAvailabiltyOverLap: boolean = false;
  IsSettingKeyCreatePartialOrder: boolean = false;
  systemButtons: ButtonModel[] = [];
  isEdit = false;
  isParentEdit = false;
  isFormShown = false;
  formControlType: number;
  showToggleMessage = false;
  showDepartmentSkillToggleMessage = false;
  showBillingMessage = false;
  textFieldType: number;
  maxFieldLength = 100;
  hasPermissions: Record<string, boolean> = {};
  regularLocalRatesToggleMessage = false;
  dialogHeader = 'Add Settings';
  numericValueLabel = 'Value';


  private readonly settingsAppliedToPermissions = SettingsAppliedToPermissions;

  private selectedParentRecord: OrganizationSettingsGet | null;
  private selectedChildRecord: OrganizationSettingChild | null;
  private orgStructure: OrganizationStructure;
  private orgRegions: OrganizationRegion[] = [];
  private organizationHierarchy: number;
  private organizationHierarchyId: number;
  private organizationId: number;
  private dataSource: OrganizationSettingsGet[];
  private configurations: OrganizationSettingsGet[] = [];
  private unsubscribe$: Subject<void> = new Subject();
  private filters: OrganizationSettingFilter = {};
  private configurationSystemType: SystemType = SystemType.VMS;
  private organizationSettingKey: OrganizationSettingKeys;
  regionBasedDepartment: any;

  get switcherValue(): string {
    return this.organizationSettingsFormGroup.controls['value'].value ? 'on' : 'off';
  }

  constructor(
    protected override store: Store,
    private formBuilder: FormBuilder,
    private confirmService: ConfirmService,
    private filterService: FilterService,
    private permissionService: PermissionService,
    private sideMenuService: SideMenuService,
    private readonly ngZone: NgZone,
  ) {
    super(store);
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

  setConfigurationSystemType(system: SystemType, updateButtons = false, updateForm = false): void {
    this.configurationSystemType = system;

    if (updateButtons) {
      this.systemButtons =
        GetSettingSystemButtons(this.configurationSystemType === SystemType.IRP, !!this.selectedChildRecord);
    }

    if (updateForm && this.selectedParentRecord) {
      this.setFormValuesForEdit(this.selectedParentRecord, this.selectedChildRecord);
    }
  }

  showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  closeFilters() {
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

  deleteFilter(event: FilteredItem): void {
    this.filterService.removeValue(event, this.SettingsFilterFormGroup, this.filterColumns);
  }

  clearAllFilters(): void {
    this.clearFilters();
    this.getSettings();
  }

  applyFilters(): void {
    this.filters = this.SettingsFilterFormGroup.getRawValue();
    this.filters.includeInVMS = this.filters.includeInVMS ?? false;
    this.filters.includeInIRP = this.filters.includeInIRP ?? false;
    this.filteredItems = this.filterService.generateChips(this.SettingsFilterFormGroup, this.filterColumns);
    this.getSettings();
    this.store.dispatch(new ShowFilterDialog(false));
  }

  openOverrideSettingDialog(data: OrganizationSettingsGet): void {
    this.setSelectedRecords(data);
    this.setOrganizationSettingKey(data.settingKey);
    this.setConfigurationSystemType(this.getParentConfigurationSystemType(), true);
    this.separateValuesInSystems = data.separateValuesInSystems;
    this.enableOtForm();
    this.IsSettingKeyOtHours = OrganizationSettingKeys[OrganizationSettingKeys['OTHours']].toString() == data.settingKey;
    this.IsSettingKeyPayPeriod = OrganizationSettingKeys[OrganizationSettingKeys['PayPeriod']].toString() == data.settingKey;
    this.IsSettingKeyAvailabiltyOverLap = OrganizationSettingKeys[OrganizationSettingKeys['AvailabilityOverLapRule']].toString() == data.settingKey;
    this.IsSettingKeyCreatePartialOrder = OrganizationSettingKeys[OrganizationSettingKeys['CreatePartialOrder']].toString() == data.settingKey;
    this.IsSettingKeyScheduleOnlyWithAvailability = OrganizationSettingKeys[OrganizationSettingKeys['ScheduleOnlyWithAvailability']].toString() == data.settingKey;
    this.handleShowToggleMessage(data.settingKey);
    this.isFormShown = true;
    this.formControlType = data.controlType;
    this.disableDepForInvoiceGeneration();
    this.regionFormGroup.reset();
    this.regionRequiredFormGroup.reset();
    this.RegionLocationSettingsMultiFormGroup.reset();
    this.locationFormGroup.reset();
    this.departmentFormGroup.reset();
    this.payPeriodFormGroup.reset();
    this.store.dispatch(new ClearLocationList());
    this.store.dispatch(new ClearDepartmentList());
    this.setFormValidation(data);
    this.setFormValuesForOverride(data);
    this.store.dispatch(new ShowSideDialog(true));
    if (this.IsSettingKeyAvailabiltyOverLap || this.IsSettingKeyAvailabiltyOverLap || this.IsSettingKeyCreatePartialOrder) {
      this.switchedValueForm.controls["value"].setValue(4)
      this.switchedValueForm.controls['isEnabled'].setValue(true)
      this.switchedValueForm.get('value')?.addValidators(Validators.maxLength(2));
      this.maxFieldLength = 2;
      this.disableSettingsValue(undefined, this.switchedValueForm.get('isEnabled')?.value);
    } else {
      this.switchedValueForm.get('value')?.clearValidators();
      this.disableSettingsValue(undefined, this.switchedValueForm.get('isEnabled')?.value);
    }
  }

  openEditSettingDialog(
    parentRecord: OrganizationSettingsGet,
    childRecord: OrganizationSettingChild | undefined,
    event: MouseEvent
  ): void {
    this.setSelectedRecords(parentRecord, childRecord);
    this.setOrganizationSettingKey(parentRecord.settingKey);
    this.separateValuesInSystems = parentRecord.separateValuesInSystems;
    this.IsSettingKeyOtHours =
      OrganizationSettingKeys[OrganizationSettingKeys['OTHours']].toString() == parentRecord.settingKey;
    this.IsSettingKeyPayPeriod =
      OrganizationSettingKeys[OrganizationSettingKeys['PayPeriod']].toString() == parentRecord.settingKey;
    this.IsSettingKeyAvailabiltyOverLap = OrganizationSettingKeys[OrganizationSettingKeys['AvailabilityOverLapRule']].toString() == parentRecord.settingKey;
    this.IsSettingKeyScheduleOnlyWithAvailability = OrganizationSettingKeys[OrganizationSettingKeys['ScheduleOnlyWithAvailability']].toString() == parentRecord.settingKey;
    this.setNumericValueLabel(parentRecord.settingKey);
    this.IsSettingKeyCreatePartialOrder = OrganizationSettingKeys[OrganizationSettingKeys['CreatePartialOrder']].toString() == parentRecord.settingKey;
    this.enableOtForm();
    this.handleShowToggleMessage(parentRecord.settingKey);
    this.store.dispatch(new GetOrganizationStructure());
    this.isFormShown = true;
    this.addActiveCssClass(event);
    this.setEditMode();
    this.regularLocalRatesToggleMessage = OrganizationSettings.MandateCandidateAddress === parentRecord.settingKey &&
    this.dataSource.find((data: OrganizationSettingsGet) => data.settingKey === OrganizationSettings.EnableRegularLocalRates)?.value == 'true';
    this.formControlType = parentRecord.controlType;
    this.disableDepForInvoiceGeneration();
    this.setFormValidation(parentRecord);
    this.isParentEdit = !childRecord;
    this.setSystemTypeForEditMode(childRecord);
    this.setChildRecordData(childRecord);
    this.setFormValuesForEdit(parentRecord, childRecord || null);
    this.store.dispatch(new ShowSideDialog(true));
    if (this.IsSettingKeyAvailabiltyOverLap || this.IsSettingKeyAvailabiltyOverLap || this.IsSettingKeyCreatePartialOrder) {
      this.switchedValueForm.get('value')?.addValidators(Validators.maxLength(2));
      this.maxFieldLength = 2;
    } else {
      this.switchedValueForm.get('value')?.clearValidators();
    }
    if (this.isParentEdit && (this.IsSettingKeyAvailabiltyOverLap || this.IsSettingKeyScheduleOnlyWithAvailability || this.IsSettingKeyOtHours || this.IsSettingKeyCreatePartialOrder)) {
      this.RegionLocationSettingsMultiFormGroup.disable();
      this.allRegionsSelected = true;
      this.allLocationsSelected = true;
      this.allDepartmentSelected = true
    }
  }

  cancelSettingChanges(): void {
    if (
      this.organizationSettingsFormGroup.touched ||
      this.regionFormGroup.touched ||
      this.regionRequiredFormGroup.touched ||
      this.locationFormGroup.touched ||
      this.departmentFormGroup.touched ||
      this.pushStartDateFormGroup.touched ||
      this.invoiceGeneratingFormGroup.touched ||
      this.RegionLocationSettingsMultiFormGroup.touched ||
      this.payPeriodFormGroup.touched
    ) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(
          filter((confirm: boolean) => confirm),
          take(1)
        ).subscribe(() => {
          this.closeSettingDialog();
        });
    } else {
      this.closeSettingDialog();
    }
  }

  saveSetting(): void {
    if (this.isEdit) {
      this.editSetting();
      return;
    }

    if (this.allDepartmentSelected == true) {
      this.RegionLocationSettingsMultiFormGroup.controls['departmentId'].setValue(null)
    }

    if (
      this.regionRequiredFormGroup.valid
      && this.isPushStartDateValid()
      && this.invoiceAutoGeneratingValig()
      && this.switchedValueForm.valid
      && this.checkboxValueForm.valid
    ) {
      if (this.organizationSettingsFormGroup.valid) {
        this.sendForm();
      } else {
        this.organizationSettingsFormGroup.markAllAsTouched();
        this.validatePushStartDateForm();
        this.validateInvoiceGeneratingForm();
      }
      return;
    }

    if ((this.IsSettingKeyOtHours || this.IsSettingKeyScheduleOnlyWithAvailability) && this.allLocationsSelected && this.allRegionsSelected) {
      this.organizationHierarchy = OrganizationHierarchy.Organization;
      this.organizationHierarchyId = this.organizationId;

      if (this.organizationSettingsFormGroup.valid) {
        this.sendForm();
      } else {
        this.organizationSettingsFormGroup.markAllAsTouched();
      }
    }

    if (this.IsSettingKeyAvailabiltyOverLap && this.allLocationsSelected && this.allRegionsSelected) {
      this.organizationHierarchy = OrganizationHierarchy.Organization;
      this.organizationHierarchyId = this.organizationId;
      if (this.switchedValueForm.valid) {
        this.sendForm();
      } else {
        this.switchedValueForm.markAllAsTouched();
      }
    }

    if(this.IsSettingKeyCreatePartialOrder){
      if (this.IsSettingKeyCreatePartialOrder && this.allLocationsSelected && this.allRegionsSelected && this.allDepartmentSelected) {
        this.organizationHierarchy = OrganizationHierarchy.Organization;
        this.organizationHierarchyId = this.organizationId;
        if (this.switchedValueForm.valid) {
          this.sendForm();
        } else {
          this.switchedValueForm.markAllAsTouched();
        }
      }
      else if (this.RegionLocationSettingsMultiFormGroup.valid ||this.RegionLocationSettingsMultiFormGroup.get("departmentId")?.value) {
        this.organizationHierarchy = OrganizationHierarchy.Organization;
        this.organizationHierarchyId = this.organizationId;
        if (this.switchedValueForm.valid) {
          this.sendForm();
        } else {
          this.switchedValueForm.markAllAsTouched();
        }
      }else{
        this.RegionLocationSettingsMultiFormGroup.markAllAsTouched();
        this.store.dispatch(new ShowToast(MessageTypes.Error, "Please select a Department"));
        return;

      }
    }

    if (this.RegionLocationSettingsMultiFormGroup.valid) {
      this.organizationHierarchy = OrganizationHierarchy.Organization;
      this.organizationHierarchyId = this.organizationId;

      if (this.organizationSettingsFormGroup.valid) {
        this.sendForm();
      } else {
        this.organizationSettingsFormGroup.markAllAsTouched();
      }

      if (this.IsSettingKeyAvailabiltyOverLap &&
        this.switchedValueForm.valid) {
        this.sendForm();
      } else {
        this.switchedValueForm.markAllAsTouched();
      }
    }

    this.RegionLocationSettingsMultiFormGroup.markAllAsTouched();
    this.regionRequiredFormGroup.markAllAsTouched();
    this.payPeriodFormGroup.markAllAsTouched();
    this.validatePushStartDateForm();
    this.validateInvoiceGeneratingForm();
  }

  changeRegion(event: { itemData: { id: number } }): void {
    if (event.itemData && event.itemData.id) {
      this.store.dispatch(new ClearLocationList());
      this.store.dispatch(new ClearDepartmentList());
      this.regionChanged(event.itemData.id);
    }
  }

  changeLocation(event: { itemData: { id: number } }): void {
    if (event.itemData && event.itemData.id) {
      this.locationChanged(event.itemData.id);
    }
  }

  changeDepartment(event: { itemData: { departmentId: number } }): void {
    if (event.itemData && event.itemData.departmentId) {
      this.departmentChanged(event.itemData.departmentId);
    }
  }

  redirectToTiers(): void {
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

  private watchForSettings(): void {
    this.settings$
      .pipe(
        skip(1),
        takeUntil(this.unsubscribe$),
      )
      .subscribe((data: OrganizationSettingsGet[]) => {
        const adaptedData = SettingsDataAdapter.adaptSettings(data, this.orgSystems);

        this.configurations = data;
        this.lastAvailablePage = this.getLastPage(data);
        let settingData = this.getRowsPerPage(adaptedData, this.currentPagerPage);
        settingData.forEach(element => {
          if (element?.settingKey == OrganizationSettingKeys[OrganizationSettingKeys['OTHours']]) {
            element.children?.forEach(e => {
              if (e.regionId == null && e.settingKey == OrganizationSettingKeys[OrganizationSettingKeys['OTHours']]) {
                e.hidden = true;
              }
            })
          }
        });
        this.gridDataSource = settingData;
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

  private sendForm(): void {
    let dynamicValue: string;
    const options: string[] = [];

    switch (this.organizationSettingsFormGroup.controls['controlType'].value) {
      case OrganizationSettingControlType.Multiselect:
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
        dynamicValue = JSON.stringify({
          isEnabled: this.organizationSettingsFormGroup.controls['value'].value,
          daysToPush: this.pushStartDateFormGroup.controls['daysToPush'].value,
          daysToConsider: this.pushStartDateFormGroup.controls['daysToConsider'].value,
        });
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
      regionId: this.RegionLocationSettingsMultiFormGroup.controls['regionId'].value || null,
      locationId: this.RegionLocationSettingsMultiFormGroup.controls['locationId'].value || null,
      departmentId: this.RegionLocationSettingsMultiFormGroup.controls['departmentId'].value || null,
      isIRPConfigurationValue: this.configurationSystemType === SystemType.IRP,
    };

    this.store.dispatch(new SaveOrganizationSettings(setting, this.filters));
    this.store.dispatch(new ShowSideDialog(false));
    this.setSelectedRecords();
    this.removeActiveCssClass();
    this.clearFormDetails();
    this.isFormShown = false;
  }

  private setFormValidation(data: OrganizationSettingsGet): void {
    this.maxFieldLength = 100;
    const validators: ValidatorFn[] = [];

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

  private setFormValuesForOverride(data: OrganizationSettingsGet): void {
    if (
      this.formControlType === OrganizationSettingControlType.Multiselect ||
      this.formControlType === OrganizationSettingControlType.Select
    ) {
      this.dropdownDataSource = data.valueOptions
        .sort((a: OrganizationSettingValueOptions, b: OrganizationSettingValueOptions) => a.value?.localeCompare(b.value));
    }

    this.organizationSettingsFormGroup.setValue({
      settingValueId: null,
      settingKey: data.settingKey,
      controlType: data.controlType,
      name: data.name,
      value: null,
    });
  }

  private setFormValuesForEdit(parentData: OrganizationSettingsGet, childData: OrganizationSettingChild | null): void {
    let dynamicValue: any;
    const childDataValue = childData?.value;
    const parentDataValue = SettingsDataAdapter
      .getParentSettingValue(parentData, this.configurationSystemType === SystemType.IRP);

    if (this.formControlType === OrganizationSettingControlType.Checkbox) {
      dynamicValue = this.isParentEdit ? parentDataValue === 'true' : childDataValue === 'true';
    }

    if (
      this.formControlType === OrganizationSettingControlType.DateTime ||
      this.formControlType === OrganizationSettingControlType.Text
    ) {
      dynamicValue = this.isParentEdit ? parentDataValue : childDataValue;
    }

    if (this.formControlType === OrganizationSettingControlType.Multiselect) {
      this.dropdownDataSource = parentData.valueOptions;
      if (this.isParentEdit) {
        dynamicValue = SettingsDataAdapter.getDropDownOptionIds(parentDataValue);
      } else {
        dynamicValue = typeof childDataValue === 'string'
          ? childDataValue.split(';')
          : SettingsDataAdapter.getDropDownOptionIds(childDataValue);
      }
    }

    if (this.formControlType === OrganizationSettingControlType.Select) {
      this.dropdownDataSource = parentData.valueOptions;
      dynamicValue = this.isParentEdit
        ? SettingsDataAdapter.getDropDownOptionIds(parentDataValue)
        : SettingsDataAdapter.getDropDownOptionIds(childDataValue);
      dynamicValue = dynamicValue.length !== 0 ? dynamicValue[0] : '';
    }

    if (this.formControlType === OrganizationSettingControlType.FixedKeyDictionary) {
      const valueOptions = this.isParentEdit ? parentDataValue : childDataValue;
      dynamicValue = { ...SettingsDataAdapter.getParsedValue(valueOptions), isDictionary: true };
    }

    if (this.formControlType === OrganizationSettingControlType.InvoiceAutoGeneration) {
      const valueOptions = this.isParentEdit ? parentDataValue : childDataValue;
      dynamicValue = { ...SettingsDataAdapter.getParsedValue(valueOptions), isInvoice: true };
    }

    if (this.formControlType === OrganizationSettingControlType.EmailAria) {
      dynamicValue = this.isParentEdit ? parentDataValue : childDataValue;
    }

    if (this.formControlType === OrganizationSettingControlType.SwitchedValue) {
      const valueOptions = this.isParentEdit ? parentDataValue : childDataValue;
      dynamicValue = { ...SettingsDataAdapter.getParsedValue(valueOptions), isSwitchedValue: true };
    }

    if (this.formControlType === OrganizationSettingControlType.CheckboxValue) {
      const valueOptions = this.isParentEdit ? parentDataValue : childDataValue;
      dynamicValue = { ...SettingsDataAdapter.getParsedValue(valueOptions), isCheckboxValue: true };
    }

    if (this.formControlType === OrganizationSettingControlType.PayPeriod) {
      const valueOptions = this.isParentEdit ? parentDataValue : childDataValue;
      dynamicValue = { ...SettingsDataAdapter.getParsedValue(valueOptions), isPayPeriod: true };
    }

    if (dynamicValue?.isCheckboxValue) {
      this.checkboxValueForm.setValue({
        value: dynamicValue.value ? dynamicValue.value : '',
        isEnabled: dynamicValue.isEnabled ? dynamicValue.isEnabled : false,
      });
    }

    if (dynamicValue?.isPayPeriod) {
      this.payPeriodFormGroup.setValue({
        date: dynamicValue.date || dynamicValue.Date,
        noOfWeek: dynamicValue.noOfWeek || dynamicValue.NoOfWeek,
      });
    }

    this.updateFormOutsideZone(parentData, childData, dynamicValue);
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

  private clearFormDetails(): void {
    this.organizationSettingsFormGroup.get('value')?.clearValidators();
    this.organizationSettingsFormGroup.reset();
    this.regionFormGroup.reset();
    this.regionRequiredFormGroup.reset();
    this.RegionLocationSettingsMultiFormGroup.reset();
    this.locationFormGroup.reset();
    this.departmentFormGroup.reset();
    this.pushStartDateFormGroup.reset();
    this.invoiceGeneratingFormGroup.reset();
    this.payPeriodFormGroup.reset();
    this.switchedValueForm.reset();
    this.checkboxValueForm.reset();
    this.setEditMode(false);
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
    this.RegionLocationSettingsMultiFormGroup = this.formBuilder.group({
      regionId: [null, Validators.required],
      locationId: [null, Validators.required],
      departmentId: []
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

  private getRowsPerPage(data: OrganizationSettingsGet[], currentPage: number): OrganizationSettingsGet[] {
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

      if (key === OrganizationSettingKeys[OrganizationSettingKeys.DepartmentSkillRequired]) {
        this.hasPermissions[key] = this.userPermission[PermissionTypes.ManageDepartmentSkillRequired];
      }
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
    this.showToggleMessage = key === TierSettingsKey;
    this.showDepartmentSkillToggleMessage = key === DepartmentSkillRequired;
    this.showBillingMessage = key === BillingSettingsKey || key === InvoiceGeneratingSettingsKey;
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
      isEnabled: !!this.organizationSettingsFormGroup.controls['value'].value,
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
    this.RegionLocationSettingsMultiFormGroup.get('regionId')?.valueChanges
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
          this.RegionLocationSettingsMultiFormGroup.get('locationId')?.setValue([]);
        }
      });
    this.RegionLocationSettingsMultiFormGroup.get('locationId')?.valueChanges
      .pipe(
        takeUntil(this.unsubscribe$),
      )
      .subscribe((val: number[]) => {
        if (val?.length) {
          const selectedLocations: OrganizationLocation[] = [];
          const departments: OrganizationDepartment[] = [];
          val.forEach((id) =>
            selectedLocations.push(
              this.regionBasedLocations
                .find((location: OrganizationLocation) => location.id === id) as OrganizationLocation,
            )
          );
          this.regionBasedDepartment = [];
          selectedLocations.forEach((location) => {
            departments.push(...(location.departments as []));
          });
          this.regionBasedDepartment = sortByField(departments, 'name');
        } else {
          this.regionBasedDepartment = [];
          this.RegionLocationSettingsMultiFormGroup.get('departmentId')?.setValue([]);

        }
      });

  }

  public allRegionsChange(event: { checked: boolean }): void {
    this.allRegionsSelected = event.checked;
    const regionsControl = this.RegionLocationSettingsMultiFormGroup.controls['regionId'];
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
    const locationsControl = this.RegionLocationSettingsMultiFormGroup.controls['locationId'];
    if (this.allLocationsSelected) {
      locationsControl.setValue(null);
      locationsControl.disable();
    } else {
      locationsControl.enable({ emitEvent: false });
    }
  }

  public allDepartmentChange(event: { checked: boolean }): void {
    this.allDepartmentSelected = event.checked;
    if (this.allDepartmentSelected) {
      this.RegionLocationSettingsMultiFormGroup.controls['departmentId'].setValue(null)
      this.RegionLocationSettingsMultiFormGroup.controls['departmentId'].disable();
    } else {
      this.RegionLocationSettingsMultiFormGroup.controls['departmentId'].enable({ emitEvent: false });
    }
  }

  public otHoursRegionChangesEdit(regionId: number): void {
    if (regionId == null) {
      this.allRegionsSelected = true;
      this.RegionLocationSettingsMultiFormGroup.controls['regionId'].disable();
    } else {
      this.RegionLocationSettingsMultiFormGroup.controls['regionId'].enable();
      this.RegionLocationSettingsMultiFormGroup.controls['regionId'].setValue([regionId]);
      this.RegionLocationSettingsMultiFormGroup.controls['departmentId'].setValue([regionId]);
    }

  }
  public otHoursLocationsEdit(locationId: number): void {
    if (locationId == null) {
      this.allLocationsSelected = true;
      this.RegionLocationSettingsMultiFormGroup.controls['locationId'].disable();
      this.organizationHierarchy = OrganizationHierarchy.Organization;
      this.organizationHierarchyId = this.organizationId;
      this.RegionLocationSettingsMultiFormGroup.controls['locationId'].setValue(null);
    } else {
      this.organizationHierarchy = OrganizationHierarchy.Location;
      this.organizationHierarchyId = locationId;
      this.RegionLocationSettingsMultiFormGroup.controls['locationId'].enable();
      this.RegionLocationSettingsMultiFormGroup.controls['locationId'].setValue([locationId]);

    }

  }
  public enableOtForm() {
    this.allLocationsSelected = false;
    this.allRegionsSelected = false;
    this.allDepartmentSelected = false
    this.RegionLocationSettingsMultiFormGroup.controls['locationId'].enable();
    this.RegionLocationSettingsMultiFormGroup.controls['regionId'].enable();
    this.RegionLocationSettingsMultiFormGroup.controls['departmentId'].enable();

  }
  onlyNumerics(event: any) {
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
    if (this.selectedParentRecord && this.orgSystems.IRPAndVMS) {
      const sharedConfiguration = this.selectedParentRecord.includeInIRP && this.selectedParentRecord.includeInVMS;
      const sharedConfigurationWithTheSameValue = sharedConfiguration && !this.selectedParentRecord.separateValuesInSystems;
      const type = (!this.selectedParentRecord.includeInIRP && this.selectedParentRecord.includeInVMS)
        || sharedConfigurationWithTheSameValue ? SystemType.VMS : SystemType.IRP;

      return type;
    }

    if (this.orgSystems.IRPAndVMS || (this.orgSystems.IRP && !this.orgSystems.VMS)) {
      return SystemType.IRP;
    } else {
      return SystemType.VMS;
    }
  }

  private setEditMode(isEdit = true): void {
    this.isEdit = isEdit;
    this.dialogHeader = this.isEdit ? 'Edit Settings' : 'Add Settings';
  }

  private setOrganizationSettingKey(key: string) {
    this.organizationSettingKey = Number(OrganizationSettingKeys[key as keyof object]);
  }

  private getSettings(): void {
    this.store.dispatch(new GetOrganizationSettings(this.filters));
    this.store.dispatch(new GetRegions());
  }

  private clearFilters(): void {
    this.SettingsFilterFormGroup.reset();
    this.filteredItems = [];
    this.currentPage = 1;
    this.filters = {};
  }

  private setChildRecordData(childRecord: OrganizationSettingChild | undefined): void {
    if (!childRecord) {
      this.organizationHierarchy = OrganizationHierarchy.Organization;
      this.organizationHierarchyId = this.organizationId;

      return;
    }

    if (childRecord.regionId) {
      if (this.IsSettingKeyOtHours || this.IsSettingKeyAvailabiltyOverLap || this.IsSettingKeyScheduleOnlyWithAvailability || this.IsSettingKeyCreatePartialOrder) {
        this.otHoursRegionChangesEdit(childRecord.regionId);
      } else {
        this.regionChanged(childRecord.regionId);
      }
    } else {
      if (this.IsSettingKeyOtHours || this.IsSettingKeyAvailabiltyOverLap || this.IsSettingKeyScheduleOnlyWithAvailability || this.IsSettingKeyCreatePartialOrder) {
        this.otHoursRegionChangesEdit(childRecord.regionId as number);
      }

      this.store.dispatch(new ClearLocationList());
      this.store.dispatch(new ClearDepartmentList());
    }

    if (childRecord.locationId) {
      if (this.IsSettingKeyOtHours || this.IsSettingKeyAvailabiltyOverLap || this.IsSettingKeyScheduleOnlyWithAvailability || this.IsSettingKeyCreatePartialOrder) {
        this.otHoursLocationsEdit(childRecord.locationId);
      } else {
        this.locationChanged(childRecord.locationId);
      }
    } else {
      if (this.IsSettingKeyOtHours || this.IsSettingKeyAvailabiltyOverLap || this.IsSettingKeyScheduleOnlyWithAvailability || this.IsSettingKeyCreatePartialOrder) {
        this.otHoursLocationsEdit(childRecord.locationId as number);
      }

      this.store.dispatch(new ClearDepartmentList());
    }
    if (this.IsSettingKeyCreatePartialOrder) {
      if (childRecord.departmentId == null) {
        this.allDepartmentSelected = true;
        this.RegionLocationSettingsMultiFormGroup.controls['departmentId'].disable();

      }
      else {
        this.RegionLocationSettingsMultiFormGroup.controls['departmentId'].setValue([childRecord.departmentId]);

      }
    }


    if (childRecord.departmentId) {

      this.departmentChanged(childRecord.departmentId);


    }
  }

  setDepartmentvalue(departmentId: number) {
    if (departmentId == null) {
      this.allDepartmentSelected = true;
      this.RegionLocationSettingsMultiFormGroup.controls['departmentId'].setValue(null);


    }
    else {
      this.RegionLocationSettingsMultiFormGroup.controls['departmentId'].setValue([departmentId]);

    }
  }
  private closeSettingDialog(): void {
    this.store.dispatch(new ShowSideDialog(false));
    this.setSelectedRecords();
    this.removeActiveCssClass();
    this.clearFormDetails();
    this.isFormShown = false;
  }

  private editSetting(): void {
    if (this.IsSettingKeyOtHours || this.IsSettingKeyScheduleOnlyWithAvailability) {
      this.organizationHierarchy = OrganizationHierarchy.Organization;
      this.organizationHierarchyId = this.organizationId;
      if (this.allLocationsSelected && this.allRegionsSelected) {
        if (this.organizationSettingsFormGroup.valid) {
          this.sendForm();
        } else {
          this.organizationSettingsFormGroup.markAllAsTouched();
          return
        }
      }
      else if (this.RegionLocationSettingsMultiFormGroup.valid) {
        if (this.organizationSettingsFormGroup.valid) {
          this.sendForm();
        } else {
          this.organizationSettingsFormGroup.markAllAsTouched();
          return
        }
      } else {
        this.RegionLocationSettingsMultiFormGroup.markAllAsTouched();
        return
      }
    } else if (this.IsSettingKeyAvailabiltyOverLap || this.IsSettingKeyCreatePartialOrder) {
      if (this.allLocationsSelected && this.allRegionsSelected) {
        this.organizationHierarchy = OrganizationHierarchy.Organization;
        this.organizationHierarchyId = this.organizationId;
        if (this.switchedValueForm.valid) {
          this.sendForm();
        } else {
          this.switchedValueForm.markAllAsTouched();
          return
        }
      }
      else if (this.RegionLocationSettingsMultiFormGroup.valid) {
        if (this.switchedValueForm.valid) {
          this.sendForm();
        } else {
          this.switchedValueForm.markAllAsTouched();
          return
        }
      } else {
        this.RegionLocationSettingsMultiFormGroup.markAllAsTouched();
        return
      }
    }
    else if (
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
  }

  @OutsideZone
  private updateFormOutsideZone(
    parentData: OrganizationSettingsGet,
    childData: OrganizationSettingChild | null,
    dynamicValue: any,
  ): void {
    setTimeout(() => {
      this.organizationSettingsFormGroup.setValue({
        settingValueId: this.isParentEdit ? null : childData?.settingValueId,
        settingKey: parentData.settingKey,
        controlType: parentData.controlType,
        name: parentData.name,
        value: (dynamicValue?.isDictionary || dynamicValue?.isInvoice || dynamicValue?.isPayPeriod) ?
          !!dynamicValue.isEnabled : dynamicValue,
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

      if (dynamicValue?.isSwitchedValue) {
        this.switchedValueForm.setValue({
          value: dynamicValue.value,
          isEnabled: dynamicValue.isEnabled,
        });
        this.disableSettingsValue(undefined, this.switchedValueForm.get('isEnabled')?.value);
      }
    });
  }

  disableSettingsValue(event?: any, obj?: any) {
    if (this.IsSettingKeyAvailabiltyOverLap || this.IsSettingKeyCreatePartialOrder) {
      if (event?.checked || obj) {
        this.switchedValueForm.get("value")?.enable();
      } else {
        this.switchedValueForm.get("value")?.disable();
      }
    } else {
      this.switchedValueForm.get("value")?.enable();
    }
  }

  private setSystemTypeForEditMode(childRecord: OrganizationSettingChild | undefined): void {
    if (childRecord) {
      this.setConfigurationSystemType(childRecord.isIRPConfigurationValue ? SystemType.IRP : SystemType.VMS, true);
    } else {
      this.setConfigurationSystemType(this.getParentConfigurationSystemType(), true);
    }
  }

  private setSelectedRecords(
    parentRecord: OrganizationSettingsGet | null = null,
    childRecord: OrganizationSettingChild | null = null
  ): void {
    this.selectedParentRecord = parentRecord;
    this.selectedChildRecord = childRecord;
  }

  private setNumericValueLabel(settingKey: string): void {
    const isOnHold = OrganizationSettingKeys[OrganizationSettingKeys['OnHoldDefault']].toString() === settingKey;
    this.numericValueLabel = isOnHold ? 'Value (Weeks)' : 'Value';
  }
}
