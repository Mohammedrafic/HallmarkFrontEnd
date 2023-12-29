import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { Select } from '@ngxs/store';
import { debounceTime, filter, map, Observable, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';

import { FiltersDialogHelper } from '@core/helpers/filters-dialog.helper';
import { PreservedFiltersByPage } from '@core/interface';
import { TimesheetsState } from '../../store/state/timesheets.state';
import { TimesheetsModel, TimeSheetsPage } from '../../store/model/timesheets.model';
import { FilterColumns, TimesheetsFilterState } from '../../interface';
import { UserState } from 'src/app/store/user.state';
import { Timesheets } from '../../store/actions/timesheets.actions';
import { PreservedFiltersState } from 'src/app/store/preserved-filters.state';
import { AppState } from 'src/app/store/app.state';
import { FilteredOrderContactPerson } from '@shared/models/order-contactperson.model';
import { ORDER_CONTACT_DETAIL_TITLES } from '@shared/constants';
import { TimesheetStatus } from '../../enums/timesheet-status.enum';

@Component({
  selector: 'app-timesheets-filter-dialog',
  templateUrl: './timesheets-filter-dialog.component.html',
  styleUrls: ['./timesheets-filter-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimesheetsFilterDialogComponent
  extends FiltersDialogHelper<FilterColumns, TimesheetsFilterState, TimesheetsModel>
  implements OnInit, OnChanges {
  @Select(TimesheetsState.timesheets)
  readonly timesheets$: Observable<TimeSheetsPage>;

  @Select(TimesheetsState.filterOptions)
  readonly filterOptions$: Observable<TimesheetsFilterState>;

  @Select(PreservedFiltersState.preservedFiltersByPageName)
  private readonly preservedFiltersByPageName$: Observable<PreservedFiltersByPage<TimesheetsFilterState>>;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  @Select(AppState.getMainContentElement)
  public readonly targetElement$: Observable<HTMLElement | null>;

  @Input() isAgency: boolean;

  public showStatuses = true;
  public filterType: string = 'Contains';
  public contactDetailTitles = ORDER_CONTACT_DETAIL_TITLES;
  public title: string = '';

  private activeTab$: Subject<void> = new Subject();
  timesheetSummary: string;

  ngOnInit(): void {
    this.initFormGroup();
    this.initFiltersColumns(TimesheetsState.timesheetsFiltersColumns);
    this.startRegionsWatching();
    this.startLocationsWatching();
    this.subscribeOnUserSearch();
    this.watchForPreservedFilters();
    this.watchForSwitchTabs();
    this.watchForTitleChange();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['orgId'] && !changes['orgId'].firstChange) {
      this.showStatuses = this.activeTabIdx === 0;
      this.clearAllFilters(false);
    }
    if (changes['activeTabIdx'] && !changes['activeTabIdx'].firstChange) {
      this.activeTab$.next();
      this.showStatuses = this.activeTabIdx === 0;
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
        switchMap((args) => this.getOrderContactPersonListBySearchTerm(args, this.title)),
        takeUntil(this.componentDestroy())
      )
      .subscribe();
  }

  private watchForPreservedFilters(): void {
    this.organizationId$
      .pipe(
        tap(() => this.store.dispatch(new Timesheets.ResetFilterOptions())),
        debounceTime(100),
        switchMap(() => this.filterOptions$),
        filter((options) => !!options),
        switchMap(() => this.preservedFiltersByPageName$),
        filter(({ dispatch }) => dispatch),
        takeUntil(this.componentDestroy())
      )
      .subscribe(({ state }) => {
        const timeSheetMissing = JSON.parse(localStorage.getItem('timeSheetMissing') || '""') as string;
        const orgpendingwidget = JSON.parse(localStorage.getItem('orgpendingwidget') || '""') as string;   
        const agencyTimesheet = JSON.parse(localStorage.getItem('agencytimeSheetRedire') || '""') as string;   

        this.applyPreservedFilters(state);
        if(timeSheetMissing != '' || orgpendingwidget != ''){
          this.clearAllFilters();
        }
      
        this.timesheetSummary=JSON.parse(localStorage.getItem('agencytimeSheetincomplete') || '""') as string;
        if(this.timesheetSummary !='')
        {
          this.formGroup.controls['statusIds'].patchValue([TimesheetStatus.Incomplete]);
          this.formGroup.markAsDirty();
          const filter={ statusIds:[TimesheetStatus.Incomplete]}
           this.applyPreservedFilters(filter);
          this.applyFilters();
          window.localStorage.setItem("agencytimeSheetincomplete", JSON.stringify(""));
        }
        if(agencyTimesheet !='')
        {
          const filter={ statusIds:[]}

          this.applyPreservedFilters(filter);
          window.localStorage.setItem("agencytimeSheetRedire", JSON.stringify(""));


        }
      });
  }

  private watchForTitleChange() {
    this.formGroup?.controls['title'].valueChanges
      .subscribe(() => {
        this.formGroup.controls['contactEmails'].patchValue('')
      });
  }

  private getOrderContactPersonListBySearchTerm(args: FilteringEventArgs, title: string): Observable<FilteredOrderContactPerson[]> {
    this.title = this.formGroup.get('title')?.value ?? '';
    return this.filterService.getOrderContactPersonListBySearchTerm(args.text, this.title).pipe(
      tap((data) => {
        this.filterColumns.contactEmails.dataSource = data;
        args.updateData(data);
      })
    );
  }

  private watchForSwitchTabs(): void {
    this.activeTab$.pipe(
      switchMap(() => this.preservedFiltersByPageName$),
      filter(({ state }) => !!state?.statusIds?.length),
      map(({ state }) => this.filterPreservedFilters(state)),
      takeUntil(this.componentDestroy())
    ).subscribe((state) => {
      this.applyPreservedFilters(state);
    });
  }

  private applyPreservedFilters(filters: TimesheetsFilterState): void {
    if (filters?.orderIds && Array.isArray(filters.orderIds)) {
      filters.orderIds = filters.orderIds[0];
    }
    this.patchFilterForm({ ...filters });
    const contactEmails = Array.isArray(filters?.contactEmails) ? filters.contactEmails[0] : null;
    this.getPreservedOrderContactPerson(this.title, contactEmails);
    this.filteredItems = this.filterService.generateChips(this.formGroup, this.filterColumns);
    this.appliedFiltersAmount.emit(this.filteredItems.length);
  }
}
