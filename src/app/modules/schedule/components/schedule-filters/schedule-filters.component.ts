import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Select, Store } from '@ngxs/store';
import { filter, Observable, switchMap, takeUntil, tap } from 'rxjs';
import { distinctUntilChanged, map, skip } from 'rxjs/operators';

import { SystemType } from '@shared/enums/system-type.enum';
import { AssignedSkillsByOrganization } from '@shared/models/skill.model';
import { SkillsService } from '@shared/services/skills.service';
import { Destroyable, isObjectsEqual } from '@core/helpers';
import { FieldType, FilterPageName } from '@core/enums';
import { FilteredItem } from '@shared/models/filter.model';
import { OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { OrganizationStructureService } from '@shared/services';
import { FilterService } from '@shared/services/filter.service';
import { ShowFilterDialog } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import { ScheduleFilterFormGroupConfig, ScheduleFiltersColumns } from '../../constants';
import { ScheduleFilterHelper } from '../../helpers';
import { ScheduleFilters, ScheduleFiltersData, ScheduleFilterStructure } from '../../interface';
import { ScheduleApiService, ScheduleFiltersService } from '../../services';
import { ClearPageFilters, SaveFiltersByPageName } from 'src/app/store/preserved-filters.actions';

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

  public filteredItems: FilteredItem[] = [];

  public readonly scheduleFilterFormGroup = this.scheduleFiltersService.createScheduleFilterForm();

  public readonly filterColumns = ScheduleFiltersColumns;

  public readonly optionFields = { text: 'text', value: 'value' };

  public readonly formConfig = ScheduleFilterFormGroupConfig;

  public readonly fieldTypes = FieldType;

  private filters: ScheduleFilters = {};

  private preservedSkills: number[] | null = null;

  private filterStructure: ScheduleFilterStructure = {
    regions: [],
    locations: [],
    departments: [],
  };

  private autoApplyFilters = false;

  constructor(
    private store: Store,
    private filterService: FilterService,
    private cdr: ChangeDetectorRef,
    private scheduleFiltersService: ScheduleFiltersService,
    private scheduleApiService: ScheduleApiService,
    private organizationStructureService: OrganizationStructureService,
    private skillsService: SkillsService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.watchForOrganizationStructure();
    this.watchForEmployeeOrganizationStructure();
    this.watchForControls();
    this.observeInlineChipDeleteEvent();
    this.applyPreservedFilters();
  }

  public deleteFilter(event: FilteredItem): void {
    this.filterService.removeValue(event, this.scheduleFilterFormGroup, this.filterColumns);
    this.cdr.markForCheck();
  }

  public clearAllFilters(clearPreservedFilters = true): void {
    this.scheduleFilterFormGroup.reset();
    this.filters = this.scheduleFilterFormGroup.getRawValue();
    this.filteredItems = [];
    this.updateScheduleFilter.emit({ filters: this.filters, filteredItems: this.filteredItems, chipsData: [] });

    if (clearPreservedFilters) {
      this.store.dispatch(new ClearPageFilters(FilterPageName.SchedullerOrganization));
    }
  }

  public applyFilter(): void {
    if (this.scheduleFilterFormGroup.valid) {
      this.setFilters();
      this.store.dispatch([
        new ShowFilterDialog(false),
        new SaveFiltersByPageName(FilterPageName.SchedullerOrganization, this.filters),
      ]);
    } else {
      this.scheduleFilterFormGroup.markAllAsTouched();
    }
  }

  public closeFilterDialog(): void {
    this.scheduleFilterFormGroup.markAsUntouched();
  }

  private watchForOrganizationStructure(): void {
    this.organizationStructure$
      .pipe(
        filter(Boolean),
        map((structure: OrganizationStructure) =>
          this.organizationStructureService.getOrgStructureForIrp(structure.regions)),
        map((regions: OrganizationRegion[]) =>
          this.scheduleFiltersService.createFilterStructure(regions)),
        takeUntil(this.componentDestroy()),
      )
      .subscribe((structure: ScheduleFilterStructure) => {
        this.setFilterStructure(structure);
        this.cdr.markForCheck();
      });
  }

  private watchForEmployeeOrganizationStructure(): void {
    this.scheduleFiltersService.getEmployeeOrganizationStructureStream()
      .pipe(
        skip(1), // skip init value
        map((structure: OrganizationStructure) => this.scheduleFiltersService.createFilterStructure(structure.regions)),
        takeUntil(this.componentDestroy()),
      )
      .subscribe((structure: ScheduleFilterStructure) => {
        this.setFilterStructure(structure);
        this.preSelectHomeCostCenterFilters();
        this.cdr.markForCheck();
      });
  }

  private watchForControls(): void {
    this.scheduleFilterFormGroup.get('regionIds')?.valueChanges
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((selectedRegionIds: number[]) => {
        this.scheduleFilterFormGroup.get('locationIds')?.patchValue([]);
        this.filterColumns.locationIds.dataSource = selectedRegionIds?.length
          ? this.scheduleFiltersService.getSelectedLocatinOptions(this.filterStructure, selectedRegionIds)
          : [];
        this.setFilteredItems();
      });

    this.scheduleFilterFormGroup.get('locationIds')?.valueChanges
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((selectedLocationIds: number[]) => {
        this.scheduleFilterFormGroup.get('departmentsIds')?.patchValue([]);
        this.filterColumns.departmentsIds.dataSource = selectedLocationIds?.length
          ? this.scheduleFiltersService.getSelectedDepartmentOptions(this.filterStructure, selectedLocationIds)
          : [];
        this.setFilteredItems();
      });

    this.scheduleFilterFormGroup.get('departmentsIds')?.valueChanges
      .pipe(
        tap((departmentsIds: number[]) => {
          if (!departmentsIds?.length) {
            this.resetSkillFilters();
            this.setFilteredItems();
            this.applyHomeCostCenterFilters();
          }
        }),
        filter((departmentsIds: number[]) => !!departmentsIds?.length),
        switchMap((departmentsIds: number[]) => {
          const params = { SystemType: SystemType.IRP, DepartmentIds: departmentsIds };
          return this.skillsService.getAssignedSkillsByOrganization({ params });
        }),
        filter((skills: AssignedSkillsByOrganization[]) => !!skills.length),
        takeUntil(this.componentDestroy())
      ).subscribe((skills: AssignedSkillsByOrganization[]) => {
        if (skills.length) {
          const skillOption = ScheduleFilterHelper.adaptOrganizationSkillToOption(skills);
          this.filterColumns.skillIds.dataSource = skillOption;
          const skillIds = this.preservedSkills ? this.preservedSkills : [skillOption[0]?.value];

          this.scheduleFilterFormGroup.get('skillIds')?.patchValue(skillIds);
        } else {
          this.resetSkillFilters();
        }

        if (this.preservedSkills) {
          this.setFilters();
          this.preservedSkills = null;
        } else {
          this.setFilteredItems();
          this.applyHomeCostCenterFilters();
        }
      });

    this.scheduleFilterFormGroup.get('skillIds')?.valueChanges
    .pipe(takeUntil(this.componentDestroy()))
    .subscribe(() => this.setFilteredItems());
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

  private setFilters(skipDataUpdate = false): void {
    this.filters = this.scheduleFilterFormGroup.getRawValue();
    this.filteredItems = this.filterService.generateChips(this.scheduleFilterFormGroup, this.filterColumns);
    const chips = this.scheduleFiltersService
      .createChipsData(this.scheduleFilterFormGroup.getRawValue(), this.filterColumns);

    this.updateScheduleFilter.emit({
      filters: this.filters,
      filteredItems: this.filteredItems,
      chipsData: chips,
      skipDataUpdate,
    });
  }

  private resetSkillFilters(): void {
    this.filterColumns.skillIds.dataSource = [];
    this.scheduleFilterFormGroup.get('skillIds')?.setValue([]);
  }

  private setFilteredItems(): void {
    this.filteredItems = this.filterService.generateChips(this.scheduleFilterFormGroup, this.filterColumns);
    this.cdr.markForCheck();
  }

  private setFilterStructure(structure: ScheduleFilterStructure): void {
    if (this.filteredItems.length) {
      this.clearAllFilters(false);
    }

    this.filterStructure = structure;
    this.filterColumns.regionIds.dataSource = ScheduleFilterHelper.adaptRegionToOption(this.filterStructure.regions);
  }

  private preSelectHomeCostCenterFilters(): void {
    const regionId = this.filterStructure.regions[0].id as number;

    this.autoApplyFilters = true;

    this.filterColumns.locationIds.dataSource = this.scheduleFiltersService
      .getSelectedLocatinOptions(this.filterStructure, [regionId]);
    this.filterColumns.departmentsIds.dataSource = this.scheduleFiltersService
      .getSelectedDepartmentOptions(this.filterStructure, [this.filterColumns.locationIds.dataSource[0].value as number]);

    this.scheduleFilterFormGroup?.get('regionIds')?.patchValue([regionId], { emitEvent: false, onlySelf: true });
    this.scheduleFilterFormGroup?.get('locationIds')?.patchValue(
      [this.filterColumns.locationIds.dataSource[0]?.value], { emitEvent: false, onlySelf: true });
    this.scheduleFilterFormGroup?.get('departmentsIds')?.patchValue(
      [this.filterColumns.departmentsIds.dataSource[0]?.value]);
  }

  private applyHomeCostCenterFilters(): void {
    if (this.autoApplyFilters) {
      this.autoApplyFilters = false;
      this.setFilters(true);
    }
  }

  private applyPreservedFilters(): void {
    this.organizationStructure$.pipe(
      switchMap((structure) => this.scheduleFiltersService.getPreservedFiltersDataStream().pipe(
        filter(() => !!structure),
      )),
      distinctUntilChanged((prev, next) => isObjectsEqual(prev as Record<string, unknown>, next as Record<string, unknown>)),
      takeUntil(this.componentDestroy())
    )
      .subscribe((preservFilters) => {
        this.filters = preservFilters || {};
        this.preservedSkills = this.filters.skillIds ? [...this.filters.skillIds] : null;
        const { regionIds, locationIds, departmentsIds } = this.filters;

        this.scheduleFilterFormGroup.patchValue({
          regionIds: regionIds ? [...regionIds] : [],
          locationIds: locationIds ? [...locationIds] : [],
          departmentsIds: departmentsIds ? [...departmentsIds] : [],
        });

        if (!this.preservedSkills) {
          this.setFilters();
        }
      });
  }
}
