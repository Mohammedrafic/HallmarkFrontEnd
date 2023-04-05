import { ChangeDetectorRef, Directive, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';

import { Store } from '@ngxs/store';
import { Subject, takeUntil } from 'rxjs';
import { filter } from 'rxjs/operators';

import { OrganizationDepartment, OrganizationLocation, OrganizationRegion } from '@shared/models/organization.model';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { Destroyable } from '@core/helpers/destroyable.helper';
import { FiltersDialogHelperService } from '@core/services/filters-dialog-helper.service';
import { CustomFormGroup, DataSourceItem } from '@core/interface';
import { LeftOnlyValidValues } from '@core/helpers/validators.helper';
import { APP_FILTERS_CONFIG, filterOptionFields } from '@core/constants/filters-helper.constant';

import { findSelectedItems } from './functions.helper';
import { FieldSettingsModel, FilteringEventArgs, MultiSelectComponent } from '@syncfusion/ej2-angular-dropdowns';
import { ActivatedRoute } from '@angular/router';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { FilteredUser } from '@shared/models/user.model';
import { ShowFilterDialog } from 'src/app/store/app.actions';

@Directive()
export class FiltersDialogHelper<T, F, S> extends Destroyable {
  @ViewChild('regionMultiselect') regionMultiselect: MultiSelectComponent;

  @Input() activeTabIdx: number;
  @Input() orgId: number | null;

  @Output() readonly updateTableByFilters: EventEmitter<F> = new EventEmitter<F>();
  @Output() readonly appliedFiltersAmount: EventEmitter<number> = new EventEmitter<number>();
  @Output() readonly resetFilters: EventEmitter<void> = new EventEmitter<void>();

  public allRegions: OrganizationRegion[] = [];
  public orgRegions: OrganizationRegion[] = [];
  public filteredItems: FilteredItem[] = [];
  public filterOptionFields = filterOptionFields;
  public skillFields: FieldSettingsModel = { text: 'name', value: 'masterSkillsId' };
  public contactPersonFields: FieldSettingsModel = { text: 'fullName', value: 'email' };
  public filterColumns: T;
  public formGroup: CustomFormGroup<T>;
  public isAgencyArea: boolean;
  public filteredUsers: FilteredUser[] = [];
  public userSearch$ = new Subject<FilteringEventArgs>();

  constructor(
    @Inject(APP_FILTERS_CONFIG) protected readonly filtersConfig: Record<string, string>,
    protected store: Store,
    protected filterService: FilterService,
    protected cdr: ChangeDetectorRef,
    private filtersHelperService: FiltersDialogHelperService,
    private route: ActivatedRoute
  ) {
    super();
    this.isAgencyArea = this.route.snapshot.data['isAgencyArea'];
  }

  public applyFilters(): void {
    if (this.formGroup.dirty) {
      const filters: F = LeftOnlyValidValues(this.formGroup);
      const preservedFiltersState = this.formGroup.getRawValue();
      this.updateTableByFilters.emit(filters);
      this.filteredItems = this.filterService.generateChips(this.formGroup, this.filterColumns);
      this.appliedFiltersAmount.emit(this.filteredItems.length);

      const orgs: number[] = [];
      //TODO remove old approach of preserving filters in scope EIN-13661
      if (preservedFiltersState.regionsIds) {
        (this.filterColumns as any).regionsIds?.dataSource?.forEach((val: DataSourceItem) => {
          if (preservedFiltersState.regionsIds?.includes(val.id)) {
            orgs.push(val.organizationId as number);
          }
        });
        preservedFiltersState.organizationIds = orgs.filter((item, pos) => orgs.indexOf(item) == pos);
      }

      if (this.isAgencyArea) {
        this.filterService.setPreservedFIltersTimesheets(preservedFiltersState, 'regionsIds');
      } else {
        this.filterService.setPreservedFIlters(preservedFiltersState, 'regionsIds');
      }
      this.formGroup.markAsPristine();
    } else {
      this.store.dispatch(new ShowFilterDialog(false));
    }
  }

  public clearAllFilters(eventEmmit = true): void {
    this.formGroup.reset();
    this.filteredItems = [];
    this.appliedFiltersAmount.emit(this.filteredItems.length);
    if (eventEmmit) {
      this.resetFilters.emit();
    }
  }

  public deleteFilter(event: FilteredItem): void {
    this.filterService.removeValue(event, this.formGroup, this.filterColumns);
    this.appliedFiltersAmount.emit(this.filteredItems.length);
    this.formGroup.markAsDirty();
  }

  public patchFilterForm(filters: F): void {
    Object.entries(this.formGroup.controls).forEach(([name, control]) => {
      control.setValue(filters?.[name as keyof F] || null);
    });
  }

  protected initFormGroup(): void {
    this.formGroup = this.filtersHelperService.createForm() as CustomFormGroup<T>;
  }

  protected initFiltersColumns(stateKey: (state: S) => T): void {
    this.store
      .select(stateKey)
      .pipe(filter(Boolean), takeUntil(this.componentDestroy()))
      .subscribe((filters: T | any) => {
        const { dataSource } = filters.regionsIds;
        this.orgRegions = dataSource || [];
        this.allRegions = [...this.orgRegions];
        this.filterColumns = filters;
        this.cdr.detectChanges();
      });
  }

  protected startRegionsWatching(): void {
    this.formGroup
      .get(this.filtersConfig['RegionsIds'])
      ?.valueChanges.pipe(takeUntil(this.componentDestroy()))
      .subscribe((val: number[]) => {
        if (val?.length) {
          const selectedRegions: OrganizationRegion[] = findSelectedItems(val, this.orgRegions);

          const res: OrganizationLocation[] = [];
          selectedRegions.forEach((region) => {
            region.locations?.forEach((location) => (location.regionName = region.name));
            res.push(...(region.locations as []));
          });
          this.filtersHelperService.setDataSourceByFormKey(this.filtersConfig['LocationIds'], sortByField(res, 'name'));
        } else {
          this.resetDataSourceAndChips(this.filtersConfig['LocationIds']);
        }
      });
  }

  protected startLocationsWatching(): void {
    this.formGroup
      .get(this.filtersConfig['LocationIds'])
      ?.valueChanges.pipe(takeUntil(this.componentDestroy()))
      .subscribe((locationIds: number[]) => {
        if (locationIds?.length) {
          const res: OrganizationDepartment[] = [];
          locationIds.forEach((id) => {
            const selectedLocation = (this.filterColumns as any).locationIds.dataSource.find(
              (location: OrganizationLocation) => location.id === id
            );
            res.push(...(selectedLocation?.departments as []));
          });
          this.filtersHelperService.setDataSourceByFormKey(
            this.filtersConfig['DepartmentIds'],
            sortByField(res, 'name')
          );
        } else {
          this.resetDataSourceAndChips(this.filtersConfig['DepartmentIds']);
        }
      });
  }

  private resetDataSourceAndChips(key: string): void {
    this.filtersHelperService.setDataSourceByFormKey(key, []);
    this.formGroup.get(key)?.setValue([]);
    if (this.filteredItems.length) {
      this.filteredItems = this.filterService.generateChips(this.formGroup, this.filterColumns);
    }
    this.appliedFiltersAmount.emit(this.filteredItems.length);
  }
}
