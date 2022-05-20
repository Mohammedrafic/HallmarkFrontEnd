import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { DetailRowService, GridComponent, PagerComponent } from '@syncfusion/ej2-angular-grids';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Department } from '@shared/models/department.model';
import { Location } from '@shared/models/location.model';
import { Region } from '@shared/models/region.model';
import {
  OrganizationSettingsDropDownOption,
  OrganizationSettingsGet,
  OrganizationSettingsPost,
  OrganizationSettingValidation,
  OrganizationSettingValueOptions
} from '@shared/models/organization-settings.model';
import { OrganizationSettingControlType } from '@shared/enums/organization-setting-control-type';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import {
  ClearDepartmentList,
  ClearLocationList,
  GetDepartmentsByLocationId,
  GetLocationsByRegionId,
  GetOrganizationSettings,
  GetRegions,
  SaveOrganizationSettings
} from '../store/organization-management.actions';
import { ShowSideDialog } from '../../store/app.actions';
import { CANCEL_COFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants/messages';
import { ConfirmService } from '@shared/services/confirm.service';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { OrganizationHierarchy } from '@shared/enums/organization-hierarchy';
import { OrganizationSettingValidationType } from '@shared/enums/organization-setting-validation-type';
import { User } from '@shared/models/user.model';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { OrganizationManagementState } from '../store/organization-management.state';
import { customEmailValidator } from '@shared/validators/email.validator';

export enum TextFieldTypeControl {
  Email = 1,
  Numeric = 2
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  providers: [DetailRowService, MaskedDateTimeService]
})
export class SettingsComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;

  public organizationSettingsFormGroup: FormGroup;
  public regionFormGroup: FormGroup;
  public regionRequiredFormGroup: FormGroup;
  public locationFormGroup: FormGroup;
  public departmentFormGroup: FormGroup;
  public formBuilder: FormBuilder;

  @Select(OrganizationManagementState.organizationSettings)
  public settings$: Observable<OrganizationSettingsGet[]>;

  @Select(OrganizationManagementState.regions)
  regions$: Observable<Region[]>;

  @Select(OrganizationManagementState.locationsByRegionId)
  locations$: Observable<Location[]>;

  public regionLocationFields: FieldSettingsModel = { text: 'name', value: 'id' };

  @Select(OrganizationManagementState.departments)
  departments$: Observable<Department[]>;
  public departmentFields: FieldSettingsModel = { text: 'departmentName', value: 'departmentId' };

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

  public maxFieldLength = 100;

  get dialogHeader(): string {
    return this.isEdit ? 'Edit' : 'Add';
  }

  private childRecord: any;
  private initialRegionId: number;
  private invalidId = -99;
  private unsubscribe$: Subject<void> = new Subject();

  constructor(private store: Store,
              @Inject(FormBuilder) private builder: FormBuilder,
              private confirmService: ConfirmService) {
    super();
    this.formBuilder = builder;
    this.createSettingsForm();
    this.createRegionLocationDepartmentForm();
  }

  ngOnInit(): void {
    this.store.dispatch(new GetOrganizationSettings());
    this.store.dispatch(new GetRegions());
    this.mapGridData();
    this.subscribeToRegionLocationDepartment();
    this.isEditOverrideAccessible();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onOverrideButtonClick(data: any): void {
    this.isFormShown = true;
    this.formControlType = data.controlType;
    this.regionChanged(this.invalidId);
    this.locationChanged(this.invalidId);
    this.departmentChanged(this.invalidId);
    this.setFormValidation(data);
    this.setFormValuesForOverride(data);
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onEditButtonClick(parentRecord: any, childRecord: any, event: any): void {
    this.isFormShown = true;
    this.addActiveCssClass(event);
    this.isEdit = true;
    this.formControlType = parentRecord.controlType;
    this.setFormValidation(parentRecord);

    if (!childRecord) {
      this.isParentEdit = true;
      this.organizationHierarchy = OrganizationHierarchy.Organization;
      this.organizationHierarchyId = parentRecord.organizationId;
      this.regionChanged(this.invalidId);
      this.setFormValuesForEdit(parentRecord, null);
    } else {
      this.childRecord = childRecord;
      if (childRecord.regionId) {
        this.regionChanged(childRecord.regionId);
      } else {
        this.regionChanged(this.initialRegionId);
      }

      if (childRecord.locationId) {
        this.locationChanged(childRecord.locationId);
      }

      if (childRecord.departmentId) {
        this.departmentChanged(childRecord.departmentId);
      }

      this.setFormValuesForEdit(parentRecord, childRecord);
    }

    this.store.dispatch(new ShowSideDialog(true));
  }

  public onFormCancelClick(): void {
    this.confirmService
      .confirm(CANCEL_COFIRM_TEXT, {
        title: DELETE_CONFIRM_TITLE,
        okButtonLabel: 'Leave',
        okButtonClass: 'delete-button'
      }).pipe(filter(confirm => !!confirm))
      .subscribe(() => {
        this.store.dispatch(new ShowSideDialog(false));
        this.removeActiveCssClass();
        this.clearFormDetails();
        this.isFormShown = false;
      });
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
    this.settings$.subscribe(data => {
      this.lastAvailablePage = this.getLastPage(data);
      data.forEach(item => {
        if(item.controlType === OrganizationSettingControlType.Select
          || item.controlType === OrganizationSettingControlType.Multiselect) {
          if (typeof item.value === 'string') {
            item.value = this.getDropDownOptionsFromString(item.value, item.valueOptions);
          }
        }
      });

      this.gridDataSource = this.getRowsPerPage(data, this.currentPagerPage);
      this.totalDataRecords = data.length;
    });
  }

  public rowDataBound(args: any): void {
    // hides expand button if no children
    if(args.data.children.length === 0) {
      args.row.querySelector('td').innerHTML = ' ';
      args.row.querySelector('td').className = 'e-customized-expand-cell';
    }
  }

  public onRowsDropDownChanged(): void {
    this.grid.pageSettings.pageSize = this.pageSizePager = this.getActiveRowsPerPage();
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.settings$.subscribe(data => {
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
          this.organizationSettingsFormGroup.controls['value'].value
            .forEach((item: string) => options.push(item));
        }
        dynamicValue = options.join(';');
        break;
      case OrganizationSettingControlType.Checkbox:
        dynamicValue = this.organizationSettingsFormGroup.controls['value'].value
          ? this.organizationSettingsFormGroup.controls['value'].value.toString() : 'false';
        break;
      case OrganizationSettingControlType.Text:
        dynamicValue = this.organizationSettingsFormGroup.controls['value'].value.toString()
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
      value: dynamicValue
    }

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
    if (this.formControlType === OrganizationSettingControlType.Multiselect
      || this.formControlType === OrganizationSettingControlType.Select) {
      this.dropdownDataSource = data.valueOptions;
    }

    this.organizationSettingsFormGroup.setValue({
      settingValueId: null,
      settingKey: data.settingKey,
      controlType: data.controlType,
      name: data.name,
      value: null
    });
  }

  private setFormValuesForEdit(parentData: any, childData: any): void {
    let dynamicValue: any;

    if (this.formControlType === OrganizationSettingControlType.Checkbox) {
      dynamicValue = this.isParentEdit ? parentData.value === 'true' : childData.value === 'true';
    }

    if (this.formControlType === OrganizationSettingControlType.DateTime
      || this.formControlType === OrganizationSettingControlType.Text) {
      dynamicValue = this.isParentEdit ? parentData.value : childData.value;
    }

    if (this.formControlType === OrganizationSettingControlType.Multiselect) {
      this.dropdownDataSource = parentData.valueOptions;
      dynamicValue = this.isParentEdit ? this.getDropDownOptionIds(parentData.value) : this.getDropDownOptionIds(childData.value);
    }

    if (this.formControlType === OrganizationSettingControlType.Select) {
      this.dropdownDataSource = parentData.valueOptions;
      dynamicValue = this.isParentEdit ? this.getDropDownOptionIds(parentData.value) : this.getDropDownOptionIds(childData.value);
      dynamicValue = dynamicValue.length !== 0 ? dynamicValue[0] : '';
    }

    this.organizationSettingsFormGroup.setValue({
      settingValueId: this.isParentEdit ? null : childData.settingValueId,
      settingKey: parentData.settingKey,
      controlType: parentData.controlType,
      name: parentData.name,
      value: dynamicValue
    });
  }

  private subscribeToRegionLocationDepartment(): void {
    this.regions$.pipe(takeUntil(this.unsubscribe$)).subscribe(region => {
      if (region[0] && region[0].id) {
        this.initialRegionId = region[0].id;
        this.regionChanged(region[0].id);
      }
    });

    this.locations$.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      if (this.childRecord && this.childRecord.locationId) {
        this.locationChanged(this.childRecord.locationId);
      }
    });

    this.departments$.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      if (this.childRecord && this.childRecord.departmentId) {
        this.departmentChanged(this.childRecord.departmentId);
      }
    });
  }

  private regionChanged(regionId: number): void {
    if (regionId && regionId !== this.invalidId) {
      this.store.dispatch(new GetLocationsByRegionId(regionId));
      this.organizationHierarchy = OrganizationHierarchy.Region;
      this.organizationHierarchyId = regionId;
      this.regionFormGroup.setValue({ regionId: regionId });
      this.regionRequiredFormGroup.setValue({ regionId: regionId });
    } else {
      this.regionFormGroup.reset();
      this.regionRequiredFormGroup.reset();
    }
  }

  private locationChanged(locationId: number): void {
    if (locationId && locationId !== this.invalidId) {
      this.store.dispatch(new GetDepartmentsByLocationId(locationId));
      this.organizationHierarchy = OrganizationHierarchy.Location;
      this.organizationHierarchyId = locationId;
      this.locationFormGroup.setValue({ locationId: locationId });
    } else {
      this.locationFormGroup.reset();
      this.store.dispatch(new ClearLocationList());
    }
  }

  private departmentChanged(departmentId: number): void {
    if (departmentId && departmentId !== this.invalidId) {
      this.organizationHierarchy = OrganizationHierarchy.Department;
      this.organizationHierarchyId = departmentId;
      this.departmentFormGroup.setValue({ departmentId: departmentId });
    } else {
      this.departmentFormGroup.reset();
      this.store.dispatch(new ClearDepartmentList());
    }
  }

  private getDropDownOptionsFromString(text: string, valueOptions: OrganizationSettingValueOptions[]): OrganizationSettingsDropDownOption[] {
    let options: OrganizationSettingsDropDownOption[] = [];
    if (text) {
      let optionIds = text.split(';');
      optionIds.forEach(id => {
        const foundOption = valueOptions.find(option => option.key === id);
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
    this.organizationSettingsFormGroup.reset();
    this.isEdit = false;
    this.isParentEdit = false;
    this.dropdownDataSource = [];
    this.childRecord = undefined;
    this.regionChanged(this.invalidId);
    this.locationChanged(this.invalidId);
    this.departmentChanged(this.invalidId);
  }

  private createSettingsForm(): void {
    this.organizationSettingsFormGroup = this.formBuilder.group({
      settingValueId: [null],
      settingKey: [null],
      controlType: [null],
      name: [{ value: '', disabled: true }],
      value: [null]
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
    return data.slice((currentPage * this.getActiveRowsPerPage()) - this.getActiveRowsPerPage(),
      (currentPage * this.getActiveRowsPerPage()));
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
}
