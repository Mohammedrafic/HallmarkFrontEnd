import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { Select } from '@ngxs/store';
import { debounceTime, filter, Observable, switchMap, takeUntil, tap } from 'rxjs';
import { FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';

import { FiltersDialogHelper } from '@core/helpers/filters-dialog.helper';
import { TimesheetsState } from '../../store/state/timesheets.state';
import { TimesheetsModel, TimeSheetsPage } from '../../store/model/timesheets.model';
import { FilterColumns, TimesheetsFilterState } from '../../interface';
import { PreservedFiltersState } from 'src/app/store/preserved-filters.state';
import { PreservedFiltersByPage } from '@core/interface/preserved-filters.interface';
import { UserState } from 'src/app/store/user.state';
import { Timesheets } from '../../store/actions/timesheets.actions';

@Component({
  selector: 'app-timesheets-filter-dialog',
  templateUrl: './timesheets-filter-dialog.component.html',
  styleUrls: ['./timesheets-filter-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimesheetsFilterDialogComponent
  extends FiltersDialogHelper<FilterColumns, TimesheetsFilterState, TimesheetsModel>
  implements OnInit, OnChanges
{
  @Select(TimesheetsState.timesheets)
  readonly timesheets$: Observable<TimeSheetsPage>;
  @Select(TimesheetsState.filterOptions)
  readonly filterOptions$: Observable<TimesheetsFilterState>;
  @Select(PreservedFiltersState.preservedFiltersByPageName)
  private readonly preservedFiltersByPageName$: Observable<PreservedFiltersByPage<TimesheetsFilterState>>;
  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  @Input() isAgency: boolean;

  public showStatuses = true;

  ngOnInit(): void {
    this.initFormGroup();
    this.initFiltersColumns(TimesheetsState.timesheetsFiltersColumns);
    this.startRegionsWatching();
    this.startLocationsWatching();
    this.subscribeOnUserSearch();
    this.applyPreservedFilters();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['orgId'] && !changes['orgId'].firstChange) {
      this.showStatuses = this.activeTabIdx === 0;
      this.clearAllFilters(false);
    }
  }

  public contactPersonFiltering(args: FilteringEventArgs): void {
    this.userSearch$.next(args);
  }

  private subscribeOnUserSearch(): void {
    this.userSearch$
      .pipe(
        filter((args) => args.text.length > 2),
        tap((args) => {
          this.filterColumns.contactEmails.dataSource = [];
          args.updateData([]);
        }),
        debounceTime(300),
        takeUntil(this.componentDestroy())
      )
      .subscribe((args) => {
        this.filterService.getUsersListBySearchTerm(args.text).subscribe((data) => {
          this.filterColumns.contactEmails.dataSource = data;
          args.updateData(data);
        });
      });
  }

  private applyPreservedFilters(): void {
    this.organizationId$
      .pipe(
        tap(() => this.store.dispatch(new Timesheets.ResetFilterOptions())),
        debounceTime(100),
        switchMap(() => this.filterOptions$),
        switchMap((options) => this.preservedFiltersByPageName$.pipe(filter(() => !!options))),
        takeUntil(this.componentDestroy())
      )
      .subscribe(({ state, dispatch }) => {
        if (dispatch) {
          this.patchFilterForm({ ...state });
          this.filteredItems = this.filterService.generateChips(this.formGroup, this.filterColumns);
          this.appliedFiltersAmount.emit(this.filteredItems.length);
        }
      });
  }
}
