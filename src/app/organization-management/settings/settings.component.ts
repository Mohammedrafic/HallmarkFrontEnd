import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { DetailRowService, GridComponent, PagerComponent } from '@syncfusion/ej2-angular-grids';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Department } from '@shared/models/department.model';
import { Location } from '@shared/models/location.model';
import { Region } from '@shared/models/region.model';
import {
  OrganizationSettingsDropDownOption,
  OrganizationSettingsGet,
  OrganizationSettingsPost,
  OrganizationSettingValidation, OrganizationSettingValueOptions
} from '@shared/models/organization-settings.model';
import { OrganizationSettingControlType } from '@shared/enums/organization-setting-control-type';
import { FieldSettingsModel, MultiSelectComponent } from '@syncfusion/ej2-angular-dropdowns';
import {
  ClearDepartmentList,
  ClearLocationList,
  GetDepartmentsByLocationId,
  GetLocationsByRegionId,
  GetOrganizationSettings,
  GetRegionsByOrganizationId,
  SaveOrganizationSettings,
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
  @ViewChild('gridPager') pager: PagerComponent;
  @ViewChild('multiSelectComponent') multiSelectComponent: MultiSelectComponent;
  public isAllDropDownOptionsSelected = false;

  public organizationSettingsFormGroup: FormGroup;
  public formBuilder: FormBuilder;

  @Select(OrganizationManagementState.organizationSettings)
  public settings$: Observable<OrganizationSettingsGet[]>;

  @Select(OrganizationManagementState.regions)
  regions$: Observable<Region[]>;
  public regionFields: FieldSettingsModel = { text: 'name', value: 'id' };
  public selectedRegion: number | null;

  @Select(OrganizationManagementState.locationsByRegionId)
  locations$: Observable<Location[]>;
  public locationFields: FieldSettingsModel = { text: 'name', value: 'id' };
  public selectedLocation: number | null;

  @Select(OrganizationManagementState.departments)
  departments$: Observable<Department[]>;
  public departmentFields: FieldSettingsModel = { text: 'departmentName', value: 'departmentId' };
  public selectedDepartment: number | null;

  private fakeOrganizationId = 2; // TODO: remove after BE implementation

  public isEdit: boolean;
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
  }

  ngOnInit(): void {
    this.store.dispatch(new GetOrganizationSettings(this.fakeOrganizationId)); // TODO: replace with valid organizationId after BE implementation
    this.store.dispatch(new GetRegionsByOrganizationId(this.fakeOrganizationId)); // TODO: replace with valid organizationId after BE implementation
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
    this.regionChanged(this.initialRegionId);
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
      this.organizationHierarchy = OrganizationHierarchy.Organization;
      this.organizationHierarchyId = parentRecord.organizationId;
      this.regionChanged(this.invalidId);
      this.setFormValuesForEdit(parentRecord, true);
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

      this.setFormValuesForEdit(parentRecord, false);
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
    if (this.organizationSettingsFormGroup.valid) {
      let dynamicValue: any;

      if (this.organizationSettingsFormGroup.controls['controlType'].value === OrganizationSettingControlType.Multiselect) {
        const options: string[] = [];
        this.organizationSettingsFormGroup.controls['value'].value
          .forEach((item: string) => options.push(item));
        dynamicValue = options.join(';');
      } else if (this.organizationSettingsFormGroup.controls['controlType'].value === OrganizationSettingControlType.Checkbox)  {
        dynamicValue = this.organizationSettingsFormGroup.controls['value'].value
          ? this.organizationSettingsFormGroup.controls['value'].value.toString() : 'false';
      } else if (this.organizationSettingsFormGroup.controls['controlType'].value === OrganizationSettingControlType.Text) {
        dynamicValue = this.organizationSettingsFormGroup.controls['value'].value.toString()
      } else {
        dynamicValue = this.organizationSettingsFormGroup.controls['value'].value;
      }

      const setting: OrganizationSettingsPost = {
        settingKey: this.organizationSettingsFormGroup.controls['settingKey'].value,
        hierarchyId: this.organizationHierarchyId,
        hierarchyLevel: this.organizationHierarchy,
        value: dynamicValue
      }

      this.store.dispatch(new SaveOrganizationSettings(setting, this.fakeOrganizationId));  // TODO: uncomment after override functionality implementation
      this.store.dispatch(new ShowSideDialog(false));
      this.removeActiveCssClass();
      this.clearFormDetails();
      this.isFormShown = false;
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
      this.dropdownDataSource = data.valueOptions
    }

    setTimeout(() => {
      this.organizationSettingsFormGroup.setValue({
        settingKey: data.settingKey,
        controlType: data.controlType,
        name: data.name,
        value: null
      });

      if (this.multiSelectComponent) {
        this.multiSelectComponent.selectAll(true);
      }
    });
  }

  private setFormValuesForEdit(data: any, isParent: boolean): void {
    let dynamicValue: any;

    if (this.formControlType === OrganizationSettingControlType.Checkbox) {
      dynamicValue = isParent ? data.value === 'true' : data.children[0].value === 'true';
    }

    if (this.formControlType === OrganizationSettingControlType.DateTime
      || this.formControlType === OrganizationSettingControlType.Text) {
      dynamicValue = isParent ? data.value : data.children[0].value;
    }

    if (this.formControlType === OrganizationSettingControlType.Multiselect) {
      this.dropdownDataSource = data.valueOptions;
      dynamicValue = isParent ? this.getDropDownOptionIds(data.value) : this.getDropDownOptionIds(data.children[0].value);
    }

    if (this.formControlType === OrganizationSettingControlType.Select) {
      this.dropdownDataSource = data.valueOptions;
      dynamicValue = isParent ? this.getDropDownOptionIds(data.value) : this.getDropDownOptionIds(data.children[0].value);
      dynamicValue = dynamicValue.length !== 0 ? dynamicValue[0] : '';
    }

    setTimeout(() => {
      this.organizationSettingsFormGroup.setValue({
        settingKey: data.settingKey,
        controlType: data.controlType,
        name: data.name,
        value: dynamicValue
      });

      if (dynamicValue && dynamicValue.length === 0 && this.multiSelectComponent) {
        this.multiSelectComponent.selectAll(true);
      }
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
      this.selectedRegion = regionId;
    } else {
      this.selectedRegion = null;
    }
  }

  private locationChanged(locationId: number): void {
    if (locationId && locationId !== this.invalidId) {
      this.store.dispatch(new GetDepartmentsByLocationId(locationId));
      this.organizationHierarchy = OrganizationHierarchy.Location;
      this.organizationHierarchyId = locationId;
      this.selectedLocation = locationId
    } else {
      this.selectedLocation = null;
      this.store.dispatch(new ClearLocationList());
    }
  }

  private departmentChanged(departmentId: number): void {
    if (departmentId && departmentId !== this.invalidId) {
      this.organizationHierarchy = OrganizationHierarchy.Department;
      this.organizationHierarchyId = departmentId;
      this.selectedDepartment = departmentId
    } else {
      this.selectedDepartment = null;
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
    this.dropdownDataSource = [];
    this.childRecord = undefined;
    this.isAllDropDownOptionsSelected = false;
    this.regionChanged(this.invalidId);
    this.locationChanged(this.invalidId);
    this.departmentChanged(this.invalidId);
  }

  private createSettingsForm(): void {
    this.organizationSettingsFormGroup = this.formBuilder.group({
      settingKey: [null],
      controlType: [null],
      name: [{ value: '', disabled: true }],
      value: [null]
    });
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
