import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { filter, Observable, takeUntil } from 'rxjs';

import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { FilteredItem } from '@shared/models/filter.model';
import { OrganizationLocation, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { FilterService } from '@shared/services/filter.service';
import { DashboardFiltersModel } from 'src/app/dashboard/models/dashboard-filters.model';
import { IFilterColumnsDataModel } from 'src/app/dashboard/models/widget-filter.model';
import { SetFilteredItems } from 'src/app/dashboard/store/dashboard.actions';
import { ShowFilterDialog } from 'src/app/store/app.actions';
import { UserState, UserStateModel } from 'src/app/store/user.state';
import { Organisation } from '@shared/models/visibility-settings.model';
import { SecurityState } from 'src/app/security/store/security.state';
import { FilterColumnTypeEnum } from 'src/app/dashboard/enums/dashboard-filter-fields.enum';
import { AllOrganizationsSkill } from 'src/app/dashboard/models/all-organization-skill.model';


@Component({
  selector: 'app-widget-filter',
  templateUrl: './widget-filter.component.html',
  styleUrls: ['./widget-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class WidgetFilterComponent extends DestroyableDirective implements OnInit, OnChanges {
  @Input() public allOrganizations: Organisation[];
  @Input() public userIsAdmin: boolean;
  @Input() public savedFilterItems: FilteredItem[];
  @Input() public dashboardFilterState: DashboardFiltersModel;
  @Input() public organizationStructure: OrganizationStructure;
  @Input() public allSkills: AllOrganizationsSkill[];

  @Select(UserState.organizationStructure) private readonly organizationStructure$: Observable<OrganizationStructure>;

  @Select(SecurityState.organisations) public readonly allOrganizations$: Observable<UserStateModel['organizations']>;

  public filteredItems: FilteredItem[] = [];
  public widgetFilterFormGroup: FormGroup;
  public filters: DashboardFiltersModel = {} as DashboardFiltersModel;
  public filterColumns: IFilterColumnsDataModel = {} as IFilterColumnsDataModel;
  public regions: OrganizationRegion[] = [];
  public optionFields = {
    text: 'name',
    value: 'id',
  };
  public skillsFields = {
    text: 'skillDescription',
    value: 'id',
  };
  public orgsFields = {
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
    changes['savedFilterItems'] && this.getFilterState();
    changes['allSkills'] && this.onSkillDataLoadHandler();
    changes['organizationStructure'] && this.onOrganizationStructureDataLoadHandler();
    changes['userIsAdmin'] && this.setupAdminFilter();
    changes['allOrganizations'] && this.onAllOrganizationsDataLoadHandler();
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
        this.getFilterState();
        this.onOrganizationStructureDataLoadHandler();
        this.onFilterControlValueChangedHandler();
        this.onSkillDataLoadHandler();
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
    this.widgetFilterFormGroup.get(FilterColumnTypeEnum.ORGANIZATION)?.valueChanges.subscribe((val: number[]) => {
      this.cdr.markForCheck();
      if(val?.length) {
        const selectedOrganizations: Organisation[] = val.map((id) => this.allOrganizations.find((org) => org.organizationId === id) as Organisation);
      
        this.filterColumns.regionIds.dataSource = [];
        selectedOrganizations.forEach((organization: Organisation) => {
          organization.regions?.forEach((region: OrganizationRegion) => (region.orgName = organization.name));
          this.filterColumns.regionIds.dataSource.push(...(organization.regions as []));
        })
      } else {
        this.filterColumns.regionIds.dataSource = [];
        this.widgetFilterFormGroup.get(FilterColumnTypeEnum.REGION)?.setValue([]);
        this.filteredItems = this.filterService.generateChips(this.widgetFilterFormGroup, this.filterColumns);
      }
    })
  }
  }

  public onFilterControlValueChangedHandler(): void {
    this.subscribeToOrganizationChanges();

    this.widgetFilterFormGroup.get(FilterColumnTypeEnum.REGION)?.valueChanges.subscribe((val: number[]) => {
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

    this.widgetFilterFormGroup.get(FilterColumnTypeEnum.LOCATION)?.valueChanges.subscribe((val: number[]) => {
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

    this.widgetFilterFormGroup.get(FilterColumnTypeEnum.DEPARTMENT)?.valueChanges.subscribe(() => this.cdr.markForCheck());

    this.widgetFilterFormGroup.get(FilterColumnTypeEnum.SKILL)?.valueChanges.subscribe(() => this.cdr.markForCheck());
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
    if(this.allSkills) {
      this.filterColumns.skillIds.dataSource = this.allSkills;
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
    const formControls = Object.entries(this.widgetFilterFormGroup.controls);
    formControls.forEach(([field, control]) => control.setValue(this.filters[field as keyof DashboardFiltersModel] || []));
  }

  public setFilterState(): void {
    if (this.userIsAdmin) {
      this.allOrganizations$
        .pipe(takeUntil(this.destroy$), filter(Boolean))
        .subscribe(() => this.setFormControlValue());
    } else {
      this.organizationStructure$
        .pipe(takeUntil(this.destroy$), filter(Boolean))
        .subscribe(() => this.setFormControlValue());
    }
  }
}
