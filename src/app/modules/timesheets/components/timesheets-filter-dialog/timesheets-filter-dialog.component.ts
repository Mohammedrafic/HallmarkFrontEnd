import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';

import { Select } from '@ngxs/store';
import { debounceTime, filter, Observable, takeUntil, tap } from 'rxjs';
import { FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';

import { FiltersDialogHelper } from '@core/helpers/filters-dialog.helper';
import { TimesheetsState } from '../../store/state/timesheets.state';
import { TimesheetsModel, TimeSheetsPage } from '../../store/model/timesheets.model';
import { FilterColumns, TimesheetsFilterState } from '../../interface';

@Component({
  selector: 'app-timesheets-filter-dialog',
  templateUrl: './timesheets-filter-dialog.component.html',
  styleUrls: ['./timesheets-filter-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimesheetsFilterDialogComponent extends
  FiltersDialogHelper<FilterColumns, TimesheetsFilterState, TimesheetsModel>
  implements OnInit, OnChanges {
  @Select(TimesheetsState.timesheets)
  readonly timesheets$: Observable<TimeSheetsPage>;

  @Input() isAgency: boolean;

  public showStatuses = true;

  ngOnInit(): void {
    this.initFormGroup();
    this.initFiltersColumns(TimesheetsState.timesheetsFiltersColumns);
    this.startRegionsWatching();
    this.startLocationsWatching();
    this.subscribeOnUserSearch();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeTabIdx'] && !changes['activeTabIdx'].firstChange) {
      this.showStatuses = this.activeTabIdx === 0;
      this.clearAllFilters(false, this.filterService.canPreserveFilters());
    }
    if (changes['orgId'] && !changes['orgId'].firstChange) {
      this.showStatuses = this.activeTabIdx === 0;
      this.clearAllFilters(false);
    }
  }

  public contactPersonFiltering(args: FilteringEventArgs): void {
    this.userSearch$.next(args);
  }

  private subscribeOnUserSearch(): void {
    this.userSearch$.pipe(
      filter((args) => args.text.length > 2),
      tap((args) => {
        this.filterColumns.contactEmails.dataSource = [];
        args.updateData([]);
      }),
      debounceTime(300),
      takeUntil(this.componentDestroy())
    ).subscribe((args) => {
      this.filterService.getUsersListBySearchTerm(args.text).subscribe(data => {
        this.filterColumns.contactEmails.dataSource = data;
        args.updateData(data);
      });
    });
  }
}
