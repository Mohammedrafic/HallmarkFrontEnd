import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { debounceTime, filter, Observable, takeUntil, throttleTime } from 'rxjs';

import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { FilteredItem } from '@shared/models/filter.model';
import { OrganizationLocation, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { FilterService } from '@shared/services/filter.service';
import { DashboardFiltersModel, FilterName } from 'src/app/dashboard/models/dashboard-filters.model';
import { IFilterColumnsDataModel } from 'src/app/dashboard/models/widget-filter.model';
import { SetFilteredItems } from 'src/app/dashboard/store/dashboard.actions';
import { ShowFilterDialog } from 'src/app/store/app.actions';
import { UserState, UserStateModel } from 'src/app/store/user.state';
import { Organisation } from '@shared/models/visibility-settings.model';
import { SecurityState } from 'src/app/security/store/security.state';
import { FilterColumnTypeEnum } from 'src/app/dashboard/enums/dashboard-filter-fields.enum';
import { AllOrganizationsSkill } from 'src/app/dashboard/models/all-organization-skill.model';
import { DeleteEventArgs } from '@syncfusion/ej2-angular-buttons';
import { isEqual } from 'lodash';


@Component({
  selector: 'app-widget-filter',
  templateUrl: './widget-filter.component.html',
  styleUrls: ['./widget-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class WidgetFilterComponent extends DestroyableDirective implements OnInit, OnChanges {
  @Input() public allOrganizations: Organisation[];
  @Input() public userIsAdmin: boolean;
  @Input() public isMobile: boolean;
  @Input() public savedFilterItems: FilteredItem[];
  @Input() public dashboardFilterState: DashboardFiltersModel;
  @Input() public organizationStructure: OrganizationStructure;
  @Input() public allSkills: AllOrganizationsSkill[];
  @Input() public orderedFilters: Record<FilterName, FilteredItem[]>;

  @Select(UserState.organizationStructure) private readonly organizationStructure$: Observable<OrganizationStructure>;

  @Select(SecurityState.organisations) public readonly allOrganizations$: Observable<UserStateModel['organizations']>;


  private filteredItems: FilteredItem[] = [];
  private filters: DashboardFiltersModel = {} as DashboardFiltersModel;
  private regions: OrganizationRegion[] = [];
  private sortedSkillsByOrgId: Record<string, AllOrganizationsSkill[]> = {};
  private commonSkillsIds: number[] = [];
  private filterIsApplied: boolean = false;

  public widgetFilterFormGroup: FormGroup;
  public filterColumns: IFilterColumnsDataModel = {} as IFilterColumnsDataModel;
  public orderedFilterChips: (string | FilteredItem)[][] = [];
  public readonly optionFields = {
    text: 'name',
    value: 'id',
  };
  public readonly skillsFields = {
    text: 'skillDescription',
    value: 'id',
  };
  public readonly orgsFields = {
    text: 'name',
    value: 'organizationId',
  };

  get selectedSkills(): number {
    return this.widgetFilterFormGroup.get(FilterColumnTypeEnum.SKILL)?.value?.length || 0;
  }

  get selectedOrganizations(): number {
    return this.widgetFilterFormGroup.get('organizationIds')?.value?.length || 0;
  }

  get selectedRegions(): number {
    return this.widgetFilterFormGroup.get(FilterColumnTypeEnum.REGION)?.value?.length || 0;
  }

  get selectedLocations(): number {
    return this.widgetFilterFormGroup.get(FilterColumnTypeEnum.LOCATION)?.value?.length || 0;
  }

  get selectedDepartments(): number {
    return this.widgetFilterFormGroup.get(FilterColumnTypeEnum.DEPARTMENT)?.value?.length || 0;
  }

  get commonSkills(): AllOrganizationsSkill[] {
    return this.sortedSkillsByOrgId['null'] || [];
  }

  constructor(
    private readonly store: Store,
    private readonly fb: FormBuilder,
    private readonly filterService: FilterService,
    private readonly cdr: ChangeDetectorRef,
    private readonly actions: Actions,
  ) {
    super();
    this.initForm();
    this.widgetFilterColumnsSetup();
  }

  public ngOnInit(): void {
    this.isFilterDialogOpened();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    changes['allSkills'] && this.onSkillDataLoadHandler();
    changes['organizationStructure'] && this.onOrganizationStructureDataLoadHandler();
    changes['userIsAdmin'] && this.setupAdminFilter();
    changes['allOrganizations'] && this.onAllOrganizationsDataLoadHandler();
    changes['orderedFilters'] && this.orderChipList(changes['orderedFilters']);
  }

  private setupAdminFilter(): void {
    if(this.userIsAdmin) {
      this.filterColumns[FilterColumnTypeEnum.ORGANIZATION] = {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'organizationId',
      }

      this.widgetFilterFormGroup = this.fb.group({
        organizationIds: new FormControl([]),
        ...this.widgetFilterFormGroup.controls
      });
    }
  }

  private isFilterDialogOpened() {
    this.actions
      .pipe(ofActionDispatched(ShowFilterDialog), filter((data) => data.isDialogShown), takeUntil(this.destroy$))
      .subscribe(() => {
        this.onSkillDataLoadHandler();
        this.onOrganizationStructureDataLoadHandler();
        this.onFilterControlValueChangedHandler();
        this.getFilterState();
        this.setFilterState();
      });
  }

  public onFilterDelete(event: FilteredItem): void {
    this.cdr.markForCheck();
    this.filterService.removeValue(event, this.widgetFilterFormGroup, this.filterColumns);
  }

  public onFilterClearAll(): void {
    this.widgetFilterFormGroup.reset();
    this.filters = this.widgetFilterFormGroup.getRawValue();
    this.filteredItems = [];
    this.saveFilteredItems(this.filteredItems);
  }

  public onFilterApply(): void {
    this.filters = this.widgetFilterFormGroup.getRawValue();
    this.filteredItems = this.filterService.generateChips(this.widgetFilterFormGroup, this.filterColumns);
    this.saveFilteredItems(this.filteredItems);
    this.filterIsApplied = true;
    this.store.dispatch(new ShowFilterDialog(false));
  }

  private saveFilteredItems(items: FilteredItem[]): void {
    this.store.dispatch(new SetFilteredItems(items));
  }

  private initForm(): void {
    this.widgetFilterFormGroup = this.fb.group({
      regionIds: new FormControl([]),
      locationIds: new FormControl([]),
      departmentsIds: new FormControl([]),
      skillIds: new FormControl([])
    });
  }

  private widgetFilterColumnsSetup(): void {
    Object.keys(this.widgetFilterFormGroup.controls).forEach((key) => {
      this.filterColumns[key as keyof IFilterColumnsDataModel] = {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: key === FilterColumnTypeEnum.SKILL ? 'skillDescription':'name',
        valueId: 'id',
      }
    })
  }

  private subscribeToOrganizationChanges(): void {
    if(this.userIsAdmin) {
    this.widgetFilterFormGroup.get(FilterColumnTypeEnum.ORGANIZATION)?.valueChanges.pipe(throttleTime(100)).subscribe((val: number[]) => {
      this.cdr.markForCheck();
      if(val?.length) {
        const selectedOrganizations: Organisation[] = val.map((id) => this.allOrganizations.find((org) => org.organizationId === id) as Organisation);
      
        this.filterColumns.regionIds.dataSource = [];
        this.filterColumns.skillIds.dataSource = [];
        const allOrganizationSkills: AllOrganizationsSkill[] = [];
        
        selectedOrganizations.forEach((organization: Organisation) => {
          this.sortedSkillsByOrgId[organization.organizationId] && allOrganizationSkills.push(...this.sortedSkillsByOrgId[organization.organizationId]);
          organization.regions?.forEach((region: OrganizationRegion) => (region.orgName = organization.name));
          this.filterColumns.regionIds.dataSource.push(...(organization.regions as []));
        })
        
        this.filterColumns.skillIds.dataSource.push(...this.commonSkills as [], ...allOrganizationSkills as [])
      } else {
        this.filterColumns.regionIds.dataSource = [];
        this.filterColumns.skillIds.dataSource = this.commonSkills;
        this.setCommonSkillsToFormControl();
        this.widgetFilterFormGroup.get(FilterColumnTypeEnum.REGION)?.setValue([]);
        this.filteredItems = this.filterService.generateChips(this.widgetFilterFormGroup, this.filterColumns)
      }
    })
  }
  }

  public onFilterControlValueChangedHandler(): void {
    this.subscribeToOrganizationChanges();

    this.widgetFilterFormGroup.get(FilterColumnTypeEnum.REGION)?.valueChanges.pipe(throttleTime(100)).subscribe((val: number[]) => {
      this.cdr.markForCheck();
      if (val?.length) {
        const selectedRegions: OrganizationRegion[] = val.map((id) => {
          return this.userIsAdmin
            ? (this.filterColumns.regionIds.dataSource as any[]).find((region: OrganizationLocation) => region.id === id)
            : this.regions.find((region) => region.id === id) as OrganizationRegion;
        });

        this.filterColumns.locationIds.dataSource = [];
        selectedRegions.forEach((region: OrganizationRegion) => {
          region?.locations?.forEach((location: OrganizationLocation) => (location.regionName = region.name));
          this.filterColumns.locationIds.dataSource.push(...(region?.locations as []));
        });
      } else {
        this.filterColumns.locationIds.dataSource = [];
        this.widgetFilterFormGroup.get(FilterColumnTypeEnum.LOCATION)?.setValue([]);
        this.filteredItems = this.filterService.generateChips(this.widgetFilterFormGroup, this.filterColumns);
      }
    });

    this.widgetFilterFormGroup.get(FilterColumnTypeEnum.LOCATION)?.valueChanges.pipe(throttleTime(100)).subscribe((val: number[]) => {
      this.cdr.markForCheck();
      if (val?.length) {
        const selectedLocations: OrganizationLocation[] = val.map((id) => (this.filterColumns.locationIds.dataSource as any[]).find((location: OrganizationLocation) => location.id === id));
       
        this.filterColumns.departmentsIds.dataSource = [];
        selectedLocations.forEach((location: OrganizationLocation) => {
          this.filterColumns.departmentsIds.dataSource.push(...(location?.departments as []));
        });
      } else {
        this.filterColumns.departmentsIds.dataSource = [];
        this.widgetFilterFormGroup.get(FilterColumnTypeEnum.DEPARTMENT)?.setValue([]);
        this.filteredItems = this.filterService.generateChips(this.widgetFilterFormGroup, this.filterColumns);
      }
    });

    this.widgetFilterFormGroup.get(FilterColumnTypeEnum.DEPARTMENT)?.valueChanges.pipe(throttleTime(100)).subscribe(() => this.cdr.markForCheck());

    this.widgetFilterFormGroup.get(FilterColumnTypeEnum.SKILL)?.valueChanges.pipe(throttleTime(100)).subscribe(() => this.cdr.markForCheck());
  }

  private setCommonSkillsToFormControl(): void {
    const selectedSkills = this.widgetFilterFormGroup.get(FilterColumnTypeEnum.SKILL)?.value;
    if(selectedSkills?.length) {
      const commonSkills = selectedSkills.filter((value: number) => this.commonSkillsIds.includes(value));
      this.widgetFilterFormGroup.get(FilterColumnTypeEnum.SKILL)?.setValue([...commonSkills]);
    }
  }

  private onOrganizationStructureDataLoadHandler(): void {
    if(this.organizationStructure && !this.userIsAdmin) {
        this.cdr.markForCheck();
        this.regions = this.organizationStructure.regions;
        this.filterColumns.regionIds.dataSource = this.regions;
    }
  }

  private onAllOrganizationsDataLoadHandler(): void {
    if(this.allOrganizations && this.filterColumns.organizationIds) {
      this.filterColumns.organizationIds.dataSource = this.allOrganizations;
    }
  }

  private onSkillDataLoadHandler(): void {
    if (this.allSkills) {
      let skills;
      this.sortedSkillsByOrgId = {};
      this.commonSkillsIds = [];
      if (this.userIsAdmin) {
        this.allSkills.forEach((skill) => {
          if (skill.businessUnitId === null) {
            this.commonSkillsIds.push(skill.id);
          }
          if (skill.businessUnitId in this.sortedSkillsByOrgId) {
            this.sortedSkillsByOrgId[skill.businessUnitId].push(skill);
          } else {
            this.sortedSkillsByOrgId[skill.businessUnitId] = [skill];
          }
        });
        skills = this.commonSkills;
      } else {
        skills = this.allSkills;
      }
      this.filterColumns.skillIds.dataSource = skills;
    }
  }

  private getFilterState(): void {
        this.cdr.markForCheck();
        this.filters = {} as DashboardFiltersModel; 
        this.savedFilterItems.forEach((item: FilteredItem) => {
          const filterKey = item.column as keyof DashboardFiltersModel;
          if (filterKey in this.filters) {
            this.filters[filterKey].push(item.value);
          } else {
            this.filters[filterKey] = [item.value];
          }
        });
  }

  private setFormControlValue(): void {
    this.cdr.markForCheck();
    const formControls = Object.entries(this.widgetFilterFormGroup.controls);
    formControls.forEach(([field, control]) => {
      const value = this.filters[field as keyof DashboardFiltersModel];
      if (value) {
        control.setValue(value);
      } else {
        control.reset(null, { emitEvent: false });
      }
    });
  }

  public setFilterState(): void {
    if (this.userIsAdmin) {
      this.allOrganizations$
        .pipe(takeUntil(this.destroy$), filter(Boolean), debounceTime(300))
        .subscribe(() => this.setFormControlValue());
    } else {
      this.organizationStructure$
        .pipe(takeUntil(this.destroy$), filter(Boolean), debounceTime(300))
        .subscribe(() => this.setFormControlValue());
    }
  }

  private orderChipList(change: SimpleChange): void {
    if(isEqual(change.currentValue, change.previousValue)) return;
    this.orderedFilterChips = Object.entries(this.orderedFilters).map((item) => item.flat()); 
  }

  public deleteChip(event: DeleteEventArgs): void {
    const filteredItem = event.data as FilteredItem;
    this.filterService.removeValue(filteredItem, this.widgetFilterFormGroup, this.filterColumns);
    this.widgetFilterFormGroup.valueChanges.pipe(takeUntil(this.destroy$), debounceTime(300)).subscribe(() => {
      this.filteredItems = this.filterService.generateChips(this.widgetFilterFormGroup, this.filterColumns);
      this.saveFilteredItems(this.filteredItems);
    });
  }

  public onFilterClose(): void {
    if(this.filterIsApplied) {
      this.filterIsApplied = false;
      return;
    }
    this.widgetFilterFormGroup.setValue({
      ...(this.userIsAdmin && { organizationIds: this.filters.organizationIds || [] }),
      regionIds: this.filters.regionIds || [],
      locationIds: this.filters.locationIds || [],
      departmentsIds: this.filters.departmentsIds || [],
      skillIds: this.filters.skillIds || [],
    });  
  }
}
