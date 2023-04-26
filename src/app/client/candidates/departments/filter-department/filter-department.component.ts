import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';

import { Select } from '@ngxs/store';
import { BehaviorSubject, distinctUntilChanged, filter, Observable, takeUntil } from 'rxjs';

import {
  OrganizationDepartment,
  OrganizationLocation,
  OrganizationRegion,
  OrganizationStructure,
} from '@shared/models/organization.model';
import { UserState } from 'src/app/store/user.state';
import { ControlTypes } from '@shared/enums/control-types.enum';
import { FilteredItem } from '@shared/models/filter.model';
import { CustomFormGroup, DataSourceItem } from '@core/interface';
import { filterOptionFields, SkillFilterOptionFields } from '@core/constants/filters-helper.constant';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { DepartmentFormFieldConfig, DepartmentFiltersColumns, DepartmentFilterState } from '../departments.model';
import { FilterService } from '@shared/services/filter.service';
import { DepartmentFilterFormConfig, OrientedFilterPayload } from
  '@client/candidates/departments/constants/department-filter.constant';
import { DepartmentFormService } from '../services/department-form.service';
import { DepartmentFiltersColumnsEnum } from '@client/candidates/enums';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { ListOfSkills } from '@shared/models/skill.model';
import { DepartmentHelper } from '../helpers/department.helper';

@Component({
  selector: 'app-filter-department',
  templateUrl: './filter-department.component.html',
  styleUrls: ['./filter-department.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterDepartmentComponent extends DestroyableDirective implements OnInit {
  @Output() public readonly appliedFiltersAmount: EventEmitter<number> = new EventEmitter<number>();
  @Output() public readonly resetFilters: EventEmitter<void> = new EventEmitter<void>();
  @Output() public readonly updateTableByFilters: EventEmitter<DepartmentFilterState> =
    new EventEmitter<DepartmentFilterState>();

  public filtersFormConfig: ReadonlyArray<DepartmentFormFieldConfig<DepartmentFiltersColumnsEnum>> = [];
  public controlTypes = ControlTypes;
  public filteredItems: FilteredItem[] = [];
  public filterColumns: DepartmentFiltersColumns;
  public formGroup: CustomFormGroup<DepartmentFiltersColumns>;
  public filterOptionFields = filterOptionFields;
  public skillOptionFields = SkillFilterOptionFields;

  public departmentFiltersColumns = DepartmentFiltersColumnsEnum;

  private regions: OrganizationRegion[] = [];
  private readonly applyFilters$: BehaviorSubject<DepartmentFilterState | null> =
    new BehaviorSubject<DepartmentFilterState | null>(null);

  @Select(UserState.organizationStructure)
  private readonly organizationStructure$: Observable<OrganizationStructure>;

  @Select(OrganizationManagementState.assignedSkillsByOrganization)
  public readonly skills$: Observable<ListOfSkills[]>;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly filterService: FilterService,
    private readonly departmentFormService: DepartmentFormService,
  ) {
    super();
    this.initFilterForm();
  }

  public ngOnInit(): void {
    this.initFiltersColumns();
    this.watchForOrganizationStructure();
    this.initFormConfig();
    this.watchForControlsValueChanges();
    this.subscribeOnSkills();
    this.filterDepartments();
  }

  public trackByFn = (_: number, item: DepartmentFormFieldConfig<DepartmentFiltersColumnsEnum>) => item.field;

  public applyFilters(): void {
    this.filteredItems = this.filterService.generateChips(this.formGroup, this.filterColumns);
    const formState = this.formGroup.getRawValue();
    const filterState = { ...formState, isOriented: OrientedFilterPayload[formState.isOriented] };
    this.applyFilters$.next(filterState);
  }

  public clearAllFilters(): void {
    this.resetFilterForm();
    this.filteredItems = [];
    this.appliedFiltersAmount.emit(this.filteredItems.length);
    this.resetFilters.emit();
    this.filterColumns.locationIds.dataSource = [];
    this.filterColumns.departmentsIds.dataSource = [];
    this.applyFilters$.next(null);
    this.cdr.markForCheck();
  }

  public deleteFilter(event: FilteredItem): void {
    this.filterService.removeValue(event, this.formGroup, this.filterColumns);
    this.appliedFiltersAmount.emit(this.filteredItems.length);

    if (event.column === DepartmentFiltersColumnsEnum.ORIENTED) {
      this.formGroup.get(DepartmentFiltersColumnsEnum.ORIENTED)?.setValue(0);
    }
  }

  private filterDepartments(): void {
    this.applyFilters$
      .pipe(
        distinctUntilChanged((prev, curr) => this.departmentFormService.compareFormState(prev, curr)),
        filter(Boolean),
        takeUntil(this.destroy$)
      )
      .subscribe((filterState) => {
        this.updateTableByFilters.emit(filterState);
        this.appliedFiltersAmount.emit(this.filteredItems.length);
        this.cdr.markForCheck();
      });
  }

  private watchForOrganizationStructure(): void {
    this.organizationStructure$
      .pipe(filter(Boolean), takeUntil(this.destroy$))
      .subscribe((structure: OrganizationStructure) => {
        this.resetFilterForm();
        this.filteredItems = [];
        this.regions = structure.regions;
        this.filterColumns.regionIds.dataSource = [...(this.regions as DataSourceItem[])];
        this.cdr.markForCheck();
      });
  }

  private resetFilterForm(): void {
    if (this.formGroup.dirty) {
      this.formGroup.reset({ isOriented: 0 });
    }
  }

  private initFilterForm(): void {
    this.formGroup = this.departmentFormService.createFilterForm();
  }

  private initFormConfig(): void {
    this.filtersFormConfig = DepartmentFilterFormConfig();
    this.cdr.detectChanges();
  }

  private initFiltersColumns(): void {
    this.filterColumns = this.departmentFormService.initFilterColumns();
  }

  private watchForControlsValueChanges(): void {
    this.formGroup
      .get('regionIds')
      ?.valueChanges.pipe(filter(Boolean), takeUntil(this.destroy$))
      .subscribe((val) => {
        this.filterColumns.locationIds.dataSource = [];

        if (val?.length) {
          const selectedRegions: OrganizationRegion[] = DepartmentHelper.findSelectedItems(
            val,
            this.regions
          ) as OrganizationRegion[];
          const regionLocations: OrganizationLocation[] = selectedRegions.flatMap((region) => {
            region?.locations?.forEach((location: OrganizationLocation) => {
              location.regionName = region.name;
            });
            return region?.locations ?? [];
          });

          this.filterColumns.locationIds.dataSource = regionLocations;
        } else {
          this.formGroup.get('locationIds')?.setValue([]);
          this.filteredItems = this.filterService.generateChips(this.formGroup, this.filterColumns);
        }

        this.cdr.markForCheck();
      });

    this.formGroup
      .get('locationIds')
      ?.valueChanges.pipe(filter(Boolean), takeUntil(this.destroy$))
      .subscribe((val: number[]) => {
        this.filterColumns.departmentsIds.dataSource = [];
        if (val?.length) {
          const locationDataSource = this.filterColumns.locationIds.dataSource as OrganizationLocation[];
          const selectedLocations: OrganizationLocation[] = DepartmentHelper.findSelectedItems(
            val,
            locationDataSource
          ) as OrganizationLocation[];
          const locationDepartments: OrganizationDepartment[] = selectedLocations.flatMap(
            (location) => location.departments
          );

          this.filterColumns.departmentsIds.dataSource = locationDepartments;
        } else {
          this.formGroup.get('departmentsIds')?.setValue([]);
          this.filteredItems = this.filterService.generateChips(this.formGroup, this.filterColumns);
        }

        this.cdr.markForCheck();
      });
  }

  private subscribeOnSkills(): void {
    this.skills$.pipe(takeUntil(this.destroy$)).subscribe((skills) => {
      this.filterColumns.skillIds.dataSource = skills;
      this.cdr.markForCheck();
    });
  }
}
