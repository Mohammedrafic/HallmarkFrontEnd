import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Select, Store } from '@ngxs/store';
import { filter, Observable, takeUntil } from 'rxjs';
import { map } from 'rxjs/operators';

import { Destroyable } from '@core/helpers';
import { GetAssignedSkillsByOrganization } from '@organization-management/store/organization-management.actions';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { SystemType } from '@shared/enums/system-type.enum';
import { FilteredItem } from '@shared/models/filter.model';
import { OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { Skill } from '@shared/models/skill.model';
import { OrganizationStructureService } from '@shared/services';
import { FilterService } from '@shared/services/filter.service';
import { ShowFilterDialog } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import { ScheduleFiltersColumns } from '../../constants';
import { ScheduleFilterHelper } from '../../helpers';
import { ScheduleFilters, ScheduleFiltersData, ScheduleFilterStructure } from '../../interface';
import { ScheduleFiltersService } from '../../services';

@Component({
  selector: 'app-schedule-filters',
  templateUrl: './schedule-filters.component.html',
  styleUrls: ['./schedule-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleFiltersComponent extends Destroyable implements OnInit {
  @Input() public count: number;

  @Output() public updateScheduleFilter: EventEmitter<ScheduleFiltersData> = new EventEmitter<ScheduleFiltersData>();

  @Select(UserState.organizationStructure)
  private readonly organizationStructure$: Observable<OrganizationStructure>;

  @Select(OrganizationManagementState.assignedSkillsByOrganization)
  private readonly skills$: Observable<Skill[]>;

  public filteredItems: FilteredItem[] = [];

  public readonly scheduleFilterFormGroup = this.scheduleFiltersService.createScheduleFilterForm();

  public readonly filterColumns = ScheduleFiltersColumns;

  public readonly optionFields = { text: 'text', value: 'value' };

  private filters: ScheduleFilters = {} ;

  private filterStructure: ScheduleFilterStructure = {
    regions: [],
    locations: [],
    departments: [],
  };

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
    private organizationStructureService: OrganizationStructureService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.getOrganizationStructure();
    this.getSkills();
    this.watchForControls();
    this.observeInlineChipDeleteEvent();
  }

  public deleteFilter(event: FilteredItem): void {
    this.filterService.removeValue(event, this.scheduleFilterFormGroup, this.filterColumns);
    this.cdr.markForCheck();
  }

  public clearAllFilters(): void {
    this.scheduleFilterFormGroup.reset();
    this.filters = this.scheduleFilterFormGroup.getRawValue();
    this.filteredItems = [];
    this.updateScheduleFilter.emit({ filters: this.filters, filteredItems: this.filteredItems, chipsData: [] });
  }

  public applyFilter(): void {
    if (this.scheduleFilterFormGroup.valid) {
      this.setFilters();
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

  private getOrganizationStructure(): void {
    this.organizationStructure$
      .pipe(
        filter(Boolean),
        map((structure: OrganizationStructure) =>
          this.organizationStructureService.getOrgStructureForIrp(structure.regions)
        ),
        takeUntil(this.componentDestroy()),
      )
      .subscribe((regions: OrganizationRegion[]) => {
        if (this.filteredItems.length) {
          this.clearAllFilters();
        }

        this.store.dispatch(new GetAssignedSkillsByOrganization({ params: { SystemType: this.activeSystem } }));
        this.filterStructure = this.scheduleFiltersService.createFilterStructure(regions);
        this.filterColumns.regionIds.dataSource = ScheduleFilterHelper.adaptRegionToOption(this.filterStructure.regions);
        this.cdr.markForCheck();
      });
  }

  private getSkills(): void {
    this.skills$
      .pipe(
        filter(Boolean),
        map((skills) => ScheduleFilterHelper.adaptSkillToOption(skills)),
        takeUntil(this.componentDestroy()),
      )
      .subscribe((skills) => {
        this.filterColumns.skillIds.dataSource = skills;
        this.cdr.markForCheck();
      });
  }

  private watchForControls(): void {
    this.scheduleFilterFormGroup.get('regionIds')?.valueChanges
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((selectedRegionIds: number[]) => {
        this.scheduleFilterFormGroup.get('locationIds')?.patchValue([], { emitEvent: false, onlySelf: true});

        if (selectedRegionIds?.length) {
          this.filterColumns.locationIds.dataSource = this.scheduleFiltersService
          .getSelectedLocatinOptions(this.filterStructure, selectedRegionIds);
        } else {
          this.filterColumns.locationIds.dataSource = [];
          this.filteredItems = this.filterService.generateChips(this.scheduleFilterFormGroup, this.filterColumns);
        }

        this.cdr.markForCheck();
      });

    this.scheduleFilterFormGroup.get('locationIds')?.valueChanges
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((slectedLocationIds: number[]) => {
        this.scheduleFilterFormGroup.get('departmentsIds')?.patchValue([], { emitEvent: false, onlySelf: true});

        if (slectedLocationIds?.length) {
          this.filterColumns.departmentsIds.dataSource = this.scheduleFiltersService
          .getSelectedDepartmentOptions(this.filterStructure, slectedLocationIds);
        } else {
          this.filterColumns.departmentsIds.dataSource = [];
          this.filteredItems = this.filterService.generateChips(this.scheduleFilterFormGroup, this.filterColumns);
        }

        this.cdr.markForCheck();
      });

    this.scheduleFilterFormGroup.valueChanges
    .pipe(takeUntil(this.componentDestroy()))
    .subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  private observeInlineChipDeleteEvent(): void {
    this.scheduleFiltersService.getDeleteInlineChipStream()
    .pipe(
      takeUntil(this.componentDestroy()),
    )
    .subscribe((event) => {
      if (event === null) {
        this.clearAllFilters();
        return;
      } 

      const itemToDelete = this.filteredItems.find((item) => item.column === event.field && item.text === event.value);
      const controlValue = this.scheduleFilterFormGroup.get(event.field)?.value;
      let updatedValue: string | number | number[] | boolean;

      if (controlValue && itemToDelete) {
        if (Array.isArray(controlValue)) {
          updatedValue = controlValue.filter((value) => value !== itemToDelete.value) as number[];
        } else {
          updatedValue = '';
        }
        
        this.scheduleFilterFormGroup.get(event.field)?.patchValue(updatedValue);
        this.setFilters();
      }
    });
  }

  private setFilters(): void {
    this.filters = this.scheduleFilterFormGroup.getRawValue();
    this.filteredItems = this.filterService.generateChips(this.scheduleFilterFormGroup, this.filterColumns);
    const chips = this.scheduleFiltersService.createChipsData(this.scheduleFilterFormGroup.getRawValue(),

    this.filterColumns);

    this.updateScheduleFilter.emit({
      filters: this.filters,
      filteredItems: this.filteredItems,
      chipsData: chips,
    });
  }
}
