import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Location } from '@angular/common';

import { Select, Store } from '@ngxs/store';
import {
  distinctUntilChanged,
  Observable,
  switchMap,
  takeUntil,
  filter,
  tap,
  of,
  combineLatest,
  debounceTime,
  take,
} from 'rxjs';
import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';
import { RowNode } from '@ag-grid-community/core';
import { DialogAction } from '@core/enums';

import { Destroyable } from '@core/helpers';
import { User } from '@shared/models/user.model';
import { IsOrganizationAgencyAreaStateModel } from '@shared/models/is-organization-agency-area-state.model';
import { DataSourceItem } from '@core/interface';
import { SetHeaderState, ShowFilterDialog } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import { TabConfig, TabCountConfig, TimesheetsFilterState, TimesheetsSelectedRowEvent } from '../../interface';
import { TimesheetExportOptions, TAB_ADMIN_TIMESHEETS } from '../../constants';
import { TimesheetsState } from '../../store/state/timesheets.state';
import { TimeSheetsPage } from '../../store/model/timesheets.model';
import { TimesheetsService } from '../../services';
import { Timesheets } from '../../store/actions/timesheets.actions';
import { ProfileDetailsContainerComponent } from '../profile-details-container/profile-details-container.component';
import { AppState } from '../../../../store/app.state';
import { TimesheetsTabsComponent } from '../../components/timesheets-tabs/timesheets-tabs.component';
import { PreservedFiltersState } from 'src/app/store/preserved-filters.state';
import { FilterService } from '@shared/services/filter.service';
import { PreservedFilters } from '@shared/models/preserved-filters.model';
import { baseDropdownFieldsSettings } from '@shared/constants/base-dropdown-fields-settings';

@Component({
  selector: 'app-timesheets-container',
  templateUrl: './timesheets-container.component.html',
  styleUrls: ['./timesheets-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimesheetsContainerComponent extends Destroyable implements OnInit {
  @ViewChild(ProfileDetailsContainerComponent)
  public timesheetDetailsComponent: ProfileDetailsContainerComponent;

  @ViewChild(TimesheetsTabsComponent)
  private timesheetsTabs: TimesheetsTabsComponent;

  @Select(TimesheetsState.timesheets)
  readonly timesheets$: Observable<TimeSheetsPage>;

  @Select(TimesheetsState.loading)
  readonly loading$: Observable<boolean>;

  @Select(TimesheetsState.tabCounts)
  readonly tabCounts$: Observable<TabCountConfig>;

  @Select(TimesheetsState.timesheetsFilters)
  readonly timesheetsFilters$!: Observable<TimesheetsFilterState>;

  @Select(TimesheetsState.timesheetsFiltersColumns)
  readonly timesheetsFiltersColumns$: Observable<TimesheetsFilterState>;

  @Select(TimesheetsState.organizations)
  readonly organizations$!: Observable<DataSourceItem[]>;

  @Select(AppState.isOrganizationAgencyArea)
  isOrganizationAgencyArea$: Observable<IsOrganizationAgencyAreaStateModel>;

  @Select(UserState.user)
  readonly user$: Observable<User>;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  @Select(UserState.lastSelectedAgencyId)
  agencyId$: Observable<number>;

  @Select(PreservedFiltersState.preservedFilters)
  preservedFilters$: Observable<PreservedFilters>;

  public tabConfig: TabConfig[] = TAB_ADMIN_TIMESHEETS;
  public activeTabIdx = 0;
  public orgId: number | null = null;
  public appliedFiltersAmount = 0;
  public readonly exportOptions: ItemModel[] = TimesheetExportOptions;
  public readonly unitOrganizationsFields = baseDropdownFieldsSettings;
  public filters: TimesheetsFilterState | undefined;
  public readonly organizationControl: FormControl = new FormControl(null);
  public readonly currentSelectedTableRowIndex: Observable<number> = this.timesheetsService.getStream();
  public isAgency: boolean;

  constructor(
    private store: Store,
    private timesheetsService: TimesheetsService,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    private location: Location,
    private filterService: FilterService
  ) {
    super();
    store.dispatch([
      new SetHeaderState({ iconName: 'clock', title: 'Timesheets' }),
      new Timesheets.ResetFiltersState(),
      new Timesheets.SelectOrganization(0),
    ]);

    this.isAgency = this.route.snapshot.data['isAgencyArea'];
  }

  ngOnInit(): void {
    this.onOrganizationChangedHandler();
    this.startOrganizationWatching();
    this.startFiltersWatching();
    this.calcTabsBadgeAmount();
    this.initOnRedirect();
  }

  public handleChangeTab(tabIndex: number): void {
    let preservedFilters = null;
    if (this.filterService.canPreserveFilters()) {
      preservedFilters = this.isAgency
        ? this.store.selectSnapshot(PreservedFiltersState.preservedFiltersTimesheets)
        : this.store.selectSnapshot(PreservedFiltersState.preservedFilters);
    }
    this.activeTabIdx = tabIndex;
    if (preservedFilters) {
      this.store.dispatch(
        new Timesheets.UpdateFiltersState(
          {
            statusIds: this.tabConfig[tabIndex].value,
            regionsIds: [...preservedFilters.regions],
            locationIds: preservedFilters.locations,
          },
          this.activeTabIdx !== 0,
          false
        )
      );
    } else {
      this.store.dispatch(
        new Timesheets.UpdateFiltersState({ statusIds: this.tabConfig[tabIndex].value }, this.activeTabIdx !== 0, false)
      );
    }
  }

  public handleChangePage(pageNumber: number): void {
    this.store.dispatch(new Timesheets.UpdateFiltersState({ pageNumber }, this.activeTabIdx !== 0, false, true));
  }

  public handleChangePerPage(pageSize: number): void {
    this.store.dispatch(new Timesheets.UpdateFiltersState({ pageSize }, this.activeTabIdx !== 0, false, true));
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public resetFilters(): void {
    this.store.dispatch(new Timesheets.UpdateFiltersState({}, this.activeTabIdx !== 0, this.isAgency));
  }

  public updateTableByFilters(filters: TimesheetsFilterState): void {
    this.store.dispatch(
      new Timesheets.UpdateFiltersState(
        {
          ...filters,
        },
        this.activeTabIdx !== 0
      )
    );
    this.store.dispatch(new ShowFilterDialog(false));
  }

  public rowSelected(selectedRow: TimesheetsSelectedRowEvent): void {
    this.timesheetsService.setCurrentSelectedIndexValue(selectedRow.rowIndex);
    this.store.dispatch(new Timesheets.ToggleCandidateDialog(DialogAction.Open, selectedRow.data));
    this.cd.markForCheck();
  }

  public onNextPreviousOrderEvent(next: boolean): void {
    this.timesheetsService.setNextValue(next);
    this.cd.markForCheck();
  }

  public sortHandler(event: string): void {
    this.store.dispatch(new Timesheets.UpdateFiltersState({ orderBy: event }, this.activeTabIdx !== 0));
  }

  public changeFiltersAmount(amount: number): void {
    this.appliedFiltersAmount = amount;
  }

  public setRange(range: string[]): void {
    this.store.dispatch(
      new Timesheets.UpdateFiltersState(
        {
          startDate: range[0],
          endDate: range[1],
        },
        this.activeTabIdx !== 0
      )
    );
  }

  public bulkApprove(data: RowNode[]): void {
    this.store.dispatch(new Timesheets.BulkApprove(data));
  }

  public bulkExport(data: RowNode[]): void {}

  private onOrganizationChangedHandler(): void {
    const idStream = this.isAgency ? this.agencyId$ : this.organizationId$;

    if (this.filterService.canPreserveFilters()) {
      this.preservedFilters$
        .pipe(
          switchMap(() => idStream),
          debounceTime(600),
          filter((id) => !!id),
          distinctUntilChanged(),
          takeUntil(this.componentDestroy())
        )
        .subscribe(() => {
          this.store.dispatch(new Timesheets.ResetFiltersState());
          this.initComponentState();
        });
    } else {
      idStream
        .pipe(
          debounceTime(600),
          filter((id) => !!id),
          takeUntil(this.componentDestroy())
        )
        .subscribe(() => {
          this.store.dispatch(new Timesheets.ResetFiltersState());
          this.initComponentState();
        });
    }
  }

  private startFiltersWatching(): void {
    this.timesheetsFilters$
      .pipe(
        filter(Boolean),
        debounceTime(300),
        filter((filters) => (this.isAgency ? !isNaN(filters.organizationId as number) : true)),
        switchMap(() => this.store.dispatch(new Timesheets.GetAll())),
        takeUntil(this.componentDestroy())
      )
      .subscribe();
  }

  private startOrganizationWatching(): void {
    this.organizationControl.valueChanges
      .pipe(
        filter(Boolean),
        distinctUntilChanged(),
        switchMap((organizationId: number) => {
          this.orgId = organizationId;
          this.filterService.setPreservedFIltersTimesheets({ organizationIds: [organizationId] });
          return this.store.dispatch([
            new Timesheets.UpdateFiltersState({ organizationId }, this.activeTabIdx !== 0),
            new Timesheets.SelectOrganization(organizationId),
          ]);
        }),
        switchMap(() => this.store.dispatch(new Timesheets.GetFiltersDataSource())),
        takeUntil(this.componentDestroy())
      )
      .subscribe();
  }

  private initOrganizationsList(preservedFilters: PreservedFilters | null): void {
    this.store
      .dispatch(new Timesheets.GetOrganizations())
      .pipe(
        switchMap(() => this.organizations$.pipe(filter((res: DataSourceItem[]) => !!res.length))),
        takeUntil(this.componentDestroy())
      )
      .subscribe((res) => {
        const preservedOrgIds = preservedFilters?.organizations || [];

        const orgId = this.filterService.canPreserveFilters()
          ? preservedOrgIds[0] || this.getOrganizationIdFromState() || res[0].id
          : this.getOrganizationIdFromState() || res[0].id;

        this.store.dispatch(new Timesheets.SelectOrganization(orgId));
        this.organizationControl.setValue(orgId, { emitEvent: false });

        if (preservedFilters && this.filterService.canPreserveFilters()) {
          this.store.dispatch([
            new Timesheets.UpdateFiltersState(
              {
                organizationId: orgId,
                regionsIds: [...preservedFilters.regions],
                locationIds: [...preservedFilters.locations],
              },
              this.activeTabIdx !== 0
            ),
            new Timesheets.GetFiltersDataSource(),
          ]);
        } else {
          this.store.dispatch([
            new Timesheets.UpdateFiltersState({ organizationId: orgId }, this.activeTabIdx !== 0),
            new Timesheets.GetFiltersDataSource(),
          ]);
        }
      });
  }

  private getOrganizationIdFromState(): number | null {
    const id = (this.location.getState() as { organizationId?: number })?.organizationId;
    return id ? +id : null;
  }

  private calcTabsBadgeAmount(): void {
    this.tabCounts$.pipe(filter(Boolean), takeUntil(this.componentDestroy())).subscribe((data) => {
      this.tabConfig = this.tabConfig.map((el, idx) => {
        if (idx === 1) {
          el.amount = data.pending;
        } else if (idx === 2) {
          el.amount = data.missing;
        } else if (idx === 3) {
          el.amount = data.rejected;
        }

        return el;
      });
      this.cd.detectChanges();
    });
  }

  private initComponentState(): void {
    let preservedFilters = null;
    let preservedFiltersAgency = null;

    if (this.filterService.canPreserveFilters()) {
      preservedFilters = this.store.selectSnapshot(PreservedFiltersState.preservedFilters);
      preservedFiltersAgency = this.store.selectSnapshot(PreservedFiltersState.preservedFiltersTimesheets);
    }

    this.timesheetsTabs?.programSelection();

    if (this.isAgency) {
      this.initOrganizationsList(preservedFiltersAgency);
    } else {
      /**
       * TODO: rework needed
       */
      if (preservedFilters) {
        this.store.dispatch([
          new Timesheets.UpdateFiltersState({
            regionsIds: [...preservedFilters.regions],
            locationIds: [...preservedFilters.locations],
          }),
          new Timesheets.GetFiltersDataSource(),
        ]);
      } else {
        this.store.dispatch([new Timesheets.UpdateFiltersState(), new Timesheets.GetFiltersDataSource()]);
      }
    }
  }

  private initOnRedirect(): void {
    const { timesheetId, organizationId } = this.location.getState() as {
      navigationId: number;
      timesheetId: number;
      organizationId: number;
    };
    const organizationId$ = organizationId ? of(organizationId) : this.organizationId$;

    if (timesheetId) {
      const subscription = organizationId$
        .pipe(
          filter((value) => !!value && !!timesheetId),
          switchMap((value) =>
            this.store.dispatch(new Timesheets.GetTimesheetDetails(timesheetId, value, this.isAgency))
          ),
          tap(() => {
            this.store.dispatch(new Timesheets.ToggleCandidateDialog(DialogAction.Open, undefined));
            subscription.unsubscribe();
          }),
          takeUntil(this.componentDestroy())
        )
        .subscribe();
    }
  }
}
