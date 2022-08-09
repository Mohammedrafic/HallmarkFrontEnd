import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter,
  Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Select, Store } from '@ngxs/store';
import { Observable, takeUntil } from 'rxjs';
import { filter } from 'rxjs/operators';

import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { Destroyable, findItemById, leftOnlyValidValues } from '@core/helpers';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion,
  OrganizationStructure } from '@shared/models/organization.model';
import { DataSourceItem } from '@core/interface';

import { TimesheetsState } from '../../store/state/timesheets.state';
import { TimeSheetsPage } from '../../store/model/timesheets.model';
import { filterOptionFields } from '../../constants';
import { FilterColumns, TimesheetsFilterState } from '../../interface';
import { TimesheetsService } from '../../services/timesheets.service';
import { TimesheetsTableFiltersColumns } from '../../enums';
import { Timesheets } from '../../store/actions/timesheets.actions';
import { UserState } from '../../../../store/user.state';

@Component({
  selector: 'app-timesheets-filter-dialog',
  templateUrl: './timesheets-filter-dialog.component.html',
  styleUrls: ['./timesheets-filter-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimesheetsFilterDialogComponent extends Destroyable implements OnInit, OnChanges {
  @Select(TimesheetsState.timesheets)
  readonly timesheets$: Observable<TimeSheetsPage>;

  @Select(TimesheetsState.timesheetsFilters)
  readonly timesheetsFilters$!: Observable<TimesheetsFilterState>;

  @Select(UserState.organizationStructure)
  readonly organizationStructure$: Observable<OrganizationStructure>;

  @Input() activeTabIdx: number;
  @Input() isAgency: boolean;

  @Output() readonly updateTableByFilters: EventEmitter<any> = new EventEmitter<any>();
  @Output() readonly resetFilters: EventEmitter<void> = new EventEmitter<void>();
  @Output() readonly appliedFiltersAmount: EventEmitter<number> = new EventEmitter<number>();

  public allRegions: OrganizationRegion[] = [];
  public orgRegions: OrganizationRegion[] = [];
  public filteredItems: FilteredItem[] = [];
  public filterOptionFields = filterOptionFields;
  public filterColumns: FilterColumns;
  public formGroup: FormGroup;
  public showStatuses = true;

  constructor(
    private store: Store,
    private filterService: FilterService,
    private timesheetsService: TimesheetsService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.initFormGroup();
    this.initFiltersColumns();
    this.startRegionsWatching();
    this.startLocationsWatching();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['activeTabIdx'].firstChange) {
      this.showStatuses = this.activeTabIdx === 0;
      this.clearAllFilters(false);
    }
  }

  public deleteFilter(event: FilteredItem): void {
    this.filterService.removeValue(event, this.formGroup, this.filterColumns);
    this.appliedFiltersAmount.emit(this.filteredItems.length);
  }

  public clearAllFilters(eventEmmit = true): void {
    this.formGroup.reset();
    this.filteredItems = [];
    this.appliedFiltersAmount.emit(this.filteredItems.length);
    if (eventEmmit) {
      this.resetFilters.emit();
    }
  }

  public applyFilters(): void {
    const filters = leftOnlyValidValues(this.formGroup);

    this.updateTableByFilters.emit(filters);
    this.filteredItems = this.filterService.generateChips(this.formGroup, this.filterColumns);
    this.appliedFiltersAmount.emit(this.filteredItems.length);
  }

  private initFiltersColumns(): void {
    this.store.select(TimesheetsState.timesheetsFiltersColumns)
      .pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy()),
      ).subscribe((filters) => {
      this.orgRegions = filters.regionsIds?.dataSource || [];
      this.allRegions = [...this.orgRegions];
      this.filterColumns = filters;
      this.cdr.detectChanges();
    });
  }

  private startRegionsWatching(): void {
    this.formGroup.get(TimesheetsTableFiltersColumns.RegionsIds)?.valueChanges
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((val: number[]) => {
        if (val?.length) {
          const selectedRegions: OrganizationRegion[] = this.findSelectedItems(val, this.orgRegions);

          const res: OrganizationLocation[] = [];
          selectedRegions.forEach(region => {
            region.locations?.forEach(location => location.regionName = region.name);
            res.push(...region.locations as []);
          });
          this.setDataSourceByFormKey(TimesheetsTableFiltersColumns.LocationIds, res);
        } else {
          this.resetDataSourceAndChips(TimesheetsTableFiltersColumns.LocationIds);
        }
      });
  }

  private startLocationsWatching(): void {
    this.formGroup.get(TimesheetsTableFiltersColumns.LocationIds)?.valueChanges
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((locationIds: number[]) => {
        if (locationIds?.length) {
          const res: OrganizationDepartment[] = [];
          locationIds.forEach(id => {
            const selectedLocation = this.filterColumns.locationIds.dataSource.find((location: OrganizationLocation) => location.id === id);
            res.push(...selectedLocation?.departments as []);
          });
          this.setDataSourceByFormKey(TimesheetsTableFiltersColumns.DepartmentIds, res);
        } else {
          this.resetDataSourceAndChips(TimesheetsTableFiltersColumns.DepartmentIds);
        }
      });
  }

  private setDataSourceByFormKey(
    key: TimesheetsTableFiltersColumns,
    source: DataSourceItem[] | OrganizationRegion[]
  ): void {
    this.store.dispatch(new Timesheets.SetFiltersDataSource(key, source));
  }

  private resetDataSourceAndChips(key: TimesheetsTableFiltersColumns): void {
    this.setDataSourceByFormKey(key, []);
    this.formGroup.get(key)?.setValue([]);
    if (this.filteredItems.length) {
      this.filteredItems = this.filterService.generateChips(this.formGroup, this.filterColumns);
    }
    this.appliedFiltersAmount.emit(this.filteredItems.length);
  }

  private initFormGroup(): void {
    this.formGroup = this.timesheetsService.createForm();
  }

  private findSelectedItems(source: any[], arr: any[]): any[] {
    return source.reduce((acc: any[], itemId: number) => {
        acc.push(findItemById(arr, itemId));

        return acc;
      },
      []);
  }
}
