import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef, ViewChild, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { DOCUMENT, Location } from '@angular/common';

import { Select, Store } from '@ngxs/store';
import { distinctUntilChanged, Observable, switchMap, takeUntil, filter, tap, of, debounceTime } from 'rxjs';
import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';
import { RowNode } from '@ag-grid-community/core';
import { DialogAction, FilterPageName } from '@core/enums';

import { Destroyable } from '@core/helpers';
import { User } from '@shared/models/user.model';
import { IsOrganizationAgencyAreaStateModel } from '@shared/models/is-organization-agency-area-state.model';
import { DataSourceItem, PreservedFiltersByPage } from '@core/interface';
import { SetHeaderState, ShowFilterDialog } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import {
  TabConfig,
  TabCountConfig,
  TimesheetsFilterState,
  TimesheetsGrid,
  TimesheetsSelectedRowEvent,
} from '../../interface';
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
import { baseDropdownFieldsSettings } from '@shared/constants/base-dropdown-fields-settings';
import { BulkTypeAction } from '@shared/enums/bulk-type-action.enum';
import { BulkActionDataModel } from '@shared/models/bulk-action-data.model';
import * as Interfaces from '../../interface';
import * as PreservedFilters from 'src/app/store/preserved-filters.actions';

@Component({
  selector: 'app-timesheets-container',
  templateUrl: './timesheets-container.component.html',
  styleUrls: ['./timesheets-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimesheetsContainerComponent extends Destroyable implements OnInit {
  @ViewChild(ProfileDetailsContainerComponent)
  public timesheetDetailsComponent: ProfileDetailsContainerComponent;

  @ViewChild('grid') private grid: TimesheetsGrid;

  @ViewChild(TimesheetsTabsComponent)
  private timesheetsTabs: TimesheetsTabsComponent;

  @Select(TimesheetsState.timesheets)
  readonly timesheets$: Observable<TimeSheetsPage>;

  @Select(TimesheetsState.loading)
  readonly loading$: Observable<boolean>;

  @Select(TimesheetsState.tabCounts)
  readonly tabCounts$: Observable<TabCountConfig>;

  @Select(TimesheetsState.timesheetsFilters)
  readonly timesheetsFilters$: Observable<TimesheetsFilterState>;

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

  @Select(PreservedFiltersState.preservedFiltersByPageName)
  private readonly preservedFiltersByPageName$: Observable<PreservedFiltersByPage<TimesheetsFilterState>>;

  public tabConfig: TabConfig[] = TAB_ADMIN_TIMESHEETS;
  public activeTabIdx = 0;
  public orgId: number | null = null;
  public appliedFiltersAmount = 0;
  public readonly exportOptions: ItemModel[] = TimesheetExportOptions;
  public readonly unitOrganizationsFields = baseDropdownFieldsSettings;
  public filters: TimesheetsFilterState | undefined;
  public readonly organizationControl: FormControl = new FormControl(null);
  public readonly currentSelectedTableRowIndex: Observable<number> = this.timesheetsService.getSelectedTimesheetRowStream();
  public isAgency: boolean;
  public businessUnitId?: number;
  routerState:any;
  public gridSelections: Interfaces.TimesheetGridSelections = {
    selectedTimesheetIds: [],
    rowNodes: [],
  };
  public OrganizationId:number;
  constructor(
    private store: Store,
    private timesheetsService: TimesheetsService,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    private location: Location,
    private filterService: FilterService,
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
  ) {
    super();
    store.dispatch([
      new SetHeaderState({ iconName: 'clock', title: 'Timesheets' }),
      new Timesheets.ResetFiltersState(),
      new Timesheets.SelectOrganization(0),
    ]);
    this.routerState = this.router.getCurrentNavigation()?.extras?.state;

    this.isAgency = this.route.snapshot.data['isAgencyArea'];
  }

  ngOnInit(): void {
    this.businessUnitId = JSON.parse(localStorage.getItem('BussinessUnitID') || '0') as number;
    if (!this.businessUnitId) {
      this.businessUnitId = 0;
    }
    this.document.defaultView?.localStorage.setItem('BussinessUnitID', JSON.stringify(''));

    this.onOrganizationChangedHandler();
    this.startOrganizationWatching();
    this.startFiltersWatching();
    this.calcTabsBadgeAmount();
    this.initOnRedirect();
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
    this.store.dispatch(new PreservedFilters.ResetPageFilters());
  }

  public handleChangeTab(tabIndex: number): void {
    this.activeTabIdx = tabIndex;

    const preservedFilters = this.store.selectSnapshot(
      PreservedFiltersState.preservedFiltersByPageName
    ) as PreservedFiltersByPage<TimesheetsFilterState>;
    const filters = !preservedFilters.isNotPreserved ? preservedFilters.state : {};
    const statusIds = this.activeTabIdx === 0 ? filters.statusIds : this.tabConfig[tabIndex].value;
    this.grid?.gridInstance$?.value?.columnApi.resetColumnState();

    this.store.dispatch(
      new Timesheets.UpdateFiltersState(
        {
          ...filters,
          statusIds,
        },
        this.activeTabIdx !== 0,
        true
      )
    );
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
    this.store.dispatch([
      new Timesheets.UpdateFiltersState({}, this.activeTabIdx !== 0, this.isAgency),
      new PreservedFilters.ClearPageFilters(this.getPageName()),
    ]);
  }

  public updateTableByFilters(filters: TimesheetsFilterState): void {
    this.store.dispatch([
      new PreservedFilters.SaveFiltersByPageName(this.getPageName(), filters),
      new Timesheets.UpdateFiltersState(
        {
          ...filters,
        },
        this.activeTabIdx !== 0
      ),
    ]
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
    this.store.dispatch(new Timesheets.UpdateFiltersState({ orderBy: event }, this.activeTabIdx !== 0, false, true));
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
        this.activeTabIdx !== 0,
        false,
        true
      )
    );
  }

  public handleBulkEvent(event: BulkActionDataModel): void {
    if (event.type === BulkTypeAction.APPROVE) {
      this.bulkApprove(event.items);
    }
  }

  public handleExport(event: RowNode[]): void {
    const nodes = event;
    if (nodes.length) {
      this.gridSelections.selectedTimesheetIds = nodes.map((node) => node.data.timesheetId);
      this.gridSelections.rowNodes = nodes;
    } else {
      this.gridSelections.selectedTimesheetIds = [];
      this.gridSelections.rowNodes = [];
    }
  }

  public resetTableSelection(): void {
    this.gridSelections.rowNodes.forEach((node: RowNode) => {
      node.setSelected(false);
    });

    this.clearSelections();
    this.gridSelections.rowNodes = [];
  }

  private bulkApprove(data: RowNode[]): void {
    this.store.dispatch(new Timesheets.BulkApprove(data));
  }

  private onOrganizationChangedHandler(): void {
   this.organizationId$.pipe( takeUntil(this.componentDestroy())).subscribe((value)=>{
    this.store.dispatch(new PreservedFilters.GetPreservedFiltersByPage(this.getPageName()));
    if(value!=null&&value!=undefined){this.OrganizationId=value}
    });
    const idStream = this.isAgency ? this.agencyId$ : this.organizationId$;

    idStream
      .pipe(
        debounceTime(600),
        filter((id) => !!id),
        switchMap(() => this.preservedFiltersByPageName$),
        filter(({ dispatch }) => dispatch),
        tap((filters) => {
          this.filters = filters.state;
        }),
        takeUntil(this.componentDestroy())
      )
      .subscribe(() => {
        this.initComponentState();
      });
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

  private initOrganizationsList(): void {
    this.store
      .dispatch(new Timesheets.GetOrganizations())
      .pipe(
        switchMap(() => this.organizations$.pipe(filter((res: DataSourceItem[]) => !!res.length))),
        takeUntil(this.componentDestroy())
      )
      .subscribe((res) => {
        const orgId = this.routerState?.["condition"] === "setOrg"
          ? this.routerState?.["orderStatus"]
          : this.getOrganizationIdFromState() || res[0].id;

        this.store.dispatch(new Timesheets.SelectOrganization((this.isAgency && (this.businessUnitId??0)>0)?this.businessUnitId: orgId));
        this.organizationControl.setValue((this.isAgency && (this.businessUnitId??0)>0)?this.businessUnitId: orgId, { emitEvent: false });    

        this.store.dispatch([
          new Timesheets.UpdateFiltersState(
            {
              organizationId: this.isAgency && (this.businessUnitId ?? 0) > 0 ? this.businessUnitId : orgId,
              ...this.filters,
            },
            this.activeTabIdx !== 0
          ),
          new Timesheets.GetFiltersDataSource(),
        ]);
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
    this.timesheetsTabs?.programSelection();
    if (this.isAgency) {
      this.initOrganizationsList();
    } else {
      this.store.dispatch([
        new Timesheets.GetFiltersDataSource(),
        new Timesheets.UpdateFiltersState({ ...this.filters }),
      ]);
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

  private clearSelections(): void {
    this.gridSelections.selectedTimesheetIds = [];
  }

  private getPageName(): FilterPageName {
    if (this.isAgency) {
      return FilterPageName.TimesheetsVMSAgency;
    } else {
      return FilterPageName.TimesheetsVMSOrganization;
    }
  }
}
