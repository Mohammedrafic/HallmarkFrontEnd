import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { Select } from '@ngxs/store';
import { filter, Observable, takeUntil } from 'rxjs';
import {
  OrganizationDepartment,
  OrganizationLocation,
  OrganizationRegion,
  OrganizationStructure,
} from '@shared/models/organization.model';
import { UserState } from 'src/app/store/user.state';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { FilteredItem } from '@shared/models/filter.model';
import { CustomFormGroup, DataSourceItem } from '@core/interface';
import { filterOptionFields, SkillFilterOptionFields } from '@core/constants/filters-helper.constant';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { DepartmentFormFieldConfig, DepartmentFiltersColumns, DepartmentFilterState } from '../departments.model';
import { FilterService } from '@shared/services/filter.service';
import { DepartmentFilterFormConfig } from '@client/candidates/departments/constants/department-filter.constant';
import { DepartmentFormService } from '../services/department-filter.service';
import { DepartmentFiltersColumnsEnum } from '@client/candidates/enums';
import { DatePipe } from '@angular/common';
import { SortOrder } from '@syncfusion/ej2-angular-navigations';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { ListOfSkills } from '@shared/models/skill.model';
import { CandidateProfileFormService } from '@client/candidates/candidate-profile/candidate-profile-form.service';

@Component({
  selector: 'app-filter-department',
  templateUrl: './filter-department.component.html',
  styleUrls: ['./filter-department.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterDepartmentComponent extends DestroyableDirective implements OnInit {
  @Output() readonly appliedFiltersAmount: EventEmitter<number> = new EventEmitter<number>();
  @Output() readonly resetFilters: EventEmitter<void> = new EventEmitter<void>();
  @Output() readonly updateTableByFilters: EventEmitter<DepartmentFilterState> =
    new EventEmitter<DepartmentFilterState>();

  public filtersFormConfig: DepartmentFormFieldConfig<DepartmentFiltersColumnsEnum>[] = [];
  public controlTypes = ControlTypes;
  public filteredItems: FilteredItem[] = [];
  public filterColumns: DepartmentFiltersColumns;
  public formGroup: CustomFormGroup<DepartmentFiltersColumns>;
  public filterOptionFields = filterOptionFields;
  public skillOptionFields = SkillFilterOptionFields;
  public sortOrder: SortOrder = 'Ascending';

  public departmentFiltersColumns = DepartmentFiltersColumnsEnum;

  private regions: OrganizationRegion[] = [];

  @Select(UserState.organizationStructure)
  private readonly organizationStructure$: Observable<OrganizationStructure>;

  @Select(OrganizationManagementState.assignedSkillsByOrganization)
  public readonly skills$: Observable<ListOfSkills[]>;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly filterService: FilterService,
    private readonly departmentFormService: DepartmentFormService,
    private readonly datePipe: DatePipe,
    private readonly candidateProfileFormService: CandidateProfileFormService
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
  }

  public trackByFn = (_: number, item: DepartmentFormFieldConfig<DepartmentFiltersColumnsEnum>) => item.field;

  public applyFilters(): void {
    this.filteredItems = this.filterService.generateChips(this.formGroup, this.filterColumns, this.datePipe);
    const filterState = this.formGroup.getRawValue();
    this.updateTableByFilters.emit(filterState);
    this.appliedFiltersAmount.emit(this.filteredItems.length);
    this.cdr.markForCheck();
  }

  public clearAllFilters(): void {
    this.formGroup.reset();
    this.filteredItems = [];
    this.appliedFiltersAmount.emit(this.filteredItems.length);
    this.resetFilters.emit();
    this.filterColumns.locationIds.dataSource = [];
    this.filterColumns.departmentIds.dataSource = [];
    this.cdr.markForCheck();
  }

  public deleteFilter(event: FilteredItem): void {
    this.filterService.removeValue(event, this.formGroup, this.filterColumns);
    this.appliedFiltersAmount.emit(this.filteredItems.length);
  }

  private watchForOrganizationStructure(): void {
    this.organizationStructure$
      .pipe(filter(Boolean), takeUntil(this.destroy$))
      .subscribe((structure: OrganizationStructure) => {
        this.formGroup.reset();
        this.filteredItems = [];
        this.regions = structure.regions;
        this.filterColumns.regionIds.dataSource = [...(this.regions as DataSourceItem[])];
        this.cdr.markForCheck();
      });
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
          const regionLocations: OrganizationLocation[] = [];
          const selectedRegions: OrganizationRegion[] = val.map((id: number) => {
            return this.regions.find((region) => region.id === id) as OrganizationRegion;
          });

          selectedRegions.forEach((region: OrganizationRegion) => {
            region?.locations?.forEach((location: OrganizationLocation) => {
              location.regionName = region.name;
            });
            regionLocations.push(...(region?.locations as []));
          });

          this.filterColumns.locationIds.dataSource = regionLocations;
        } else {
          this.formGroup.get('locationIds')?.setValue([]);
          this.filteredItems = this.filterService.generateChips(this.formGroup, this.filterColumns, this.datePipe);
        }

        this.cdr.markForCheck();
      });

    this.formGroup
      .get('locationIds')
      ?.valueChanges.pipe(filter(Boolean), takeUntil(this.destroy$))
      .subscribe((val: number[]) => {
        this.filterColumns.departmentIds.dataSource = [];
        if (val?.length) {
          const locationDepartments: OrganizationDepartment[] = [];
          const selectedLocations: OrganizationLocation[] = val.map((id) => {
            return (this.filterColumns.locationIds.dataSource as OrganizationLocation[]).find(
              (location: OrganizationLocation) => location.id === id
            ) as OrganizationLocation;
          });

          selectedLocations.forEach((location: OrganizationLocation) => {
            locationDepartments.push(...(location?.departments as []));
          });

          this.filterColumns.departmentIds.dataSource = locationDepartments;
        } else {
          this.formGroup.get('departmentIds')?.setValue([]);
          this.filteredItems = this.filterService.generateChips(this.formGroup, this.filterColumns, this.datePipe);
        }

        this.cdr.markForCheck();
      });
  }

  private subscribeOnSkills(): void {
    this.skills$.pipe(takeUntil(this.destroy$)).subscribe((skills) => {
      const primarySkillId = this.formGroup.controls['primarySkillIds'].value;
      const primarySkillsDataSource = skills;
      this.filterColumns.primarySkillIds.dataSource = primarySkillsDataSource;
      const secondarySkillsDataSource = primarySkillId
        ? this.candidateProfileFormService.getSecondarySkillsDataSource(primarySkillsDataSource, primarySkillId)
        : skills;

      this.filterColumns.secondarySkillIds.dataSource = secondarySkillsDataSource;
      this.cdr.markForCheck();
    });
  }
}
