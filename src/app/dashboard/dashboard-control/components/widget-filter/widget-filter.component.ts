import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { Select, Store } from '@ngxs/store';

import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { FilteredItem } from '@shared/models/filter.model';
import { OrganizationLocation, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { Skill } from '@shared/models/skill.model';
import { FilterService } from '@shared/services/filter.service';
import { filter, Observable, takeUntil } from 'rxjs';
import { IFilterColumnsDataModel, WidgetFilter } from 'src/app/dashboard/models/widget-filter.model';
import { SetFilteredItems } from 'src/app/dashboard/store/dashboard.actions';
import { DashboardState } from 'src/app/dashboard/store/dashboard.state';
import { ShowFilterDialog } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';

@Component({
  selector: 'app-widget-filter',
  templateUrl: './widget-filter.component.html',
  styleUrls: ['./widget-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class WidgetFilterComponent extends DestroyableDirective implements OnInit {
  @Select(UserState.organizationStructure) private readonly organizationStructure$: Observable<OrganizationStructure>;
  @Select(DashboardState.filteredItems) public readonly filteredItems$: Observable<FilteredItem[]>;
  @Select(OrganizationManagementState.allOrganizationSkills) private readonly skills$: Observable<Skill[]>;

  public filteredItems: FilteredItem[] = [];
  public widgetFilterFormGroup: FormGroup;
  public filters: WidgetFilter = {};
  public filterColumns: IFilterColumnsDataModel;
  public regions: OrganizationRegion[] = [];
  public orgStructure: OrganizationStructure;
  public optionFields = {
    text: 'name',
    value: 'id',
  };
  public skillsFields = {
    text: 'skillDescription',
    value: 'id',
  };

  get skills() {
    return this.widgetFilterFormGroup.get('skillIds')?.value.length;
  }

  get region() {
    return this.widgetFilterFormGroup.get('regionIds')?.value.length;
  }

  get locations() {
    return this.widgetFilterFormGroup.get('locationIds')?.value.length;
  }

  get departments() {
    return this.widgetFilterFormGroup.get('depatmentIds')?.value.length;
  }

  constructor(
    private readonly store: Store,
    private readonly fb: FormBuilder,
    private readonly filterService: FilterService,
    private readonly cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.initForm();
    this.widgetFilterColumnsSetup();
    this.onOrganizationStructureDataLoadHandler();
    this.onOrderFilterControlValueChangedHandler();
    this.onSkillDataLoadHandler();
  }

  public onFilterDelete(event: FilteredItem): void {
    this.cdr.markForCheck();
    this.filterService.removeValue(event, this.widgetFilterFormGroup, this.filterColumns);
  }

  public onFilterClearAll(): void {
    this.widgetFilterFormGroup.reset();
    this.filters = {};
    this.saveFilteredItems(this.filteredItems);
  }

  public onFilterApply(): void {
    this.filters = this.widgetFilterFormGroup.getRawValue();
    this.filteredItems = this.filterService.generateChips(this.widgetFilterFormGroup, this.filterColumns);
    this.saveFilteredItems(this.filteredItems);
    this.store.dispatch(new ShowFilterDialog(false));
  }

  public onFilterClose(): void {
    this.widgetFilterFormGroup.setValue({
      regionIds: this.filters.regionIds || [],
      locationIds: this.filters.locationIds || [],
      departmentsIds: this.filters.departmentsIds || [],
      skillIds: this.filters.skillIds || [],
    });
  }

  private saveFilteredItems(items: FilteredItem[]): void {
    this.store.dispatch(new SetFilteredItems(items));
  }

  private initForm(): void {
    this.widgetFilterFormGroup = this.fb.group({
      regionIds: new FormControl([]),
      locationIds: new FormControl([]),
      departmentsIds: new FormControl([]),
      skillIds: new FormControl([]),
    });
  }

  private widgetFilterColumnsSetup(): void {
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
      departmentsIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      skillIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'skillDescription',
        valueId: 'id',
      },
    };
  }

  private onOrderFilterControlValueChangedHandler(): void {
    this.widgetFilterFormGroup.get('regionIds')?.valueChanges.subscribe((val: number[]) => {
      if (val?.length) {
        const selectedRegions: OrganizationRegion[] = [];
        val.forEach((id) =>
          selectedRegions.push(this.regions.find((region) => region.id === id) as OrganizationRegion)
        );
        this.filterColumns.locationIds.dataSource = [];
        selectedRegions.forEach((region) => {
          region.locations?.forEach((location: OrganizationLocation) => (location.regionName = region.name));
          this.filterColumns.locationIds.dataSource.push(...(region.locations as []));
        });
      } else {
        this.filterColumns.locationIds.dataSource = [];
        this.widgetFilterFormGroup.get('locationIds')?.setValue([]);
        this.filteredItems = this.filterService.generateChips(this.widgetFilterFormGroup, this.filterColumns);
      }
      this.saveFilteredItems(this.filteredItems);
    });

    this.widgetFilterFormGroup.get('locationIds')?.valueChanges.subscribe((val: number[]) => {
      if (val?.length) {
        const selectedLocations: OrganizationLocation[] = [];
        val.forEach((id) =>
          selectedLocations.push(
            this.filterColumns.locationIds.dataSource.find((location: OrganizationLocation) => location.id === id)
          )
        );
        this.filterColumns.departmentsIds.dataSource = [];
        selectedLocations.forEach((location: OrganizationLocation) => {
          this.filterColumns.departmentsIds.dataSource.push(...(location.departments as []));
        });
      } else {
        this.filterColumns.departmentsIds.dataSource = [];
        this.widgetFilterFormGroup.get('departmentsIds')?.setValue([]);
        this.filteredItems = this.filterService.generateChips(this.widgetFilterFormGroup, this.filterColumns);
      }
      this.saveFilteredItems(this.filteredItems);
    });
  }

  private onOrganizationStructureDataLoadHandler(): void {
    this.organizationStructure$
      .pipe(takeUntil(this.destroy$), filter(Boolean))
      .subscribe((structure: OrganizationStructure) => {
        this.cdr.markForCheck();
        this.orgStructure = structure;
        this.regions = structure.regions;
        this.filterColumns.regionIds.dataSource = this.regions;
      });
  }

  private onSkillDataLoadHandler(): void {
    this.skills$.pipe(takeUntil(this.destroy$)).subscribe((skills) => {
      if (skills && skills.length > 0) {
        this.filterColumns.skillIds.dataSource = skills;
      }
    });
  }
}
