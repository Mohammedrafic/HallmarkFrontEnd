import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { Select } from '@ngxs/store';
import { filter, Observable, takeUntil } from 'rxjs';
import { OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { UserState } from 'src/app/store/user.state';
import { ControlTypes } from '@shared/enums/control-types.enum';
import { FilteredItem } from '@shared/models/filter.model';
import { CustomFormGroup, DataSourceItem } from '@core/interface';
import { filterOptionFields, SkillFilterOptionFields } from '@core/constants/filters-helper.constant';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { DepartmentFilterFieldConfig, DepartmentFiltersColumns } from '../departments.model';
import { FilterService } from '@shared/services/filter.service';
import { DepartmentFilterFormConfig } from '@client/candidates/constants/department-filter.constant';
import { DepartmentFilterService } from '../services/department-filter.service';

@Component({
  selector: 'app-filter-department',
  templateUrl: './filter-department.component.html',
  styleUrls: ['./filter-department.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterDepartmentComponent extends DestroyableDirective implements OnInit {
  @Output() readonly appliedFiltersAmount: EventEmitter<number> = new EventEmitter<number>();
  public filtersFormConfig: DepartmentFilterFieldConfig[] = [];
  public controlTypes = ControlTypes;
  public filteredItems: FilteredItem[] = [];
  public filterColumns: DepartmentFiltersColumns;
  public formGroup: CustomFormGroup<DepartmentFiltersColumns>;
  public filterOptionFields = filterOptionFields;
  public skillOptionFields = SkillFilterOptionFields;

  private regions: OrganizationRegion[] = [];

  @Select(UserState.organizationStructure)
  private readonly organizationStructure$: Observable<OrganizationStructure>;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly filterService: FilterService,
    private readonly departmentFilterService: DepartmentFilterService
  ) {
    super();
    this.initFilterForm();
  }

  public ngOnInit(): void {
    this.watchForOrganizationStructure();
    this.initFormConfig();
    this.initFiltersColumns();
  }

  public trackByFn = (_: number, item: DepartmentFilterFieldConfig) => item.field;

  public applyFilters(): void {}

  public clearAllFilters(): void {}

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
    this.formGroup = this.departmentFilterService.createForm();
  }

  private initFormConfig(): void {
    this.filtersFormConfig = DepartmentFilterFormConfig();
    this.cdr.detectChanges();
  }
  
  private initFiltersColumns(): void {}
}
