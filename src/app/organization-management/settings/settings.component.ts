import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { filter, Observable, of, Subject, takeUntil } from 'rxjs';
import { DetailRowService, GridComponent, PagerComponent } from '@syncfusion/ej2-angular-grids';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Department } from '@shared/models/department.model';
import { Location } from '@shared/models/location.model';
import { OrganizationManagementState } from '../store/organization-management.state';
import { Region } from '@shared/models/region.model';
import {
  OrganizationSettingsDropDownOption,
  OrganizationSettingsGet,
  OrganizationSettingsPost,
  OrganizationSettingValidation, OrganizationSettingValueOptions
} from '@shared/models/organization-settings.model';
import { OrganizationSettingControlType } from '@shared/enums/organization-setting-control-type';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import {
  GetDepartmentsByLocationId,
  GetLocationsByRegionId,
  GetOrganizationSettings, GetRegionsByOrganizationId,
} from '../store/organization-management.actions';
import { ShowSideDialog } from '../../store/app.actions';
import { CANCEL_COFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants/messages';
import { ConfirmService } from '@shared/services/confirm.service';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { MockSettings } from './mock-settings';
import { OrganizationHierarchy } from '@shared/enums/organization-hierarchy';
import { OrganizationSettingValidationType } from '@shared/enums/organization-setting-validation-type';

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

  organizationSettingsFormGroup: FormGroup;
  formBuilder: FormBuilder;

  // @Select(AdminState.organizationSettings) // TODO: uncomment after override functionality implementation
  settings$: Observable<OrganizationSettingsGet[]> = of(MockSettings); // TODO: remove mock after override functionality implementation

  @Select(OrganizationManagementState.regions)
  regions$: Observable<Region[]>;
  regionFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedRegion: number | null;
  regionChanged$ = new Subject<number>();

  @Select(OrganizationManagementState.locationsByRegionId)
  locations$: Observable<Location[]>;
  locationFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedLocation: number | null;
  locationChanged$ = new Subject<number>();

  @Select(OrganizationManagementState.departments)
  departments$: Observable<Department[]>;
  departmentFields: FieldSettingsModel = { text: 'departmentName', value: 'departmentId' };
  selectedDepartment: number | null;
  departmentChanged$ = new Subject<number>();

  fakeOrganizationId = 2; // TODO: remove after BE implementation

  isEdit: boolean;
  organizationSettingControlType = OrganizationSettingControlType;
  formControlType: number;

  dropdownDataSource: OrganizationSettingsDropDownOption[];
  dropdownFields: FieldSettingsModel = { text: 'value', value: 'key' };

  organizationHierarchy: number;
  organizationHierarchyId: number | null;

  textFieldType: number;
  textFieldTypeControl = TextFieldTypeControl;

  maxFieldLength = 100;

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
    this.setHierarchyLevelAndPreSelectedValue();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onOverrideButtonClick(data: any): void {
    this.formControlType = data.controlType;
    this.setFormValidation(data);
    this.regionChanged$.next(this.initialRegionId);
    this.setFormValuesForOverride(data);
    this.store.dispatch(new ShowSideDialog(true));
  }

  onEditButtonClick(parentRecord: any, childRecord: any, event: any): void {
    this.addActiveCssClass(event);
    this.isEdit = true;
    this.formControlType = parentRecord.controlType;
    this.setFormValidation(parentRecord);

    if (!childRecord) {
      this.organizationHierarchy = OrganizationHierarchy.Organization;
      this.organizationHierarchyId = parentRecord.organizationId;
      this.regionChanged$.next(this.invalidId);
      this.setFormValuesForEdit(parentRecord, true);
    } else {
      this.childRecord = childRecord;
      if (childRecord.regionId) {
        this.regionChanged$.next(childRecord.regionId);
      } else {
        this.regionChanged$.next(this.initialRegionId);
      }

      if (childRecord.locationId) {
        this.locationChanged$.next(childRecord.locationId);
      }

      if (childRecord.departmentId) {
        this.departmentChanged$.next(childRecord.departmentId);
      }

      this.setFormValuesForEdit(parentRecord, false);
    }

    this.store.dispatch(new ShowSideDialog(true));
  }

  onFormCancelClick(): void {
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
      });
  }

  onFormSaveClick(): void {
    if (this.organizationSettingsFormGroup.valid) {
      let dynamicValue: any;

      if (this.organizationSettingsFormGroup.controls['controlType'].value === OrganizationSettingControlType.Select
        || this.organizationSettingsFormGroup.controls['controlType'].value === OrganizationSettingControlType.Multiselect) {
        const options: string[] = [];
        this.organizationSettingsFormGroup.controls['value'].value
          .forEach((item: string) => options.push(item));
        dynamicValue = options.join(';');
      } else {
        dynamicValue = this.organizationSettingsFormGroup.controls['value'].value;
      }

      const setting: OrganizationSettingsPost = {
        settingKey: this.organizationSettingsFormGroup.controls['settingKey'].value,
        hierarchyId: this.organizationSettingsFormGroup.controls['organizationHierarchyId'].value,
        hierarchyLevel: this.organizationSettingsFormGroup.controls['organizationHierarchy'].value,
        value: dynamicValue
      }

      console.log(setting);  // TODO: remove after override functionality implementation
      //this.store.dispatch(new SaveOrganizationSettings(setting, this.fakeOrganizationId));  // TODO: uncomment after override functionality implementation
      this.store.dispatch(new ShowSideDialog(false));
      this.removeActiveCssClass();
      this.clearFormDetails();
    }
  }

  onRegionChange(event: any): void {
    if (event.itemData && event.itemData.id) {
      this.regionChanged$.next(event.itemData.id);
    }
  }

  onLocationChange(event: any): void {
    if (event.itemData && event.itemData.id) {
      this.locationChanged$.next(event.itemData.id);
    }
  }

  onDepartmentChange(event: any): void {
    if (event.itemData && event.itemData.departmentId) {
      this.departmentChanged$.next(event.itemData.departmentId);
    }
  }

  mapGridData(): void {
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

  rowDataBound(args: any): void {
    // hides expand button if no children
    if(args.data.children.length === 0) {
      args.row.querySelector('td').innerHTML = ' ';
      args.row.querySelector('td').className = 'e-customized-expand-cell';
    }
  }

  onRowsDropDownChanged(): void {
    this.grid.pageSettings.pageSize = this.pageSizePager = this.getActiveRowsPerPage();
  }

  onGoToClick(event: any): void {
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
          validators.push(Validators.email);
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
    this.locationChanged$.next(this.invalidId);
    this.departmentChanged$.next(this.invalidId);

    if (this.formControlType === OrganizationSettingControlType.Multiselect
      || this.formControlType === OrganizationSettingControlType.Select) {
      this.dropdownDataSource = data.valueOptions;
    }

    this.organizationSettingsFormGroup.setValue({
      settingKey: data.settingKey,
      organizationHierarchyId: this.organizationHierarchyId,
      organizationHierarchy: this.organizationHierarchy,
      controlType: data.controlType,
      name: data.name,
      value: null
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

    if (this.formControlType === OrganizationSettingControlType.Multiselect
      || this.formControlType === OrganizationSettingControlType.Select) {
      this.dropdownDataSource = data.valueOptions;
      dynamicValue = isParent ? this.getDropDownOptionIds(data.value) : this.getDropDownOptionIds(data.children[0].value);
    }

    // TODO: need details from BE regarding parent edit with saved region, location, department
    this.organizationSettingsFormGroup.setValue({
      settingKey: data.settingKey,
      organizationHierarchyId: this.organizationHierarchyId,
      organizationHierarchy: this.organizationHierarchy,
      controlType: data.controlType,
      name: data.name,
      value: dynamicValue
    });
  }

  private subscribeToRegionLocationDepartment(): void {
    this.locations$.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      if (this.childRecord && this.childRecord.locationId) {
        this.locationChanged$.next(this.childRecord.locationId);
      }
    });

    this.departments$.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      if (this.childRecord && this.childRecord.departmentId) {
        this.departmentChanged$.next(this.childRecord.departmentId);
      }
    });

    this.regions$.pipe(takeUntil(this.unsubscribe$)).subscribe(region => {
      if (region[0] && region[0].id) {
        this.initialRegionId = region[0].id;
        this.regionChanged$.next(region[0].id);
      }
    });
  }

  private setHierarchyLevelAndPreSelectedValue(): void {
    // gets locations by selected region and change hierarchy level
    this.regionChanged$.pipe(takeUntil(this.unsubscribe$)).subscribe(regionId => {
      if (regionId && regionId !== this.invalidId) {
        this.store.dispatch(new GetLocationsByRegionId(regionId));
        this.organizationHierarchy = OrganizationHierarchy.Region;
        this.organizationHierarchyId = regionId;
        this.selectedRegion = regionId;
      } else {
        this.selectedRegion = null;
      }
    });

    // gets departments by selected location and change hierarchy level
    this.locationChanged$.pipe(takeUntil(this.unsubscribe$)).subscribe(locationId => {
      if (locationId && locationId !== this.invalidId) {
        this.store.dispatch(new GetDepartmentsByLocationId(locationId));
        this.organizationHierarchy = OrganizationHierarchy.Location;
        this.organizationHierarchyId = locationId;
        this.selectedLocation = locationId
      } else {
        this.selectedLocation = null;
      }
    });

    // change hierarchy level if department was selected
    this.departmentChanged$.pipe(takeUntil(this.unsubscribe$)).subscribe(departmentId => {
      if (departmentId && departmentId !== this.invalidId) {
        this.organizationHierarchy = OrganizationHierarchy.Department;
        this.organizationHierarchyId = departmentId;
        this.selectedDepartment = departmentId
      } else {
        this.selectedDepartment = null;
      }
    });
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
    data.forEach((item: OrganizationSettingsDropDownOption) => {
      ids.push(item.value);
    });
    return ids;
  }

  private clearFormDetails(): void {
    this.organizationSettingsFormGroup.reset();
    this.isEdit = false;
    this.dropdownDataSource = [];
    this.regionChanged$.next(this.invalidId);
    this.locationChanged$.next(this.invalidId);
    this.departmentChanged$.next(this.invalidId);
  }

  private createSettingsForm(): void {
    this.organizationSettingsFormGroup = this.formBuilder.group({
      settingKey: [null],
      organizationHierarchyId: [null],
      organizationHierarchy: [null],
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
}
