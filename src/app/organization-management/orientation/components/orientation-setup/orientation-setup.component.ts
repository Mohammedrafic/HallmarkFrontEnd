import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TakeUntilDestroy } from '@core/decorators';
import { Select, Store } from '@ngxs/store';
import { OrientationTab, OrientationTypeDataSource } from '@organization-management/orientation/enums/orientation-type.enum';
import {
  OrientationConfiguration,
  OrientationConfigurationFilters,
  OrientationConfigurationPage } from '@organization-management/orientation/models/orientation.model';
import { OrientationService } from '@organization-management/orientation/services/orientation.service';
import { DialogMode } from '@shared/enums/dialog-mode.enum';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import {
  OrganizationDepartment,
  OrganizationLocation, OrganizationRegion,
  OrganizationStructure } from '@shared/models/organization.model';
import { FieldSettingsModel, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { debounceTime, distinctUntilChanged, filter, Observable, take, takeUntil } from 'rxjs';
import { ShowSideDialog, ShowToast } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import { Query } from "@syncfusion/ej2-data";
import { DateTimeHelper, findSelectedItems } from '@core/helpers';
import { mapperSelectedItems } from '@shared/components/tiers-dialog/helper';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { SkillCategoriesPage } from '@shared/models/skill-category.model';
import { ClearAssignedSkillsByOrganization,
  GetAllSkillsCategories,
  GetAssignedSkillsByOrganization } from '@organization-management/store/organization-management.actions';
import { Skill } from '@shared/models/skill.model';
import { SystemType } from '@shared/enums/system-type.enum';
import { MessageTypes } from '@shared/enums/message-types';
import { getAllErrors } from '@shared/utils/error.utils';
import { CANCEL_CONFIRM_TEXT,
  DELETE_CONFIRM_TITLE,
  ORIENTATION_CHANGE_CONFIRM_TITLE,
  ORIENTATION_CHANGE_TEXT,
  RECORD_ADDED, RECORD_DELETE,
  RECORD_MODIFIED } from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';
import { OrientationType } from "../../enums/orientation-type.enum";
import { OrientationGridComponent } from '../orientation-grid/orientation-grid.component';
import { getIRPOrgItems } from '@core/helpers/org-structure.helper';

@Component({
  selector: 'app-orientation-setup',
  templateUrl: './orientation-setup.component.html',
  styleUrls: ['./orientation-setup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@TakeUntilDestroy
export class OrientationSetupComponent extends AbstractPermissionGrid implements OnInit {
  @ViewChild('orientationGrid') private orientationGrid: OrientationGridComponent;

  @Input('isActive') set isActive(value: boolean) {
    if (value) {
      this.filters = { pageNumber: 1, pageSize: this.pageSize };
      this.initSetupTab();
    }
    this.isTabActive = value;
  }
  public isTabActive: boolean;

  public orientationTypeSettingsForm: FormGroup = new FormGroup({
    isEnabled: new FormControl(false),
    type: new FormControl(null, [Validators.required]),
  });
  public optionFields: FieldSettingsModel = { text: 'name', value: 'id' };
  public fields: FieldSettingsModel = { text: 'text', value: 'id' };
  public title: DialogMode;
  public isEdit = false;
  public isArchive = false;
  public orientationTypeDataSource = OrientationTypeDataSource;
  public selectedOrientationSettings: OrientationType | null;
  public regionToggleDisable = false;
  public locationToggleDisable = false;
  public departmentToggleDisable = false;
  public disableControls =  false;

  public switcherValue = 'Off';
  public settingIsOff = true;
  public dataSource: OrientationConfigurationPage;
  public filters: OrientationConfigurationFilters = { pageNumber: 1, pageSize: this.pageSize };
  public orientationForm: FormGroup = this.orientationService.generateConfigurationSetupForm();
  public archiveForm: FormGroup = new FormGroup({});

  public allRecords = {
    'regionIds': false,
    'locationIds': false,
    'departmentIds': false,
  };
  public regions: OrganizationRegion[] = [];
  public locations: OrganizationLocation[] = [];
  public locationsDataSource: OrganizationLocation[] = [];
  public departmentsDataSource: OrganizationDepartment[] = [];
  public maxDepartmentsLength = 1000;
  public query: Query = new Query().take(this.maxDepartmentsLength);

  public readonly orientationTab = OrientationTab;

  protected componentDestroy: () => Observable<unknown>;
  public filterType: string = 'Contains';

  @Select(UserState.lastSelectedOrganizationId)
  public readonly organizationId$: Observable<number>;

  @Select(UserState.organizationStructure)
  public readonly organizationStructure$: Observable<OrganizationStructure>;

  @Select(OrganizationManagementState.allSkillsCategories)
  public readonly allSkillsCategories$: Observable<SkillCategoriesPage | null>;

  @Select(OrganizationManagementState.assignedSkillsByOrganization)
  public readonly skills$: Observable<Skill[]>;

  constructor(
    protected override store: Store,
    private cd: ChangeDetectorRef,
    private orientationService: OrientationService,
    private confirmService: ConfirmService,
  ) {
    super(store);
    this.subscribeOnFormChange();
    this.dropdownHandler();
    this.watchForOrgChange();
    this.watchForOrgStructure();
    this.watchForRegions();
    this.watchForLocation();
    this.watchForSkillCategory();
  }

  private getSkills(): void {
    this.store.dispatch([new GetAllSkillsCategories({ params: { SystemType: SystemType.IRP } })]);
  }

  private initSetupTab(): void {
    this.getSkills();
    this.getOrientationSettings();
    this.getOrientationConfigs();
  }

  private watchForOrgChange(): void {
    this.organizationId$
      .pipe(
        filter(() => this.isTabActive),
        takeUntil(this.componentDestroy()),
      ).subscribe(() => {
        this.initSetupTab();
      });
  }

  private watchForOrgStructure(): void {
    this.organizationStructure$
      .pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy()),
      )
      .subscribe((structure: OrganizationStructure) => {
        this.regions = structure.regions;
      });
  }

  private watchForRegions(): void {
    this.orientationForm?.get('regionIds')?.valueChanges
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.componentDestroy())
      )
      .subscribe((value: number[]) => {
        this.orientationForm?.get('departmentIds')?.setValue([]);
        this.orientationForm?.get('locationIds')?.setValue([]);
        if (value?.length) {
          const selectedRegions: OrganizationRegion[] = findSelectedItems(value, this.regions);
          const selectedLocation: OrganizationLocation[] = mapperSelectedItems(selectedRegions, 'locations');
          this.locations = sortByField(selectedLocation, 'name');
          this.locationsDataSource = getIRPOrgItems(this.locations);
        } else {
          this.locationsDataSource = [];
          this.departmentsDataSource = [];
        }
        this.cd.markForCheck();
      });
  }

  private watchForLocation(): void {
    this.orientationForm?.get('locationIds')?.valueChanges
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.componentDestroy())
      )
      .subscribe((value: number[]) => {
        this.orientationForm?.get('departmentIds')?.setValue([]);
        if (value?.length) {
          const selectedLocation: OrganizationLocation[] = findSelectedItems(value, this.locations);
          const selectedDepartment: OrganizationDepartment[] = mapperSelectedItems(selectedLocation, 'departments');
          this.departmentsDataSource = sortByField(getIRPOrgItems(selectedDepartment), 'name');
        } else {
          this.departmentsDataSource = [];
        }
        this.cd.markForCheck();
      });
  }

  private watchForSkillCategory(): void {
    this.orientationForm?.get('skillCategory')?.valueChanges
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.componentDestroy())
      )
      .subscribe((value: number[]) => {
        this.orientationForm?.get('skillIds')?.setValue([]);
        if (value?.length) {
          this.store.dispatch(
            new GetAssignedSkillsByOrganization({ params: { SystemType: SystemType.IRP, SkillCategoryIds: value } })
          );
        }
      });
  }

  private getOrientationConfigs(): void {
    this.orientationService.getOrientationConfigs(this.filters).pipe(
      takeUntil(this.componentDestroy()),
    ).subscribe(data => {
      this.dataSource = data;
      this.cd.markForCheck();
    });
  }

  private setGRidControlsState(): void {
    this.disableControls = (this.settingIsOff || this.selectedOrientationSettings === null);
    this.cd.detectChanges();
  }

  private getOrientationSettings(): void {
    this.orientationService.getOrientationSetting().pipe(
      takeUntil(this.componentDestroy()),
    ).subscribe(setting => {
      if (setting) {
        this.settingIsOff = !setting.isEnabled;
        this.orientationService.setSettingState(this.settingIsOff);
        this.selectedOrientationSettings = setting.type;
        this.orientationTypeHandler(this.selectedOrientationSettings);
        this.orientationTypeSettingsForm.patchValue(setting);
      } else {
        this.selectedOrientationSettings = null;
        this.orientationTypeSettingsForm.reset();
      }
      if (!this.userPermission[this.userPermissions.CanEditOrientation]) {
        this.orientationTypeSettingsForm.disable({ emitEvent: false });
      }
      this.setGRidControlsState();
    });
  }

  private saveOrientationSettings(): void {
    const { isEnabled, type } = this.orientationTypeSettingsForm.getRawValue();
    this.orientationService.saveOrientationSetting({ isEnabled, type }).pipe(
      takeUntil(this.componentDestroy()),
    ).subscribe(() => {
      this.orientationTypeSettingsForm.markAsPristine();
      this.selectedOrientationSettings = type;
      this.orientationGrid.filtersForm.reset();
      this.orientationService.setSettingState(this.settingIsOff);
      this.setGRidControlsState();
      this.orientationTypeHandler(this.selectedOrientationSettings);
      this.getOrientationConfigs();
      this.cd.markForCheck();
    });
  }

  private dropdownHandler(): void {
    if (this.settingIsOff) {
      this.orientationTypeSettingsForm.controls['type'].disable();
    } else {
      this.orientationTypeSettingsForm.controls['type'].enable();
    }
  }

  private closeHandler(): void {
    this.store.dispatch(new ClearAssignedSkillsByOrganization());
    this.orientationForm.reset();
    this.allRecordsChange({ checked: false }, 'regionIds');
    this.allRecordsChange({ checked: false }, 'locationIds');
    this.allRecordsChange({ checked: false }, 'departmentIds');
    this.store.dispatch(new ShowSideDialog(false));
  }

  public deleteRecord(data: OrientationConfiguration): void {
    this.orientationService.removeOrientationConfiguration(data).pipe(
      takeUntil(this.componentDestroy()),
    ).subscribe({
      next: () => {
        this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_DELETE));
        this.getOrientationConfigs();
      },
      error: (error) => this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error))),
    });
  }

  public orientationTypeHandler(type: OrientationType | null): void {
    if (type === OrientationType.Organization) {
      this.orientationForm.controls['regionIds'].disable();
      this.orientationForm.controls['locationIds'].disable();
      this.orientationForm.controls['departmentIds'].disable();
      this.allRecords.regionIds = this.regionToggleDisable = true;
      this.allRecords.locationIds = this.locationToggleDisable = true;
      this.allRecords.departmentIds = this.departmentToggleDisable = true;
    }
    if (type === OrientationType.Region) {
      this.orientationForm.controls['regionIds'].enable();
      this.orientationForm.controls['locationIds'].disable();
      this.orientationForm.controls['departmentIds'].disable();
      this.allRecords.regionIds = this.regionToggleDisable = false;
      this.allRecords.locationIds = this.locationToggleDisable = true;
      this.allRecords.departmentIds = this.departmentToggleDisable = true;
    }
    if (type === OrientationType.Location) {
      this.orientationForm.controls['regionIds'].enable();
      this.orientationForm.controls['locationIds'].enable();
      this.orientationForm.controls['departmentIds'].disable();
      this.allRecords.regionIds = this.regionToggleDisable = false;
      this.allRecords.locationIds = this.locationToggleDisable = false;
      this.allRecords.departmentIds = this.departmentToggleDisable = true;
    }
    if (type === OrientationType.Department) {
      this.orientationForm.controls['regionIds'].enable();
      this.orientationForm.controls['locationIds'].enable();
      this.orientationForm.controls['departmentIds'].enable();
      this.allRecords.regionIds = this.regionToggleDisable = false;
      this.allRecords.locationIds = this.locationToggleDisable = false;
      this.allRecords.departmentIds = this.departmentToggleDisable = false;
    }
    this.allRegionsChange({ checked: this.allRecords.regionIds });
    this.allLocationsChange({ checked: this.allRecords.locationIds });
    this.allDepartmentsChange({ checked: this.allRecords.departmentIds }, false);
  }

  public saveRecord(): void {
    if (this.orientationForm.invalid) {
      this.orientationForm.markAllAsTouched();
    } else {
      const data = this.orientationForm.getRawValue();
      data.startDate = DateTimeHelper.setInitHours(DateTimeHelper.setUtcTimeZone(data.startDate));
      data.endDate = data.endDate ? DateTimeHelper.setInitHours(DateTimeHelper.setUtcTimeZone(data.endDate)) : data.endDate;
      this.orientationService.saveOrientationConfiguration(data).pipe(
        takeUntil(this.componentDestroy()),
      ).subscribe({
        next: () => {
          this.store.dispatch(
            new ShowToast(MessageTypes.Success, data.orientationConfigurationId ? RECORD_MODIFIED : RECORD_ADDED)
            );
          this.closeHandler();
          this.getOrientationConfigs();
        },
        error: (error) => this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error))),
      });
    }
  }

  public pageChange(data: OrientationConfigurationFilters): void {
    this.filters = data;
    this.getOrientationConfigs();
  }

  private populateForm(data: OrientationConfiguration): void {
    this.orientationTypeHandler(this.selectedOrientationSettings);
    this.allRecords.regionIds = !data.regions.length;
    this.allRecords.locationIds = !data.locations.length;
    this.allRecords.departmentIds = !data.departments.length;
    this.allRegionsChange({ checked: this.allRecords.regionIds });
    this.allLocationsChange({ checked: this.allRecords.locationIds });
    this.allDepartmentsChange({ checked: this.allRecords.departmentIds }, false);
    this.orientationForm.patchValue({
      orientationConfigurationId: data.id,
      regionIds: this.allRecords.regionIds ? null : data.regions.map(v => v.id),
      locationIds: this.allRecords.locationIds ? null : data.locations.map(v => v.id),
      departmentIds: this.allRecords.departmentIds ? null : data.departments.map(v => v.departmentId),
      skillIds: data.orientationConfigurationSkills.map(v => v.skillId),
      completedOrientation: data.completedOrientation,
      removeOrientation: data.removeOrientation,
      startDate: DateTimeHelper.setCurrentTimeZone(data.startDate.toString()),
      endDate: data.endDate ? DateTimeHelper.setCurrentTimeZone(data.endDate.toString()) : null,
    });
    this.cd.markForCheck();
  }

  public openDialog(event: {
    isBulk: boolean
    data: OrientationConfiguration
  }): void {
    if (event?.data) {
      this.title = DialogMode.Edit;
      this.isEdit = true;
      this.orientationForm.patchValue({
        skillCategory: event.data.skillCategories.map(v => v.id),
      });
      this.skills$
      .pipe(
        filter(((v) => !!v.length)),
        take(1),
        debounceTime(500)
      )
      .subscribe(() => {
        this.populateForm(event.data);
      });
    } else {
      this.title = DialogMode.Add;
      this.isEdit = false;
      this.orientationTypeHandler(this.selectedOrientationSettings);
    }
    this.store.dispatch(new ShowSideDialog(true));
  }

  public closeDialog(): void {
    if (this.orientationForm.dirty) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(
          filter((confirm: boolean) => !!confirm),
          take(1)
        ).subscribe(() => {
          this.closeHandler();
        });
    } else {
      this.closeHandler();
    }
  }

  public subscribeOnFormChange(): void {
    this.orientationTypeSettingsForm.controls['isEnabled'].valueChanges
      .pipe(takeUntil(this.componentDestroy())).subscribe((val) => {
        this.switcherValue = val ? 'On' : 'Off';
        this.settingIsOff = !val;
        this.dropdownHandler();
        this.cd.markForCheck();
      });
    this.orientationTypeSettingsForm.controls['type'].valueChanges
      .pipe(takeUntil(this.componentDestroy())).subscribe(() => {
        this.cd.markForCheck();
      });
  }

  public saveOrientationSettingsHandler(): void {
    if (this.orientationTypeSettingsForm.invalid) {
      this.orientationTypeSettingsForm.markAllAsTouched();
    } else {
      if (this.selectedOrientationSettings !== null && this.orientationTypeSettingsForm.controls['type'].dirty) {
        this.confirmService
        .confirm(ORIENTATION_CHANGE_TEXT, {
          title: ORIENTATION_CHANGE_CONFIRM_TITLE,
          okButtonLabel: 'Yes',
          okButtonClass: 'delete-button',
        })
        .pipe(
          filter((confirm: boolean) => !!confirm),
          take(1)
        ).subscribe(() => {
          this.saveOrientationSettings();
        });
      } else {
        this.saveOrientationSettings();
      }
    }
  }

  public allRegionsChange(event: { checked: boolean }): void {
    this.allRecords['regionIds'] = event.checked;
    const regionsControl = this.orientationForm?.controls['regionIds'];
    if (this.allRecords['regionIds']) {
      regionsControl?.setValue(null);
      regionsControl?.disable();
      let locations: OrganizationLocation[] = [];
      this.regions.forEach((region: OrganizationRegion) => {
        const filteredLocation = region.locations || [];
        locations = [...locations, ...filteredLocation];
      });
      this.locations = sortByField(locations, 'name');
      this.locationsDataSource =  getIRPOrgItems(this.locations);
    } else {
      regionsControl?.enable();
    }
  }

  public allLocationsChange(event: { checked: boolean }): void {
    this.allRecords['locationIds'] = event.checked;
    const locationsControl = this.orientationForm?.controls['locationIds'];
    if (this.allRecords['locationIds']) {
      locationsControl?.setValue(null);
      locationsControl?.disable();
      let departments: OrganizationDepartment[] = [];
      const locations: OrganizationLocation[] = this.locationsDataSource;
      locations?.forEach((location: OrganizationLocation) => {
        const filteredDepartments = location.departments || [];
        departments = [...departments, ...filteredDepartments] as OrganizationDepartment[];
      });
      this.departmentsDataSource = getIRPOrgItems(departments);
    } else {
      locationsControl?.enable();
    }
  }

  public allDepartmentsChange(event: { checked: boolean }, emitEvent = true): void {
    this.allRecords['departmentIds'] = event.checked;
    const departmentsControl = this.orientationForm?.controls['departmentIds'];
    if (this.allRecords['departmentIds']) {
      departmentsControl?.setValue(null, {emitEvent: emitEvent});
      departmentsControl?.disable({emitEvent: false});
    } else {
      departmentsControl?.enable({emitEvent: false});
    }
  }

  public allRecordsChange(event: { checked: boolean }, field: string): void {
    field === 'regionIds' && this.allRegionsChange(event);
    field === 'locationIds' && this.allLocationsChange(event);
    field === 'departmentIds' && this.allDepartmentsChange(event);
  }

  public onDepartmentsFiltering(e: FilteringEventArgs): void {
    const char = e.text.length + 1;
    let query: Query = new Query();
    query =
      e.text !== ''
        ? query.where('name', 'contains', e.text, true).take(char * 15)
        : query;
        const departments = this.departmentsDataSource;
    e.updateData(departments as [], query);
  }
}
