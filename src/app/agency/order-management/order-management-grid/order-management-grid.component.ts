import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DatePipe, Location } from '@angular/common';
import { Router } from '@angular/router';

import { debounceTime, filter, Observable, skip, Subject, takeUntil, takeWhile, tap, take } from 'rxjs';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';

import {
  DetailRowService,
  GridComponent,
  PagerComponent,
  RowDataBoundEventArgs,
  RowSelectEventArgs,
  SelectionSettingsModel,
  TextWrapSettingsModel,
} from '@syncfusion/ej2-angular-grids';
import { CheckBoxComponent } from '@syncfusion/ej2-angular-buttons';

import { AbstractGridConfigurationComponent } from
  '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { FilterOrderStatusText, STATUS_COLOR_GROUP } from '@shared/enums/status';
import { GRID_CONFIG } from '@shared/constants';
import {
  myAgencyChildColumnsToExport,
  myAgencyColumnsToExport,
  MyAgencyOrdersColumnsConfig,
  perDiemChildColumnsToExport,
  PerDiemColumnsConfig,
  perDiemColumnsToExport,
  PermPlacementColumnsConfig,
  reOrdersChildColumnToExport,
  ReOrdersColumnsConfig,
  reOrdersColumnsToExport,
  ROW_HEIGHT,
} from './order-management-grid.constants';
import {
  ClearOrders,
  ExportAgencyOrders,
  GetAgencyFilterOptions,
  GetAgencyOrderCandidatesList,
  GetAgencyOrdersPage,
  GetOrderById,
  ReloadOrderCandidatesLists,
} from '@agency/store/order-management.actions';
import { OrderManagementState } from '@agency/store/order-management.state';
import {
  AgencyOrderFilters,
  AgencyOrderManagement,
  AgencyOrderManagementPage,
  Order,
  OrderManagementChild,
} from '@shared/models/order-management.model';
import { ChipsCssClass } from '@shared/pipes/chip-css-class/chips-css-class.pipe';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { UserState } from 'src/app/store/user.state';
import { isArray, isUndefined } from 'lodash';
import { FilterService } from '@shared/services/filter.service';
import { ShowExportDialog, ShowFilterDialog } from 'src/app/store/app.actions';
import { FilteredItem } from '@shared/models/filter.model';
import { AgencyOrderFiltersComponent } from './agency-order-filters/agency-order-filters.component';
import { AgencyOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';
import { OrderType } from '@shared/enums/order-type';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { PreviewOrderDialogComponent } from
  '@agency/order-management/order-management-grid/preview-order-dialog/preview-order-dialog.component';
import { OrderManagementAgencyService } from '@agency/order-management/order-management-agency.service';
import { UpdateGridCommentsCounter } from '@shared/components/comments/store/comments.actions';
import { PreservedFiltersState } from 'src/app/store/preserved-filters.state';
import { GetIrpOrderCandidates } from '@client/store/order-managment-content.actions';
import { BreakpointObserverService } from '@core/services';
import { GlobalWindow } from '@core/tokens';
import { FilterPageName } from '@core/enums';
import { PreservedFiltersByPage } from '@core/interface';
import { SetOrderManagementPagerState } from '@agency/store/candidate.actions';
import { OrderManagementPagerState } from '@shared/models/candidate.model';
import {
  ClearPageFilters,
  GetPreservedFiltersByPage,
  ResetPageFilters,
  SaveFiltersByPageName,
} from 'src/app/store/preserved-filters.actions';
import { OrganizationStructure } from '@shared/models/organization.model';
import { GetAgencyFilterFormConfig } from './constants';
import { GetReOrdersByOrderId, SaveReOrderPageSettings } from
  '@shared/components/order-reorders-container/store/re-order.actions';

@Component({
  selector: 'app-order-management-grid',
  templateUrl: './order-management-grid.component.html',
  styleUrls: ['./order-management-grid.component.scss'],
  providers: [ChipsCssClass, DetailRowService],
})
export class OrderManagementGridComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @Input() filteredItems$: Subject<number>;
  @Input() selectedTab: AgencyOrderManagementTabs;
  @Input() exportButtonClicked: boolean;
  @Input() onExportClicked$: Subject<any>;
  @Input() search$: Subject<string>;
  @Input() public orderStatus: string[];

  @Output() selectTab = new EventEmitter<number>();
  @Input() public Organizations: number[];

  @Output() reOrderNumber = new EventEmitter<number>();

  @ViewChild('grid') override gridWithChildRow: GridComponent;
  @ViewChild('gridPager') pager: PagerComponent;

  @ViewChildren('rowCheckbox') rowCheckboxes: QueryList<CheckBoxComponent>;
  @ViewChild('detailsDialog') detailsDialog: PreviewOrderDialogComponent;

  @Select(OrderManagementState.ordersPage)
  public ordersPage$: Observable<AgencyOrderManagementPage>;

  @Select(UserState.lastSelectedAgencyId)
  lastSelectedAgencyId$: Observable<number>;

  @Select(OrderManagementState.ordersTab)
  ordersTab$: Observable<AgencyOrderManagementTabs>;

  @Select(OrderManagementState.organizationStructure)
  private readonly organizationStructure$: Observable<OrganizationStructure[]>;

  public wrapSettings: TextWrapSettingsModel = GRID_CONFIG.wordWrapSettings;
  public allowWrap = GRID_CONFIG.isWordWrappingEnabled;
  public selectionOptions: SelectionSettingsModel = {
    type: 'Multiple',
    mode: 'Row',
    checkboxMode: 'ResetOnRowClick',
    persistSelection: true,
  };

  public selectedOrder: AgencyOrderManagement;
  public openPreview = new Subject<boolean>();
  public openCandidat = new Subject<boolean>();
  public orderPositionSelected$ = new Subject<boolean>();
  public openChildDialog = new Subject<any>();
  public previousSelectedOrderId: number | null;
  public selectedCandidate: any | null;
  public selectedReOrder: any | null;
  public filters: AgencyOrderFilters = {
    includeReOrders: true,
  };
  public filterColumns = AgencyOrderFiltersComponent.generateFilterColumns();
  public OrderFilterFormGroup: FormGroup = AgencyOrderFiltersComponent.generateFiltersForm();
  public columnsToExport: ExportColumn[];
  public fileName: string;
  public defaultFileName: string;
  public isRowScaleUp = true;
  public isSubrowDisplay = false;
  public ordersPage: AgencyOrderManagementPage;
  public AgencyOrderManagementTabs = AgencyOrderManagementTabs;
  public isLockMenuButtonsShown = true;
  public orderTypes = OrderType;
  public selectedRowRef: any;
  public openDetailsTab = false;
  public targetElement: HTMLElement | null = document.body.querySelector('#main');
  public isMobile = false;
  public isSmallDesktop = false;
  private orderPerDiemId: number | null;
  private prefix: string | null;
  private orderId: number | null;
  private redirectFromPerDiem = false;
  private orderManagementPagerState: OrderManagementPagerState | null;

  private isAlive = true;
  private selectedIndex: number | null;
  private unsubscribe$: Subject<void> = new Subject();
  private pageSubject = new Subject<number>();
  private alertOrderId:number;

  constructor(
    private store: Store,
    private location: Location,
    private actions$: Actions,
    private datePipe: DatePipe,
    private filterService: FilterService,
    private orderManagementAgencyService: OrderManagementAgencyService,
    private breakpointService: BreakpointObserverService,
    @Inject(GlobalWindow) protected readonly globalWindow : WindowProxy & typeof globalThis,
    private router: Router
  ) {
    super();
    this.listenRedirectFromExtension();
  }

  ngOnInit(): void {
    this.getAlertOrderId();
    this.getDeviceScreen();
    this.onOrderPreviewChange();
    this.onAgencyChange();
    this.onChildDialogChange();
    this.getLocationState();
    this.onReloadOrderCandidatesLists();
    this.onExportSelectedSubscribe();
    this.idFieldName = 'orderId';

    this.search$.pipe(takeUntil(this.unsubscribe$), debounceTime(300)).subscribe((value: string) => {
      if (value.length >= 2) {
        this.OrderFilterFormGroup.controls['jobTitle'].setValue(value);
        this.onFilterApply();
      } else if (value.length === 0 && this.filters.jobTitle?.length) {
        this.OrderFilterFormGroup.controls['jobTitle'].setValue('');
        this.onFilterApply();
      }
    });

    this.ordersPage$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.ordersPage = data;
      super.setHeightForMobileGrid(data?.items.length);
      this.reOrderNumber.emit(data?.items[0]?.reOrderCount || 0);
      if(this.ordersPage?.items){
        this.alertOrderId= this.ordersPage.items.find((i) => i.orderId === this.alertOrderId)
        ? this.alertOrderId
        : 0;
        if(this.alertOrderId>0 ){
          this.ordersPage.items= this.ordersPage.items.filter(x=>x.orderId===this.alertOrderId);
          this.gridWithChildRow.dataSource=this.ordersPage.items;
          this.onRowClick({data:this.ordersPage.items[0],isInteracted:false})
        }
      }
    });

    this.subscribeOnPageChanges();
    this.onTabChange();
    this.onCommentRead();
    this.listenRedirectFromPerDiem();
    this.listenRedirectFromReOrder();
    this.getPreservedFiltersByPageName();
  }

  ngOnDestroy(): void {
    this.store.dispatch(new ResetPageFilters());
    this.orderManagementAgencyService.selectedOrderAfterRedirect = null;
    this.isAlive = false;
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private onCommentRead(): void {
    this.actions$
      .pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(UpdateGridCommentsCounter))
      .subscribe((data) => {
        if (data.orderId && this.selectedRowRef) {
          this.selectedRowRef.data.unreadComments -= data.readComments;
          this.gridWithChildRow.setRowData(data.orderId, this.selectedRowRef.data);
        }
      });
  }

  public onExportSelectedSubscribe(): void {
    this.onExportClicked$
      .pipe(takeUntil(this.unsubscribe$), filter(Boolean))
      .subscribe((event: any) => this.exportSelected(event));
  }
  public getAlertOrderId():void{
    this.alertOrderId = JSON.parse((localStorage.getItem('OrderId') || '0')) as number;
    (!this.alertOrderId)?this.alertOrderId=0:""
    window.localStorage.setItem("OrderId", JSON.stringify(""));
    if(this.alertOrderId>0)
      this.openDetailsTab = true;
  }

  public override customExport(): void {
    this.defaultFileName = `Order Management/${this.selectedTab} ` + this.generateDateTime(this.datePipe);
    this.fileName = this.defaultFileName;
    this.store.dispatch(new ShowExportDialog(true));
  }

  public closeExport(): void {
    this.clearSelection(this.gridWithChildRow);
    this.fileName = '';
    this.store.dispatch(new ShowExportDialog(false));
  }

  public export(event: ExportOptions): void {
    this.defaultExport(event.fileType, event);
  }

  public override defaultExport(fileType: ExportedFileType, options?: ExportOptions): void {
    this.defaultFileName = `Order Management/${this.selectedTab} ` + this.generateDateTime(this.datePipe);
    let filtersExport = {...this.filters};
    if(this.filters.orderLocked){
      filtersExport.orderLocked = filtersExport.orderLocked == 'false' ? false : filtersExport.orderLocked == 'true' ? true : null
    }
    this.store.dispatch(
      new ExportAgencyOrders(
        new ExportPayload(
          fileType,
          {
            filtersExport,
            offset: Math.abs(new Date().getTimezoneOffset()),
            isAgency: this.selectedTab === AgencyOrderManagementTabs.ReOrders ? true : null,
            ids: this.selectedItems.length ? this.selectedItems.map((val) => val[this.idFieldName]) : null,
          },
          options ? options.columns.map((val) => val.column) : this.columnsToExport.map((val) => val.column),
          null,
          options?.fileName || this.defaultFileName
        ),
        this.selectedTab
      )
    );
    this.closeExport();
  }

  public onDataBound(): void {
    this.subrowsState.clear();
    if (this.previousSelectedOrderId) {
      this.currentPage = this.orderManagementPagerState?.page ?? this.currentPage;
      const [data, index] = this.store.selectSnapshot(OrderManagementState.lastSelectedOrder)(
        this.previousSelectedOrderId
      );
      if (data && !isUndefined(index)) {
        this.gridWithChildRow.selectRow(index);
        this.onRowClick({ data });
      }
    }
    if (this.selectedIndex) {
      this.gridWithChildRow.selectRow(this.selectedIndex);
    }
    this.contentLoadedHandler();

    this.openPerDiemDetails();
    this.openMyAgencyTabWithCandidate();
  }

  private openMyAgencyTabWithCandidate(): void {
    const { selectedOrderAfterRedirect } = this.orderManagementAgencyService;
    if (selectedOrderAfterRedirect && this.ordersPage) {
      const orderMyAgency = this.ordersPage.items.find(
        (order: AgencyOrderManagement) => order.publicId === selectedOrderAfterRedirect.orderId
      );
      if (orderMyAgency) {
        const candidate = orderMyAgency.children.find(
          (candidate: OrderManagementChild) => candidate.candidateId === selectedOrderAfterRedirect.candidateId
        );

        this.onOpenCandidateDialog(candidate as OrderManagementChild, orderMyAgency);
        this.orderManagementAgencyService.selectedOrderAfterRedirect = null;
        this.gridWithChildRow.detailRowModule.expand(0);
      }
    }
  }

  /* Trigger when user redirect to per diem order from re-order */
  private openPerDiemDetails(): void {
    if ((this.orderPerDiemId || this.orderId) && this.ordersPage) {
      const orderPerDiem = this.ordersPage.items.find(
        (order: AgencyOrderManagement) => order.publicId === this.orderPerDiemId || order.publicId === this.orderId
      );

      if (orderPerDiem) {
        const index = (this.gridWithChildRow.dataSource as Order[])?.findIndex(
          (order: Order) => order.publicId === this.orderPerDiemId || order.publicId === this.orderId
        );
        this.onRowClick({ data: orderPerDiem });
        this.gridWithChildRow.selectRow(index);
      }
      this.orderId = this.prefix = this.orderPerDiemId = null;
    }
  }

  private listenRedirectFromReOrder(): void {
    this.orderManagementAgencyService.orderPerDiemId$
      .pipe(
        debounceTime(50),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data: { id: number; prefix: string }) => {
        this.orderPerDiemId = data.id;
        this.prefix = data.prefix;
        this.filters.orderPublicId = this.prefix + '-' + this.orderPerDiemId;
        this.OrderFilterFormGroup.controls['orderPublicId'].setValue(
          (this.prefix + '-' + (this.orderPerDiemId || this.orderId))?.toString()
        );
        this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns);
        this.filteredItems$.next(this.filteredItems.length);
        this.dispatchNewPage();
      });
  }

  public onRowsDropDownChanged(): void {
    if (this.pageSize !== parseInt(this.activeRowsPerPageDropDown)) {
      this.pageSize = parseInt(this.activeRowsPerPageDropDown);
      this.pageSettings = { ...this.pageSettings, pageSize: this.pageSize };
      this.dispatchNewPage();
    }
  }

  public setDefaultFilters(statuses: string[]): void {
    if (this.orderManagementPagerState?.filters) { // apply preserved filters by redirecting back from the candidate profile
      this.filters = { ...this.orderManagementPagerState?.filters };
      this.patchFilterForm(!!this.filters?.regionIds?.length);
      this.prepopulateFilterFormStructure();
      this.dispatchNewPage();
      return;
    }

    const preservedFiltes = this.store.selectSnapshot(
      PreservedFiltersState.preservedFiltersByPageName
    ) as PreservedFiltersByPage<AgencyOrderFilters>;

    if (!preservedFiltes.isNotPreserved) {
      const { state } = preservedFiltes;
      const orderStatuses = Array.isArray(state.orderStatuses) ? [...state.orderStatuses] : [];
      const filterState = { ...state, orderStatuses };
      const filterFormConfig = GetAgencyFilterFormConfig(this.selectedTab);
      this.filters = this.filterService.composeFilterState(filterFormConfig, filterState);
      if(this.Organizations != null){
        this.OrderFilterFormGroup.get('organizationIds')?.setValue([...this.Organizations]);
        this.filters.organizationIds = (this.Organizations.length > 0) ? this.Organizations : undefined;
      }
      if(this.orderStatus != null && this.orderStatus.length > 0){
        this.OrderFilterFormGroup.get('orderStatuses')?.setValue([...this.orderStatus]);
        this.filters.orderStatuses = this.orderStatus.length > 0 ? this.orderStatus : undefined;
      }
      this.patchFilterForm(!!this.filters?.regionIds?.length);
      this.prepopulateFilterFormStructure();
      this.dispatchNewPage();
      return;
    }
    const { selectedOrderAfterRedirect } = this.orderManagementAgencyService;
    if (this.redirectFromPerDiem || selectedOrderAfterRedirect) {
      this.redirectFromPerDiem = false;
      selectedOrderAfterRedirect && this.selectedTab && this.dispatchNewPage();
    } else {
      this.setDefaultStatuses(statuses, preservedFiltes.dispatch);
    }
  }

  private prepopulateFilterFormStructure(): void {
    this.organizationStructure$
      .pipe(
        debounceTime(100),
        filter((data) => !!data?.length),
        take(1)
      )
      .subscribe(() => {
        if (this.filters.regionIds) {
          this.OrderFilterFormGroup.get('regionIds')?.setValue([...this.filters.regionIds]);
        }
        if (this.filters.locationIds) {
          this.OrderFilterFormGroup.get('locationIds')?.setValue([...this.filters.locationIds]);
        }
        if (this.filters.departmentsIds) {
          this.OrderFilterFormGroup.get('departmentsIds')?.setValue([...this.filters.departmentsIds]);
        }
        if(this.Organizations.length > 0){
          this.OrderFilterFormGroup.get('organizationIds')?.setValue((this.Organizations.length > 0) ? this.Organizations : undefined);
          this.filters.organizationIds = (this.Organizations.length > 0) ? this.Organizations : undefined;
        }
        this.generateFilterChips();
        this.dispatchNewPage();
      });
  }

  private setDefaultStatuses(statuses: string[], setDefaultFilters: boolean): void {
    if(this.Organizations.length > 0){
      this.OrderFilterFormGroup.get('organizationIds')?.setValue((this.Organizations.length > 0) ? this.Organizations : undefined);
      this.filters.organizationIds = (this.Organizations.length > 0) ? this.Organizations : undefined;
    }
    if (setDefaultFilters) {
      let Status = [FilterOrderStatusText.Open, FilterOrderStatusText['In Progress'], FilterOrderStatusText.Filled];
      const statuse = this.filterColumns.orderStatuses.dataSource.filter((f: FilterOrderStatusText) =>
        Status.includes(f)
      );
      setTimeout(() => {
          this.OrderFilterFormGroup.get('orderStatuses')?.setValue(this.orderStatus.length > 0 ? this.orderStatus : statuses);
          this.filters.orderStatuses = this.orderStatus.length > 0 ? this.orderStatus : statuse;
          this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns, this.datePipe);
          for (let i = 0; i < this.filteredItems.length; i++) {
            if (this.filteredItems[i].text == undefined) {
              this.filteredItems[i].text = this.filteredItems[i].value;
            }
          }
          this.filteredItems$.next(this.filteredItems.length);
          this.dispatchNewPage();
      }, 500);
    } else {
      setTimeout(() => {
        this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns, this.datePipe);
        this.dispatchNewPage();
      }, 500);
    }
  }

  private onTabChange(): void {
    this.ordersTab$
      .pipe(
        debounceTime(100),
        takeUntil(this.unsubscribe$),
        tap((selected) => {
          const { selectedOrderAfterRedirect } = this.orderManagementAgencyService;
          this.selectedTab = selected;
          if (!selectedOrderAfterRedirect) {
            this.onGridCreated();
          }
          this.clearFilters();
          this.store.dispatch(new ClearOrders());
          this.selectedIndex = null;
          if (this.orderPerDiemId || this.orderId) {
            this.filters.orderPublicId = this.prefix + '-' + this.orderPerDiemId;
            this.OrderFilterFormGroup.controls['orderPublicId'].setValue(
              (this.prefix + '-' + (this.orderPerDiemId || this.orderId))?.toString()
            );
            this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns);
            this.filteredItems$.next(this.filteredItems.length);
          }
          this.store.dispatch(new GetAgencyFilterOptions());
        })
      )
      .subscribe();
  }

  public override updatePage(): void {
    this.dispatchNewPage();
  }

  private dispatchNewPage(): void {
    const { selectedOrderAfterRedirect } = this.orderManagementAgencyService;
    this.filters.orderBy = this.orderBy;

    switch (this.selectedTab) {
      case AgencyOrderManagementTabs.MyAgency:
        this.filters.includeReOrders = true;
        let filtersMyAgency = {...this.filters};
          if(this.filters.orderLocked){
            filtersMyAgency.orderLocked = filtersMyAgency.orderLocked == 'false' ? false : filtersMyAgency.orderLocked == 'true' ? true : null
          }
        this.hasOrderMyAgencyId();
        selectedOrderAfterRedirect?.orderType !== OrderType.ReOrder &&
          this.store.dispatch(new GetAgencyOrdersPage(this.currentPage, this.pageSize, filtersMyAgency));
        break;
      case AgencyOrderManagementTabs.PerDiem:
        this.filters.orderTypes = [OrderType.OpenPerDiem];
        this.filters.includeReOrders = true;
        let filtersOpenPerDiem = {...this.filters};
          if(this.filters.orderLocked){
            filtersOpenPerDiem.orderLocked = filtersOpenPerDiem.orderLocked == 'false' ? false : filtersOpenPerDiem.orderLocked == 'true' ? true : null
          }
        this.store.dispatch(new GetAgencyOrdersPage(this.currentPage, this.pageSize, filtersOpenPerDiem));
        break;
      case AgencyOrderManagementTabs.PermPlacement:
        this.filters.orderTypes = [OrderType.PermPlacement];
        this.filters.includeReOrders = false;
        let filtersPermPlacement = {...this.filters};
          if(this.filters.orderLocked){
            filtersPermPlacement.orderLocked = filtersPermPlacement.orderLocked == 'false' ? false : filtersPermPlacement.orderLocked == 'true' ? true : null
          }
        this.store.dispatch(new GetAgencyOrdersPage(this.currentPage, this.pageSize, filtersPermPlacement));
        break;
      case AgencyOrderManagementTabs.ReOrders:
        this.hasOrderMyAgencyId();
        this.filters.includeReOrders = false;
        this.filters.orderTypes = [OrderType.ReOrder];
        this.store.dispatch(new GetAgencyOrdersPage(this.currentPage, this.pageSize, this.filters));
        break;
      default:
        this.hasOrderMyAgencyId();
        this.filters.includeReOrders = false;
        let filtersDefault = {...this.filters};
          if(this.filters.orderLocked){
            filtersDefault.orderLocked = filtersDefault.orderLocked == 'false' ? false : filtersDefault.orderLocked == 'true' ? true : null
          }
        this.store.dispatch(new GetAgencyOrdersPage(this.currentPage, this.pageSize, filtersDefault));
        break;
    }

    this.checkSelectedChildrenItem();
  }

  public onGridCreated(): void {
    switch (this.selectedTab) {
      case AgencyOrderManagementTabs.MyAgency:
        this.isLockMenuButtonsShown = true;
        this.refreshGridColumns(MyAgencyOrdersColumnsConfig, this.gridWithChildRow);
        break;
      case AgencyOrderManagementTabs.PerDiem:
        this.isLockMenuButtonsShown = true;
        this.refreshGridColumns(PerDiemColumnsConfig, this.gridWithChildRow);
        break;
      case AgencyOrderManagementTabs.PermPlacement:
        this.isLockMenuButtonsShown = true;
        this.refreshGridColumns(PermPlacementColumnsConfig, this.gridWithChildRow);
        break;
      case AgencyOrderManagementTabs.ReOrders:
        this.isLockMenuButtonsShown = false;
        this.refreshGridColumns(ReOrdersColumnsConfig, this.gridWithChildRow);
        break;
      default:
        this.isLockMenuButtonsShown = true;
        this.refreshGridColumns(MyAgencyOrdersColumnsConfig, this.gridWithChildRow);
        break;
    }
  }

  public onCompare(): void {
    this.openCandidat.next(true);
  }

  public onRowClick(event: RowSelectEventArgs): void {
    if (event.target) {
      this.orderManagementAgencyService.excludeDeployed = false;
      this.orderManagementAgencyService.setIsAvailable(false);
    }

    const rowData = event.data as AgencyOrderManagement;
    const pageSettings = { page: this.currentPage, pageSize: this.pageSize, filters: this.filters };

    this.store.dispatch(new SetOrderManagementPagerState(pageSettings));

    this.rowSelected(event, this.gridWithChildRow);

    if (rowData.orderType === this.orderTypes.OpenPerDiem) {
      this.getReOrdersByOrderId(rowData.orderId, rowData.organizationId);
    }

    if (!event.isInteracted && rowData.orderId) {
      this.selectedOrder = rowData;
      const options = this.getDialogNextPreviousOption(rowData);
      this.store.dispatch(new GetOrderById(rowData.orderId, rowData.organizationId, options));
      this.openPreview.next(true);
      const Action = rowData.irpOrderMetadata ? GetIrpOrderCandidates : GetAgencyOrderCandidatesList;

      this.store.dispatch(
        new Action(
          rowData.orderId,
          rowData.organizationId,
          GRID_CONFIG.initialPage,
          GRID_CONFIG.initialRowsPerPage,
          rowData.irpOrderMetadata
            ? this.orderManagementAgencyService.getIsAvailable()
            : this.orderManagementAgencyService.excludeDeployed,
          ""
        )
      );

      this.orderPositionSelected$.next(false);
      this.selectedIndex = Number(event.rowIndex);
    }

    this.checkSelectedChildrenItem();
    if (!isArray(event.data)) {
      this.selectedRowRef = event;
    }
  }

  public onRowDeselect(event: any, grid: any) {
    this.rowDeselected(event, grid);
    this.checkSelectedChildrenItem();
  }

  public setRowHighlight(args: RowDataBoundEventArgs & { data: AgencyOrderManagement }): void {
    const [colors] = Object.values(STATUS_COLOR_GROUP);
    if (colors.includes(args.data.statusText)) {
      args.row?.classList.add('e-success-row');
    }
  }

  public onRowScaleUpClick(): void {
    this.isRowScaleUp = false;
    this.rowHeight = ROW_HEIGHT.SCALE_UP_HEIGHT;
    this.isSubrowDisplay = false;
  }

  public onRowScaleDownClick(): void {
    this.isRowScaleUp = true;
    this.rowHeight = ROW_HEIGHT.SCALE_DOWN_HEIGHT;
    this.isSubrowDisplay = false;
  }

  public onNextPreviousOrderEvent(next: boolean): void {
    const [index] = this.gridWithChildRow.getSelectedRowIndexes();
    const nextIndex = next ? index + 1 : index - 1;
    this.gridWithChildRow.selectRow(nextIndex);
  }

  public onOpenReorderDialog(reOrder: AgencyOrderManagement, order: AgencyOrderManagement): void {
    this.selectedReOrder = reOrder;
    this.selectedReOrder.selected = {
      order: order.orderId || order.id,
      reOrder: reOrder.orderId || reOrder.id,
    };
    this.clearSelection(this.gridWithChildRow);
    this.store.dispatch(new GetOrderById(reOrder.orderId || (reOrder.id as number), order.organizationId));
    this.store.dispatch(
      new GetAgencyOrderCandidatesList(
        reOrder.orderId || (reOrder.id as number),
        order.organizationId,
        this.currentPage,
        this.pageSize,
        this.orderManagementAgencyService.excludeDeployed
      )
    );

    this.selectedOrder = reOrder;
    this.selectedIndex = null;
    this.openPreview.next(true);
  }

  public selectReOrder(event: { reOrder: AgencyOrderManagement; order: Order | AgencyOrderManagement }): void {
    const tabSwitchAnimation = 400;
    const tabId = Object.values(AgencyOrderManagementTabs).indexOf(AgencyOrderManagementTabs.ReOrders);
    this.selectTab.emit(tabId);
    setTimeout(() => {
      this.detailsDialog.tab.select(0);
    }, tabSwitchAnimation);
  }

  public onOpenCandidateDialog(candidate: OrderManagementChild, order: AgencyOrderManagement): void {
    this.selectedCandidate = candidate;
    this.selectedCandidate.selected = {
      order: order.orderId,
      positionId: candidate.positionId,
    };
    this.selectedOrder = order;
    this.store.dispatch(
      new GetAgencyOrderCandidatesList(
        order.orderId || (order.id as number),
        order.organizationId,
        this.currentPage,
        this.pageSize,
        this.orderManagementAgencyService.excludeDeployed
      )
    );
    this.orderPositionSelected$.next(true);
    const options = this.getDialogNextPreviousOption(order);
    this.store.dispatch(new GetOrderById(order.orderId, order.organizationId, options));
    this.openChildDialog.next([order, candidate]);
    this.selectedIndex = null;
  }

  public expandAll(): void {
    this.isSubrowDisplay = true;
    this.ordersPage.items.forEach((item: AgencyOrderManagement, index: number): void => {
      super.onSubrowAllToggle(index + 1);
    });
  }

  public collapseAll(): void {
    this.isSubrowDisplay = false;
    super.onSubrowAllToggle();
  }

  // Filter
  public onFilterClose() {
    this.patchFilterForm();
  }

  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.OrderFilterFormGroup, this.filterColumns);
    this.OrderFilterFormGroup.markAsDirty();
  }

  private clearFilters(): void {
    this.OrderFilterFormGroup.reset();
    this.filteredItems = [];
    this.currentPage = this.orderManagementPagerState?.page ?? 1;
    this.filters = {
      includeReOrders: true,
    };
    this.filteredItems$.next(this.filteredItems.length);
  }

  private patchFilterForm(prepopulate = false): void {
    this.OrderFilterFormGroup.setValue({
      orderPublicId: this.filters.orderPublicId || null,
      regionIds: (!prepopulate && this.filters.regionIds) || [],
      locationIds: (!prepopulate && this.filters.locationIds) || [],
      departmentsIds: (!prepopulate && this.filters.departmentsIds) || [],
      skillIds: this.filters.skillIds || [],
      orderTypes:
        this.selectedTab === AgencyOrderManagementTabs.PerDiem ||
        this.selectedTab === AgencyOrderManagementTabs.ReOrders ||
        this.selectedTab === AgencyOrderManagementTabs.PermPlacement
          ? []
          : this.filters.orderTypes || [],
      jobTitle: this.filters.jobTitle || null,
      billRateFrom: this.filters.billRateFrom || null,
      billRateTo: this.filters.billRateTo || null,
      openPositions: this.filters.openPositions || null,
      jobStartDate: this.filters.jobStartDate || null,
      jobEndDate: this.filters.jobEndDate || null,
      candidateStatuses: this.filters.candidateStatuses || [],
      candidatesCountFrom: this.filters.candidatesCountFrom || null,
      candidatesCountTo: this.filters.candidatesCountTo || null,
      organizationIds: this.filters.organizationIds || [],
      orderStatuses: this.filters.orderStatuses || [],
      annualSalaryRangeFrom: this.filters.annualSalaryRangeFrom || null,
      annualSalaryRangeTo: this.filters.annualSalaryRangeTo || null,
      creationDateFrom: this.filters.creationDateFrom || null,
      creationDateTo: this.filters.creationDateTo || null,
      distributedOnFrom: this.filters.distributedOnFrom || null,
      distributedOnTo: this.filters.distributedOnTo || null,
      candidateName: this.filters.candidateName || null,
      projectTypeIds: this.filters.projectTypeIds || null,
      projectNameIds: this.filters.projectNameIds || null,
      poNumberIds: this.filters.poNumberIds || null,
      shift:this.filters.shift || null,
      orderLocked:this.filters.orderLocked || null,
    });

    if(!prepopulate) {
      this.generateFilterChips();
    }
  }

  private checkSelectedChildrenItem(): void {
    const hasSelectedItemChildren = this.selectedItems.some((itm) => itm.children.length !== 0);
    const hasSelectedChildReorders = this.selectedItems.some((itm) => itm.reOrders?.length !== 0);

    switch (this.selectedTab) {
      case AgencyOrderManagementTabs.MyAgency:
        if (this.selectedItems.length === 0) {
          this.columnsToExport = [...myAgencyColumnsToExport, ...myAgencyChildColumnsToExport];
          return;
        }
        this.columnsToExport = hasSelectedItemChildren
          ? [...myAgencyColumnsToExport, ...myAgencyChildColumnsToExport]
          : myAgencyColumnsToExport;
        break;
      case AgencyOrderManagementTabs.PerDiem:
        if (this.selectedItems.length === 0) {
          this.columnsToExport = [...perDiemColumnsToExport, ...perDiemChildColumnsToExport];
          return;
        }
        this.columnsToExport = hasSelectedChildReorders
          ? [...perDiemColumnsToExport, ...perDiemChildColumnsToExport]
          : perDiemColumnsToExport;
        break;
      case AgencyOrderManagementTabs.ReOrders:
        if (this.selectedItems.length === 0) {
          this.columnsToExport = [...reOrdersColumnsToExport, ...reOrdersChildColumnToExport];
          return;
        }
        this.columnsToExport = hasSelectedItemChildren
          ? [...reOrdersColumnsToExport, ...reOrdersChildColumnToExport]
          : reOrdersColumnsToExport;
        break;
    }
  }

  public onFilterClearAll(): void {
    this.orderManagementAgencyService.selectedOrderAfterRedirect = null;
    this.store.dispatch(new ClearPageFilters(this.getPageName()));
    this.clearFilters();
    this.dispatchNewPage();
  }

  public onFilterApply(): void {
    if (this.OrderFilterFormGroup.dirty) {
      this.filters = this.OrderFilterFormGroup.getRawValue();
      this.filters.orderPublicId = this.filters.orderPublicId?.toUpperCase() || null;
      this.filters.billRateFrom = this.filters.billRateFrom || null;
      this.filters.billRateTo = this.filters.billRateTo || null;
      this.filters.jobStartDate = this.filters.jobStartDate || null;
      this.filters.jobEndDate = this.filters.jobEndDate || null;
      this.filters.annualSalaryRangeFrom = this.filters.annualSalaryRangeFrom || null;
      this.filters.annualSalaryRangeTo = this.filters.annualSalaryRangeTo || null;
      this.filters.candidatesCountFrom = this.filters.candidatesCountFrom || null;
      this.filters.candidatesCountTo = this.filters.candidatesCountTo || null;
      this.filters.openPositions = this.filters.openPositions || null;
      this.filters.regionIds = this.filters.regionIds || [];
      this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns);
      this.dispatchNewPage();
      this.store.dispatch(new ShowFilterDialog(false));
      this.filteredItems$.next(this.filteredItems.length);
      this.saveFiltersByPageName();
      this.OrderFilterFormGroup.markAsPristine();
    } else {
      this.store.dispatch(new ShowFilterDialog(false));
    }
  }
  // End - Filter

  private listenRedirectFromExtension(): void {
    this.orderManagementAgencyService.orderId$
      .pipe(takeUntil(this.unsubscribe$), filter(Boolean), debounceTime(300))
      .subscribe((data: { id: number; prefix: string }) => {
        this.orderId = data.id;
        this.prefix = data.prefix;
        this.clearFilters();
        this.filters.orderPublicId = this.prefix + '-' + this.orderId;
        this.OrderFilterFormGroup.controls['orderPublicId'].setValue(this.prefix + '-' + this.orderId);
        this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns);
        this.filteredItems$.next(this.filteredItems.length);
        // if(this.Organizations != null){
        //   this.OrderFilterFormGroup.get('organizationIds')?.setValue([...this.Organizations]);
        // }
        this.dispatchNewPage();
      });
  }

  private listenRedirectFromPerDiem(): void {
    this.orderManagementAgencyService.reorderId$
      .pipe(takeUntil(this.unsubscribe$), filter(Boolean), debounceTime(300))
      .subscribe((data: { id: number; prefix: string }) => {
        this.orderId = data.id;
        this.prefix = data.prefix;
        this.redirectFromPerDiem = true;
        this.clearFilters();
        this.filters.orderPublicId = this.prefix + '-' + this.orderId;
        this.OrderFilterFormGroup.controls['orderPublicId'].setValue(this.prefix + '-' + this.orderId);
        if(this.Organizations != null){
          this.OrderFilterFormGroup.get('organizationIds')?.setValue([...this.Organizations]);
        }
        this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns);
        this.filteredItems$.next(this.filteredItems.length);
        this.dispatchNewPage();
      });
  }

  private onOrderPreviewChange(): void {
    this.openPreview.pipe(takeWhile(() => this.isAlive)).subscribe((isOpen) => {
      if (!isOpen) {
        this.openCandidat.next(false);
        this.clearSelection(this.gridWithChildRow);
        this.previousSelectedOrderId = null;
        this.orderManagementPagerState = null;
        this.selectedIndex = null;
        const table = document.getElementsByClassName('e-virtualtable')[0] as HTMLElement;
        if (table) {
          table.style.transform = 'translate(0px, 0px)';
        }
      } else {
        this.openDetailsTab = false;
        if(this.alertOrderId>0)
          this.openDetailsTab = true;
        this.openChildDialog.next(false);
        this.selectedCandidate = null;
        if (this.selectedReOrder?.selected.reOrder !== this.selectedOrder.orderId) {
          this.selectedReOrder = null;
        }
      }
    });
  }

  private onChildDialogChange(): void {
    this.openChildDialog.pipe(takeWhile(() => this.isAlive)).subscribe((isOpen) => {
      if (!isOpen) {
        this.selectedCandidate = null;
      } else {
        this.openPreview.next(false);
        this.clearSelection(this.gridWithChildRow);
      }
    });
  }

  private getDialogNextPreviousOption(selectedOrder: AgencyOrderManagement): DialogNextPreviousOption {
    const gridData = this.gridWithChildRow.dataSource as AgencyOrderManagement[];
    const first = gridData[0];
    const last = gridData[gridData.length - 1];
    return {
      previous: first.orderId !== selectedOrder.orderId,
      next: last.orderId !== selectedOrder.orderId,
    };
  }

  private onAgencyChange(): void {
    this.lastSelectedAgencyId$
      .pipe(
        takeWhile(() => this.isAlive),
        skip(1)
      )
      .subscribe(() => {
        this.openPreview.next(false);
        this.openCandidat.next(false);
        this.clearFilters();
        this.getPreservedFiltersByPageName();
        this.store.dispatch(new GetAgencyFilterOptions());
      });
  }

  private onReloadOrderCandidatesLists(): void {
    this.actions$
      .pipe(
        ofActionSuccessful(ReloadOrderCandidatesLists),
        takeWhile(() => this.isAlive)
      )
      .subscribe(() => {
        this.store
          .dispatch(new GetAgencyOrdersPage(this.currentPage, this.pageSize, this.filters)).pipe(
          takeWhile(() => this.isAlive)
        ).subscribe((data) => {
            const order = data.agencyOrders.ordersPage.items.find(
              (item: AgencyOrderManagement) => item.orderId === this.selectedOrder.orderId
            );
            if (order) {
              this.onRowClick({ data: order, rowIndex: this.selectedIndex ?? undefined });
            }
          });
      });
  }

  private hasOrderMyAgencyId(): void {
    const { selectedOrderAfterRedirect } = this.orderManagementAgencyService;
    if (selectedOrderAfterRedirect) {
      this.OrderFilterFormGroup.patchValue({
        orderPublicId: selectedOrderAfterRedirect.prefix + '-' + selectedOrderAfterRedirect.orderId.toString(),
      });
      this.filters = this.OrderFilterFormGroup.getRawValue();
      this.filters.includeReOrders = false;
      this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns);
      this.filteredItems$.next(this.filteredItems.length);

      if (selectedOrderAfterRedirect.orderType === OrderType.ReOrder) {
        this.filters.orderTypes = [OrderType.ReOrder];
      }
    }
  }

  private subscribeOnPageChanges(): void {
    this.pageSubject.pipe(debounceTime(1),takeUntil(this.unsubscribe$)).subscribe((page: number) => {
      this.currentPage = page;
      this.dispatchNewPage();
    });
  }

  public gridPageChanged(page: number) {
    this.pageSubject.next(page);
  }

  public gridPerPageChanged(perPage: number) {
    this.pageSize = perPage;
    this.pageSubject.next(1);
    this.isSubrowDisplay = false;
  }

  private getDeviceScreen(): void {
    this.breakpointService
      .getBreakpointMediaRanges()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((screen) => {
        this.isMobile = screen.isMobile;
        this.isSmallDesktop = screen.isDesktopSmall;
      });
  }

  private getLocationState(): void {
    const locationState = this.location.getState() as { orderId: number,  orderManagementPagerState: OrderManagementPagerState | null };
    this.previousSelectedOrderId = locationState.orderId;
    this.orderManagementPagerState = locationState?.orderManagementPagerState;
    this.pageSize = this.orderManagementPagerState?.pageSize ?? this.pageSize;
  }

  private getPageName(): FilterPageName {
    return FilterPageName.OrderManagementVMSAgency;
  }

  private generateFilterChips(): void {
    this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns, this.datePipe);
    for (let i = 0; i < this.filteredItems.length; i++) {
      if (this.filteredItems[i].text == undefined) {
        this.filteredItems[i].text = this.filteredItems[i].value;
      }
    }
    this.filteredItems$.next(this.filteredItems.length);
  }

  private saveFiltersByPageName(): void {
    const filters = { ...this.filters, orderTypes: [] };
    this.store.dispatch(new SaveFiltersByPageName(this.getPageName(), filters));
  }

  private getPreservedFiltersByPageName(): void {
    this.store.dispatch(new GetPreservedFiltersByPage(this.getPageName()));
  }

  private getReOrdersByOrderId(orderId: number, organizationId: number): void {
    const pageNumber = GRID_CONFIG.initialPage;
    const pageSize = GRID_CONFIG.initialRowsPerPage;

    this.store.dispatch(new GetReOrdersByOrderId(orderId, pageNumber, pageSize, organizationId))
      .pipe(take(1))
      .subscribe(() => {
        this.store.dispatch(new SaveReOrderPageSettings(pageNumber, pageSize, true));
      });
  }
}
