import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Select, Store } from '@ngxs/store';
import { filter, Observable, takeUntil } from 'rxjs';
import { map } from 'rxjs/operators';

import { GetAssignedSkillsByOrganization } from '@organization-management/store/organization-management.actions';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { optionFields } from '@shared/constants';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { SystemType } from '@shared/enums/system-type.enum';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { FilteredItem } from '@shared/models/filter.model';
import {
  OrganizationDepartment,
  OrganizationLocation,
  OrganizationRegion,
  OrganizationStructure,
} from '@shared/models/organization.model';
import { Skill } from '@shared/models/skill.model';
import { FilterService } from '@shared/services/filter.service';
import { ShowFilterDialog } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import { ScheduleFilters, ScheduleFiltersData } from '../../interface';
import { ScheduleFiltersColumns, SkillsFieldsOptions } from '../../constants';
import { ScheduleFiltersService } from '../../services';
import { OrganizationStructureService } from '@shared/services';

@Component({
  selector: 'app-schedule-filters',
  templateUrl: './schedule-filters.component.html',
  styleUrls: ['./schedule-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleFiltersComponent extends DestroyableDirective implements OnInit {
  @Input() public count: number;

  @Output() public updateScheduleFilter: EventEmitter<ScheduleFiltersData> = new EventEmitter<ScheduleFiltersData>();

  @Select(UserState.organizationStructure)
  private readonly organizationStructure$: Observable<OrganizationStructure>;

  @Select(OrganizationManagementState.assignedSkillsByOrganization)
  private readonly skills$: Observable<Skill[]>;

  public filteredItems: FilteredItem[] = [];
  public readonly scheduleFilterFormGroup = this.scheduleFiltersService.createScheduleFilterForm();
  public readonly filterColumns = ScheduleFiltersColumns;
  public readonly optionFields = optionFields;
  public readonly skillsFields = SkillsFieldsOptions;

  private filters: ScheduleFilters = {} ;
  private regions: OrganizationRegion[] = [];
  private activeSystem: SystemType = SystemType.IRP;

  get selectedSkillsNumber(): number {
    return this.scheduleFilterFormGroup.get('skillIds')?.value?.length || 0;
  }

  get selectedRegionsNumber(): number {
    return this.scheduleFilterFormGroup.get('regionIds')?.value?.length || 0;
  }

  get selectedLocationsNumber(): number {
    return this.scheduleFilterFormGroup.get('locationIds')?.value?.length || 0;
  }

  get selectedDepartmentsNumber(): number {
    return this.scheduleFilterFormGroup.get('departmentsIds')?.value?.length || 0;
  }

  constructor(
    private store: Store,
    private filterService: FilterService,
    private cdr: ChangeDetectorRef,
    private scheduleFiltersService: ScheduleFiltersService,
    private organizationStructureService: OrganizationStructureService
  ) {
    super();
  }

  public ngOnInit(): void {
    this.watchForOrganizationStructure();
    this.watchForSkills();
    this.watchForControlsValueChanges();
  }

  public deleteFilter(event: FilteredItem): void {
    this.filterService.removeValue(event, this.scheduleFilterFormGroup, this.filterColumns);
    this.cdr.markForCheck();
  }

  public clearAllFilters(): void {
    this.scheduleFilterFormGroup.reset();
    this.filters = this.scheduleFilterFormGroup.getRawValue();
    this.filteredItems = [];
    this.updateScheduleFilter.emit({ filters: this.filters, filteredItems: this.filteredItems });
  }

  public applyFilter(): void {
    if (this.scheduleFilterFormGroup.valid) {
      this.filters = this.scheduleFilterFormGroup.getRawValue();
      this.filteredItems = this.filterService.generateChips(this.scheduleFilterFormGroup, this.filterColumns);
      this.updateScheduleFilter.emit({ filters: this.filters, filteredItems: this.filteredItems });
      this.store.dispatch(new ShowFilterDialog(false));
    } else {
      this.scheduleFilterFormGroup.markAllAsTouched();
    }
  }

  public closeFilterDialog(): void {
    this.scheduleFilterFormGroup.setValue({
      regionIds: this.filters.regionIds || [],
      locationIds: this.filters.locationIds || [],
      departmentsIds: this.filters.departmentsIds || [],
      skillIds: this.filters.skillIds || [],
    });
    this.scheduleFilterFormGroup.markAsUntouched();
  }

  private watchForOrganizationStructure(): void {
    this.organizationStructure$
      .pipe(
        filter(Boolean),
        map((structure: OrganizationStructure) =>
          this.organizationStructureService.getOrgStructureForIrp(structure.regions)
        ),
        takeUntil(this.destroy$),
      )
      .subscribe((structure: OrganizationRegion[]) => {
        if (this.filteredItems.length) {
          this.clearAllFilters();
        }

        this.store.dispatch(new GetAssignedSkillsByOrganization({ params: { SystemType: this.activeSystem } }));
        this.regions = structure;
        this.filterColumns.regionIds.dataSource = this.regions;
        this.cdr.markForCheck();
      });
  }

  private watchForSkills(): void {
    this.skills$
      .pipe(
        filter(Boolean),
        takeUntil(this.destroy$),
      )
      .subscribe((skills: Skill[]) => {
        this.filterColumns.skillIds.dataSource = skills;
        this.cdr.markForCheck();
      });
  }

  private watchForControlsValueChanges(): void {
    this.scheduleFilterFormGroup.get('regionIds')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((val: number[]) => {
        this.filterColumns.locationIds.dataSource = [];

        if (val?.length) {
          const regionLocations: OrganizationLocation[] = [];
          const selectedRegions: OrganizationRegion[] = val.map((id) => {
            return this.regions.find((region) => region.id === id) as OrganizationRegion;
          });

          this.filterColumns.locationIds.dataSource = [];
          selectedRegions.forEach((region: OrganizationRegion) => {
            region?.locations?.forEach((location: OrganizationLocation) => {
              location.regionName = region.name;
            });
            regionLocations.push(...(region?.locations as []));
          });
          this.filterColumns.locationIds.dataSource.push(...sortByField(regionLocations, 'name'));
        } else {
          this.scheduleFilterFormGroup.get('locationIds')?.setValue([]);
          this.filteredItems = this.filterService.generateChips(this.scheduleFilterFormGroup, this.filterColumns);
        }

        this.cdr.markForCheck();
      });

    this.scheduleFilterFormGroup.get('locationIds')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((val: number[]) => {
        this.filterColumns.departmentsIds.dataSource = [];

        if (val?.length) {
          const locationDepartments: OrganizationDepartment[] = [];
          const selectedLocations: OrganizationLocation[] = val.map((id) => {
            return (this.filterColumns.locationIds.dataSource as OrganizationLocation[])
              .find((location: OrganizationLocation) => location.id === id) as OrganizationLocation;
          });

          selectedLocations.forEach((location: OrganizationLocation) => {
            locationDepartments.push(...(location?.departments as []));
          });

          this.filterColumns.departmentsIds.dataSource.push(...sortByField(locationDepartments, 'name'));
        } else {
          this.scheduleFilterFormGroup.get('departmentsIds')?.setValue([]);
          this.filteredItems = this.filterService.generateChips(this.scheduleFilterFormGroup, this.filterColumns);
        }

        this.cdr.markForCheck();
      });

    this.scheduleFilterFormGroup.get('departmentsIds')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.cdr.markForCheck());

    this.scheduleFilterFormGroup.get('skillIds')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.cdr.markForCheck());
  }
}
