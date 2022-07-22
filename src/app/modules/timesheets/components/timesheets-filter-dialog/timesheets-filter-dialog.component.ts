import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Select, Store } from '@ngxs/store';
import { Observable, switchMap, takeUntil } from 'rxjs';
import { filter } from 'rxjs/operators';

import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { Destroyable } from '@core/helpers';
import { TimesheetsState } from '../../store/state/timesheets.state';
import { TimeSheetsPage } from '../../store/model/timesheets.model';
import { filterOptionFields } from '../../constants';
import { FilterColumns, TimesheetsFilterState } from '../../interface';
import { TimesheetsService } from '../../services/timesheets.service';
import { TimesheetsTableFiltersColumns } from '../../enums';
import { Timesheets } from '../../store/actions/timesheets.actions';
import { leftOnlyValidValues } from '../../helpers/functions';

@Component({
  selector: 'app-timesheets-filter-dialog',
  templateUrl: './timesheets-filter-dialog.component.html',
  styleUrls: ['./timesheets-filter-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimesheetsFilterDialogComponent extends Destroyable implements OnInit {
  @Select(TimesheetsState.timesheets)
  readonly timesheets$: Observable<TimeSheetsPage>;

  @Select(TimesheetsState.timesheetsFilters)
  readonly timesheetsFilters$!: Observable<TimesheetsFilterState>;

  @Output() readonly updateTableByFilters: EventEmitter<any> = new EventEmitter<any>();
  @Output() readonly resetFilters: EventEmitter<void> = new EventEmitter<void>();
  @Output() readonly appliedFiltersAmount: EventEmitter<number> = new EventEmitter<number>();

  public filteredItems: FilteredItem[] = [];
  public filterOptionFields = filterOptionFields;
  public filterColumns: FilterColumns;
  public formGroup: FormGroup;

  constructor(
    private store: Store,
    private filterService: FilterService,
    private timesheetsService: TimesheetsService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initFormGroup();
    this.initFiltersColumns();
    this.initFilterColumnDataSources();
    this.startFiltersWatching();
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

  private initFilterColumnDataSources(): void {
    const statuses = [
      TimesheetsTableFiltersColumns.StatusIds,
      TimesheetsTableFiltersColumns.SkillIds,
      TimesheetsTableFiltersColumns.DepartmentIds,
      TimesheetsTableFiltersColumns.AgencyIds,
      TimesheetsTableFiltersColumns.RegionsIds,
      TimesheetsTableFiltersColumns.LocationIds,
      TimesheetsTableFiltersColumns.OrderIds,
    ];
    this.store.dispatch(new Timesheets.SetFiltersDataSource(statuses));
  }

  private initFiltersColumns(): void {
    this.store.select(TimesheetsState.timesheetsFiltersColumns)
      .pipe(
        takeUntil(this.componentDestroy()),
        filter(Boolean),
      ).subscribe((filters) => {
      this.filterColumns = filters;
    });
  }

  private initFormGroup(): void {
    this.formGroup = this.timesheetsService.createForm();
  }

  private startFiltersWatching(): void {
    this.timesheetsFilters$.pipe(
      filter((filters: TimesheetsFilterState) => filters && !filters.statusIds?.length),
      takeUntil(this.componentDestroy()),
    ).subscribe(() => {
        this.clearAllFilters(false);
    });
  }
}
