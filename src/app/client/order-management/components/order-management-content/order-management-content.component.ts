import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  Inject,
  ChangeDetectionStrategy,
  NgZone,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DOCUMENT, DatePipe, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { MatMenuTrigger } from '@angular/material/menu';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
  ColDef,
  ColumnApi,
  GridApi,
  GridOptions,
  GridReadyEvent,
  Module,
  RowNode,
  RowSelectedEvent,
  SortChangedEvent,
} from '@ag-grid-community/core';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { FieldSettingsModel, FilteringEventArgs, MultiSelectComponent } from '@syncfusion/ej2-angular-dropdowns';
import { DetailRowService, GridComponent, RowSelectEventArgs, VirtualScrollService } from '@syncfusion/ej2-angular-grids';
import { SelectionSettingsModel, TextWrapSettingsModel } from '@syncfusion/ej2-grids/src/grid/base/grid-model';
import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';
import { MenuEventArgs } from '@syncfusion/ej2-angular-navigations';
import { isArray, isUndefined } from 'lodash';
import isNil from 'lodash/fp/isNil';
import {
  catchError,
  debounceTime,
  delay,
  EMPTY,
  filter,
  Observable,
  of,
  Subject,
  take,
  takeUntil,
  throttleTime,
  map,
  distinctUntilChanged,
  tap,
  switchMap,
  skip,
  combineLatest,
} from 'rxjs';

import { ORDERS_GRID_CONFIG } from '@client/client.config';
import { AddEditReorderService } from '@client/order-management/components/add-edit-reorder/add-edit-reorder.service';
import {
  OrderDetailsDialogComponent,
} from '@client/order-management/components/order-details-dialog/order-details-dialog.component';
import {
  OrderManagementService,
} from '@client/order-management/components/order-management-content/order-management.service';
import {
  TabNavigationComponent,
} from '@client/order-management/components/order-management-content/tab-navigation/tab-navigation.component';
import { ReOpenOrderService } from '@client/order-management/components/reopen-order/reopen-order.service';
import { OrderGridSystemStateService } from '@client/order-management/containers/irp-container/services/order-grid-system-state.service';
import {
  ApproveOrder,
  ClearOrderFilterDataSources,
  ClearOrders,
  ClearSelectedOrder,
  DeleteOrder,
  DeleteOrderSucceeded,
  DuplicateOrder,
  DuplicateOrderSuccess,
  ExportIRPOrders,
  ExportOrders,
  ExportOrdersJourney,
  GetAgencyOrderCandidatesList,
  GetAvailableSteps,
  GetAllShifts,
  GetIrpOrderCandidates,
  GetIRPOrders,
  GetOrderById,
  GetOrderByIdSucceeded,
  GetOrderFilterDataSources,
  GetOrders,
  GetOrdersJourney,
  GetOrganisationCandidateJob,
  GetProjectSpecialData,
  GetSelectedOrderById,
  LockUpdatedSuccessfully,
  ReloadOrganisationOrderCandidatesLists,
  SelectNavigationTab,
  SetLock,
  UpdateRegRateSucceeded,
  GetOrderComments,
  ClearPredefinedBillRates,
  GetIrpOrderExtensionCandidates,
  SaveClearToStart,  
} from '@client/store/order-managment-content.actions';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { SettingsHelper } from '@core/helpers/settings.helper';
import { Permission } from '@core/interface';
import { Actions, ofActionDispatched, ofActionSuccessful, Select, Store } from '@ngxs/store';
import {
  GetAssignedSkillsByOrganization,
  GetOrganizationById,
  GetOrganizationSettings,
} from '@organization-management/store/organization-management.actions';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { UpdateGridCommentsCounter } from '@shared/components/comments/store/comments.actions';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { GRID_EMPTY_MESSAGE } from '@shared/components/grid/constants/grid.constants';
import { SearchComponent } from '@shared/components/search/search.component';
import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';
import {
  DELETE_RECORD_TEXT, DELETE_RECORD_TITLE, GRID_CONFIG, OrganizationSettingKeys, OrganizationalHierarchy, ViewOrderIRP_PERMISSION, ViewOrderVMS_PERMISSION
} from '@shared/constants';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { MessageTypes } from '@shared/enums/message-types';
import { DeletedStatus, OrderStatus } from '@shared/enums/order-management';
import {
  OrderManagementIRPSystemId,
  OrderManagementIRPTabs,
  OrderManagementIRPTabsIndex,
  OrganizationOrderManagementTabs,
  orderLockList,
  clearedToStartList,
  orderDistributionList,
} from '@shared/enums/order-management-tabs.enum';
import { FilterIrpOrderTypes, OrderType, OrderTypeOptions, VmsOrderTypeTooltipMessage } from '@shared/enums/order-type';
import { SettingsKeys } from '@shared/enums/settings';
import { SidebarDialogTitlesEnum } from '@shared/enums/sidebar-dialog-titles.enum';
import {
  CandidatesStatusText,
  FilterOrderStatusText,
  LocalStorageStatus,
  STATUS_COLOR_GROUP,
} from '@shared/enums/status';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { ButtonModel } from '@shared/models/buttons-group.model';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { FilteredItem } from '@shared/models/filter.model';
import {
  FilterOrderStatus,
  FilterStatus,
  IRPOrderManagement,
  IRPOrderPosition,
  IRPOrderPositionpage,
  Order,
  OrderCandidateJob,
  OrderFilter,
  OrderFilterDataSource,
  OrderJourneyFilter,
  OrderManagement,
  OrderManagementChild,
  OrderManagementPage,
  OrdersJourneyPage,
  clearToStartDataset,
} from '@shared/models/order-management.model';
import { Configuration } from '@shared/models/organization-settings.model';
import {
  Organization,
  OrganizationDepartment,
  OrganizationLocation,
  OrganizationRegion,
  OrganizationStructure,
} from '@shared/models/organization.model';
import { ProjectSpecialData } from '@shared/models/project-special-data.model';
import { Skill } from '@shared/models/skill.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { FilterService } from '@shared/services/filter.service';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import { FilterColumnTypeEnum } from 'src/app/dashboard/enums/dashboard-filter-fields.enum';
import {
  SetHeaderState,
  SetHelpSystem,
  ShowCloseOrderDialog,
  ShowExportDialog,
  ShowFilterDialog,
  ShowSideDialog,
  ShowToast,
} from 'src/app/store/app.actions';
import { PreservedFiltersState } from 'src/app/store/preserved-filters.state';
import { UserState } from 'src/app/store/user.state';
import { PermissionService } from '../../../../security/services/permission.service';
import { AppState } from '../../../../store/app.state';
import {
  allOrdersChildColumnsToExport,
  AllOrdersColumnsConfig,
  allOrdersColumnsToExport,
  irpAllOrdersColumnsToExport,
  irpIncompleteOrdersColumnsToExport,
  irpLTAOrdersColumnsToExport,
  irpPerDiemOrdersColumnsToExport,
  MoreMenuType,
  orderJourneyColumnsToExport,
  orderTemplateColumnsConfig,
  perDiemChildColumnsToExport,
  PerDiemColumnsConfig,
  perDiemColumnsToExport,
  PermPlacementColumnsConfig,
  permPlacementColumnsToExport,
  reOrdersChildColumnToExport,
  ReOrdersColumnsConfig,
  reOrdersColumnsToExport,
  ROW_HEIGHT,
} from './order-management-content.constants';
import {
  GetOrderFilterDatesInUts,
  OrderManagementIrpGridHelper,
  OrderManagementIrpSubrowHelper,
  PrepareOrderFilterDates,
} from '@client/order-management/helpers';
import {
  AllOrdersDefaultStatuses,
  DetectActiveSystem,
  GetVMSFilterFormConfig,
  GetIRPFilterFormConfig,
  IRPTabRequestTypeMap,
  IRPTabsConfig,
  PerDiemDefaultStatuses,
  ReorderCandidateStatuses,
  ReorderDefaultStatuses,
  StatusesByDefault,
  SystemGroupConfig,
  ThreeDotsMenuOptions,
  ThreeDotsMenuOptionsIRP,
  initOrderManagementFilterColumns,
  AllCandidateStatuses,
  OrderManagementFilterDates,
  OrderJourneyFilterDates,
} from '@client/order-management/constants';
import { MobileMenuItems } from '@shared/enums/mobile-menu-items.enum';
import { BreakpointObserverService } from '@core/services';
import { ResizeObserverModel, ResizeObserverService } from '@shared/services/resize-observer.service';
import { MiddleTabletWidth, SmallDesktopWidth, TabletWidth } from '@shared/constants/media-query-breakpoints';
import { UpdateRegRateComponent } from '../update-reg-rate/update-reg-rate.component';
import { FilteredUser } from '@shared/models/user.model';
import { Comment } from '@shared/models/comment.model';
import { GlobalWindow } from '@core/tokens';
import { AlertIdEnum } from '@admin/alerts/alerts.enum';
import { SetOrderManagementPagerState } from '@agency/store/candidate.actions';
import { OrderManagementPagerState } from '@shared/models/candidate.model';
import { PreservedFiltersByPage } from '@core/interface/preserved-filters.interface';
import { FilterPageName } from '@core/enums/filter-page-name.enum';
import * as PreservedFilters from 'src/app/store/preserved-filters.actions';
import { OutsideZone } from '@core/decorators';
import { PreservedOrderService } from '@client/order-management/services/preserved-order.service';
import { GetReOrdersByOrderId, SaveReOrderPageSettings } from
  '@shared/components/order-reorders-container/store/re-order.actions';
import { ScheduleShift } from '@shared/models/schedule-shift.model';
import { ORDER_MASTER_SHIFT_NAME_LIST } from '@shared/constants/order-master-shift-name-list';
import { ReOrderState } from '@shared/components/order-reorders-container/store/re-order.state';
import { ButtonGroupComponent } from '@shared/components/button-group/button-group.component';
import { OrderLinkDetails } from '@client/order-management/interfaces';
import { CurrentUserPermission } from '@shared/models/permission.model';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { IrpEmployeeToggleState } from '@shared/components/order-candidate-list/interfaces';
import { OrderManagementIRPRowPositionService } from '@shared/components/grid/cell-renderers/order-management-irp-row-position/order-management-irp-row-position.service';
import { OrderJobType } from '@shared/enums';
import { OrganizationSettingsService } from '@shared/services/organization-settings.service';
import { resetAgGridHorizontalScroll } from '@core/helpers/grid-scroll.helper';
import { SettingsViewService } from '@shared/services';

@Component({
  selector: 'app-order-management-content',
  templateUrl: './order-management-content.component.html',
  styleUrls: ['./order-management-content.component.scss'],
  providers: [VirtualScrollService, DetailRowService, MaskedDateTimeService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderManagementContentComponent extends AbstractPermissionGrid implements OnInit, OnDestroy {
  @ViewChild('grid') override gridWithChildRow: GridComponent;
  @ViewChild('search') search: SearchComponent;
  @ViewChild('detailsDialog') detailsDialog: OrderDetailsDialogComponent;
  @ViewChild('tabNavigation') tabNavigation: TabNavigationComponent;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  @ViewChild('updaterateRow') updaterateRow: UpdateRegRateComponent;
  @ViewChild('systemGroup') systemGroup: ButtonGroupComponent;

  @ViewChild('exportTooLargeWarning') exportWarning: DialogComponent;

  @ViewChild('orderStatusFilter') public readonly orderStatusFilter: MultiSelectComponent;
  selectedCandidateforIRP: IRPOrderPosition;
  selectedCandidateforIRPorderDetails: IRPOrderPosition;
  DeployedEmployeeConfigValue: boolean;
  deployedState: boolean;
  public allOrdersChildColumnsToExport:ExportColumn[] = allOrdersChildColumnsToExport;
  public clearedtoStartWidget: boolean = false;

  @HostListener('window:wheel', ['$event'])
  onScroll() {
    if (this.trigger) {
      this.trigger.closeMenu();
    }
  }

  @Select(OrderManagementContentState.ordersPage)
  ordersPage$: Observable<OrderManagementPage>;

  @Select(OrderManagementContentState.selectedOrder)
  selectedOrder$: Observable<Order>;

  @Select(OrderManagementContentState.orderFilterDataSources)
  orderFilterDataSources$: Observable<OrderFilterDataSource>;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  @Select(UserState.organizationStructure)
  organizationStructure$: Observable<OrganizationStructure>;

  @Select(OrganizationManagementState.assignedSkillsByOrganization)
  skills$: Observable<Skill[]>;

  @Select(OrganizationManagementState.organizationSettings)
  organizationSettings$: Observable<Configuration[]>;

  @Select(UserState.currentUserPermissions)
  currentUserPermissions$: Observable<CurrentUserPermission[]>;

  @Select(OrderManagementContentState.candidatesJob)
  private readonly candidatesJob$: Observable<OrderCandidateJob | null>;

  @Select(PreservedFiltersState.preservedFiltersByPageName)
  private readonly preservedFiltersByPageName$: Observable<PreservedFiltersByPage<OrderFilter>>;

  @Select(OrderManagementContentState.ordersJourneyPage)
  ordersJourneyPage$: Observable<OrdersJourneyPage>;

  @Select(OrderManagementContentState.getAllShifts)
  private getAllShifts$: Observable<ScheduleShift[]>;

  @Select(OrderManagementContentState.orderComments)
  private orderComments$: Observable<Comment[]>;

  @Select(OrganizationManagementState.organization)
  private organization$: Observable<Organization | null>;

  @Select(OrderManagementContentState.projectSpecialData)
  public readonly projectSpecialData$: Observable<ProjectSpecialData>;

  @Select(OrderManagementContentState.irpCandidatesforExtension)
  public getIrpCandidatesforExtension$ : Observable<IRPOrderPositionpage>

  public readonly specialProjectCategoriesFields: FieldSettingsModel = { text: 'projectType', value: 'id' };
  public readonly contactPersonFields: FieldSettingsModel = { text: 'fullName', value: 'email' };
  public readonly projectNameFields: FieldSettingsModel = { text: 'projectName', value: 'id' };
  public readonly shiftNameFields: FieldSettingsModel = { text: 'name', value: 'id' };
  public readonly poNumberFields: FieldSettingsModel = { text: 'poNumber', value: 'id' };
  public readonly targetElement: HTMLElement | null = document.body.querySelector('#main');
  public readonly shiftFields: FieldSettingsModel = { text: 'name', value: 'id' };
  public OrganizationIRPTabs = OrderManagementIRPTabs;
  public settings: { [key in SettingsKeys]?: Configuration };
  public SettingsKeys = SettingsKeys;
  public allowWrap = ORDERS_GRID_CONFIG.isWordWrappingEnabled;
  public wrapSettings: TextWrapSettingsModel = ORDERS_GRID_CONFIG.wordWrapSettings;
  public showFilterForm = false;
  public isLockMenuButtonsShown = true;
  public resizeObserver: ResizeObserverModel;
  public navigationPanelWidth: string;
  public orderComments: Comment[] = [];
  public orgpendingOrderapproval: string = "";
  private openInProgressFilledStatuses = ['open', 'in progress', 'filled', 'custom step'];
  public optionFields = {
    text: 'name',
    value: 'id',
  };
  public skillsFields = {
    text: 'skillDescription',
    value: 'id',
  };
  public statusFields = {
    text: 'statusText',
    value: 'status',
  };
  public filterStatusFields = {
    text: 'filterStatus',
    value: 'filterStatus',
  };
  private unsubscribe$: Subject<void> = new Subject();
  private pageSubject = new Subject<number>();
  private search$ = new Subject();
  public selectedDataRow: OrderManagement | IRPOrderManagement;

  public hasCreateEditOrderPermission: boolean;
  public selectedOrder: Order;
  public openDetails = new Subject<boolean>();
  public orderPositionSelected$ = new Subject<{ state: boolean; index?: number }>();
  public selectionOptions: SelectionSettingsModel = {
    type: 'Multiple',
    mode: 'Row',
    checkboxMode: 'ResetOnRowClick',
    persistSelection: true,
  };
  public OrderFilterFormGroup: FormGroup;
  public OrderJourneyFilterFormGroup: FormGroup;
  public filters: OrderFilter = {};
  public filtersOrderJourney: OrderJourneyFilter = {
  };
  public filterColumns: any;
  public filterOrderJourneyColumns: any;
  public orgStructure: OrganizationStructure;
  public regions: OrganizationRegion[] = [];
  public previousSelectedOrderId: number | null;
  public selectedCandidate: any | null;
  public selectedReOrder: any | null;
  public openChildDialog = new Subject<any>();
  public closeChildDialog = new Subject<any>();
  public isRowScaleUp = true;
  public isSubrowDisplay = false;
  public OrganizationOrderManagementTabs = OrganizationOrderManagementTabs;
  public OrderManagementIRPTabsIndex = OrderManagementIRPTabsIndex;
  public orderStatus = OrderStatus;
  public deletedStatus = DeletedStatus;
  public reOrderCount$ = new Subject<number>();
  public orderTypes = OrderType;
  public orderTypeTooltipMessage = VmsOrderTypeTooltipMessage;
  public canCreateOrder: boolean;
  public canOrderJourney: boolean=false;
  public canCloseOrder: boolean;
  public importDialogEvent: Subject<boolean> = new Subject<boolean>();
  public activeIRPtabs: OrderManagementIRPTabs
    = OrderManagementIRPTabs.AllOrders;
  public OrderManagementIRPSystemId = OrderManagementIRPSystemId;
  public activeTab: OrganizationOrderManagementTabs
    = OrganizationOrderManagementTabs.AllOrders;
  public activeIRPTabIndex: OrderManagementIRPTabsIndex = OrderManagementIRPTabsIndex.AllOrders;
  public isIRPFlagEnabled = false;
  public systemGroupConfig: ButtonModel[];
  public activeSystem: OrderManagementIRPSystemId;
  public tabsListConfig: TabsListConfig[] = IRPTabsConfig;
  public columnDefs: ColDef[] = [];
  public threeDotsMenuOptions: Record<string, ItemModel[]>;
  public context: { componentParent: OrderManagementContentComponent };
  public gridOptions: GridOptions;
  public readonly modules: Module[] = [ClientSideRowModelModule];
  public readonly gridEmptyMessage = GRID_EMPTY_MESSAGE;

  private selectedCandidateMeta: { order: number; positionId: number } | null;
  private selectedIndex: number | null;
  private ordersPage: OrderManagementPage;

  public columnsToExport: ExportColumn[];

  public fileName: string;
  public defaultFileName: string;
  public selectedRowRef: any;
  public selectedRowIndex: number | null;

  public isOrgIRPEnabled = false;
  public isOrgVMSEnabled = false;

  public isMobile = false;
  public isTablet = false;
  public isSmallDesktop = false;
  public isDesktop = false;
  public isContentTabletWidth = false;
  public isMiddleTabletWidth = false;
  public isContentSmallDesktop = false;
  public gridDomLayout: 'normal' | 'autoHeight' | 'print' | undefined;
  public openregrateupdate = false;
  public CurrentOrderDatas: any = [];
  public PerDiemOrderDatas: any = [];
  public filteredUsers: FilteredUser[] = [];
  public userSearch$ = new Subject<FilteringEventArgs>();

  private isRedirectedFromDashboard: boolean;
  private isRedirectedFromVmsSystem = false;
  private orderStaus: number;
  private numberArr: number[] = [];

  private previousSelectedSystemId: OrderManagementIRPSystemId | null;
  private isRedirectedFromToast: boolean;
  private quickOrderId: number;
  private orderPerDiemId: number | null;
  private prefix: string | null;
  private orderId: number | null;
  private creatingReorder = false;
  private filterApplied = false;
  private isIncomplete = false;
  private redirectFromPerdiem = false;
  private cd$ = new Subject();
  private gridApi: GridApi;
  private columnApi: ColumnApi;
  private SelectedStatus: string[] = [];
  private candidateStatusId: string;
  private candidateStatusIds: string[] = [];
  private SelectedCandiateStatuses: any[] = [];
  private eliteOrderId: number;
  private orderPublicId:string;
  private alertTitle: string;
  private orderManagementPagerState: OrderManagementPagerState | null;
  private orderPositionStatus: string | null;
  private organizationId: number;
  private employeeToggleState: IrpEmployeeToggleState;
  public isCondidateTab: boolean = false;
  public OrderJourney: any[] = [];
  public canCreateOrderIRP:boolean;
  public canEditOrderIRP:boolean;
  public canViewOrderIRP:boolean;
  public canViewOrderVMS:boolean;
  public canCloseOrderIRP:boolean;
  public CanEditOrderBillRateIRP:boolean;
  public threeDotsMenuOptionsIRP:Record<string, ItemModel[]>;
  public shift = ORDER_MASTER_SHIFT_NAME_LIST;
  public orderLockList = orderLockList;
  public clearedToStartList = clearedToStartList
  public orderDistributionList = orderDistributionList;
  private ltaOrderFlag: boolean|null = false;
  public reorderFilledStatus:boolean = false
  private isShowVMSPositions:boolean=false;
  public redirectedvmsorderfromsystemcolumn:number;
  public redirectedIrporder:number | null;
  public redirectedfromnotification:boolean=false;
  public eliteOrderPublicId:number;
  public redirecttovmsfromIRP:boolean=true;
  public redirecttoIRPfromVMS:boolean=true;
  public isOrderDetailsTab: boolean = false;
  public orderData: IRPOrderPosition;
  public irpSubOrder: Order;
  public systemType: string;
  public redirectfromextension: boolean = false;
  public node: { data: IRPOrderManagement; }

  private get contactEmails(): string | null {
    if (Array.isArray(this.filters?.contactEmails)) {
      return this.filters?.contactEmails[0];
    } else {
      return this.filters?.contactEmails || null;
    }
  }
  public filterType: string = 'Contains';
  public orderDetail =new Subject<OrderManagement>();
  public isEnableClearedToStart:boolean = false;
  public clearToStartDataset:clearToStartDataset = new clearToStartDataset();

  constructor(
    protected override store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private actions$: Actions,
    private confirmService: ConfirmService,
    private filterService: FilterService,
    private datePipe: DatePipe,
    private location: Location,
    private readonly actions: Actions,
    private orderManagementService: OrderManagementService,
    private orderManagementContentService: OrderManagementContentService,
    private addEditReOrderService: AddEditReorderService,
    private reOpenOrderService: ReOpenOrderService,
    private permissionService: PermissionService,
    private cd: ChangeDetectorRef,
    private ngZone: NgZone,
    private breakpointService: BreakpointObserverService,
    private preservedOrderService: PreservedOrderService,
    private ordergridsystemstateservice:OrderGridSystemStateService,
    public orderManagementIRPRowPositionService: OrderManagementIRPRowPositionService,
    private organizationSettingService : OrganizationSettingsService,
    private settingService: SettingsViewService,
    @Inject(DOCUMENT) private documentEle: Document,
    @Inject(GlobalWindow) protected readonly globalWindow: WindowProxy & typeof globalThis,
  ) {
    super(store);
    this.context = { componentParent: this };
    this.gridOptions = OrderManagementIrpSubrowHelper.configureOrderGridSubRowOptions(this.context);
    this.isIRPFlagEnabled = this.store.selectSnapshot(AppState.isIrpFlagEnabled);
    const routerState = this.router.getCurrentNavigation()?.extras?.state;
    if(routerState!=null &&routerState?.['irpActiveTab']!=null){
      this.globalWindow.localStorage.setItem("IRPActiveTab", JSON.stringify(routerState?.['irpActiveTab']));
      this.activeIRPTabIndex =parseInt(routerState?.['irpActiveTab'])
    }
    this.isRedirectedFromDashboard = routerState?.['redirectedFromDashboard'] || false;
    this.orderStaus = routerState?.['orderStatus'] || 0;
    this.isRedirectedFromToast = routerState?.['redirectedFromToast'] || false;
    this.quickOrderId = routerState?.['publicId'];
    this.prefix = routerState?.['prefix'];
    this.orderPositionStatus = routerState?.['status'];
    (routerState?.['status'] == "In Progress (Pending)" || routerState?.['status'] == "In Progress (Accepted)") ? this.SelectedStatus.push("InProgress") : routerState?.['status'] == "In Progress" ? this.SelectedStatus.push("InProgress") : routerState?.['status'] ? this.SelectedStatus.push(routerState?.['status']) : "";
    this.candidateStatusId = routerState?.['candidateStatusId'] || '';
    routerState?.['candidateStatus'] != undefined && routerState?.['candidateStatus'] != '' ? this.SelectedCandiateStatuses.push(routerState?.['candidateStatus']) : "";
    store.dispatch(new SetHeaderState({ title: 'Order Management', iconName: 'file-text' }));
    this.OrderFilterFormGroup = this.orderManagementService.createFilterForm();
    this.OrderJourneyFilterFormGroup = this.orderManagementService.createOrderJourneyFilterForm();
    this.ltaOrderFlag = JSON.parse(localStorage.getItem('ltaorderending') || 'false') as boolean;
  }

  public get isActiveSystemIRP(): boolean {
    return this.isIRPFlagEnabled && this.activeSystem === this.OrderManagementIRPSystemId.IRP;
  }

  get smallMenu(): any[] {
    let menu: { text: string }[] = [];
    if (!this.isMobile && this.isContentTabletWidth) {
      menu = [...menu, { text: MobileMenuItems.Filters }];
    }

    if (!this.isActiveSystemIRP || !this.canCreateOrder || !this.userPermission[this.userPermissions.CanCreateOrders]) {
      menu = [...menu, { text: MobileMenuItems.Import }];
    }
    if (
      this.activeTab !== OrganizationOrderManagementTabs.OrderTemplates &&
      this.activeTab !== OrganizationOrderManagementTabs.Incomplete
    ) {
      menu = [
        ...menu,
        { text: MobileMenuItems.ExportExel },
        { text: MobileMenuItems.ExportCSV },
        { text: MobileMenuItems.ExportCustom },
      ];
    }
    return menu;
  }

  override ngOnInit(): void {
    this.eliteOrderId = JSON.parse((localStorage.getItem('OrderId') || '0')) as number;
    this.orderPublicId = JSON.parse((localStorage.getItem('OrderPublicId') || '""')) as string;
    (!this.eliteOrderId) ? this.eliteOrderId = 0 : "";
    (!this.orderPublicId)?this.orderPublicId='':"";
    window.localStorage.setItem("OrderId", JSON.stringify(""));
    window.localStorage.setItem("OrderPublicId", JSON.stringify(""));
    this.getalerttitle();
    super.ngOnInit();

    this.watchForEmployeeToggleState();

    this.getDeviceScreen();
    this.initResizeObserver();
    this.listenParentContainerWidth();
    this.watchForPermissions();
    this.orderFilterColumnsSetup();

    this.onOrganizationStructureDataLoadHandler();
    this.onDuplicateOrderSucceededHandler();
    this.onDeleteOrderSucceededHandler();
    this.onApproveOrderHandler();

    this.onSelectedOrderDataLoadHandler();

    this.getLocationState();

    this.onGridPageChangedHandler();
    this.onOrganizationChangedHandler();
    this.onOrdersDataLoadHandler();
    this.getAllShifts();

    this.onOrderDetailsDialogOpenEventHandler();
    this.onOrderFilterControlValueChangedHandler();
    this.onSkillDataLoadHandler();
    this.onReloadOrderCandidatesLists();
    this.onChildDialogChange();
    this.onLockUpdatedSucceededHandler();
    this.listenRedirectFromReOrder();
    this.onCommentRead();
    this.listenRedirectFromExtension();
    this.listenRedirectFromPerDiem();
    this.subscribeForSettings();
    this.handleRedirectFromQuickOrderToast();
    this.showFilterFormAfterOpenDialog();
    this.subscribeOnPermissions();
    this.subscribeOnChanges();
    this.firstInitGridColumns();
    this.OnUpdateRegrateSucceededHandler();
    this.subscribeOnUserSearch();
    this.watchForUpdateCandidate();
    this.preservedOrderHandler();
    let isIrpEnabled = JSON.parse(localStorage.getItem('ISIrpEnabled') || '"false"') as boolean;;
    if (isIrpEnabled === true) {
      this.systemGroupConfig = SystemGroupConfig(true, false, OrderManagementIRPSystemId.IRP);
      this.activeSystem = OrderManagementIRPSystemId.IRP;
      this.store.dispatch(new SetHelpSystem(true));
      this.getPreservedFiltersByPage();
      this.orderManagementService.setOrderManagementSystem(this.activeSystem);
      this.setOrderTypesFilterDataSource();
      this.clearFilters();
      this.initMenuItems();
      this.initGridColumns();
      this.getOrders();
    }
    this.watchForOrderFromAnotherSystem();
    this.watchForOrderGridSystemClickEvent();
    this.watchForOrderFromNotification();
    this.watchForOrderIRPSubRowClickEvent();
    this.subscribeForDeployedEmployees();
    this.watchForDeployedState();
    this.checkEnableClearToStart();
  }

  public checkEnableClearToStart(): void {
    this.isEnableClearedToStart = false;
    if(this.activeTab == OrganizationOrderManagementTabs.AllOrders){
        this.settingService
            .getViewSettingKey(
              OrganizationSettingKeys.EnableClearedToStartForAcceptedCandidates,
              OrganizationalHierarchy.Organization,
              this.organizationId,
              this.organizationId,
              false,
            ).pipe(takeUntil(this.unsubscribe$))
              .subscribe(({ EnableClearedToStartForAcceptedCandidates }) => {
                this.isEnableClearedToStart = JSON.parse(EnableClearedToStartForAcceptedCandidates);
                this.checkSelectedChildrenItem();
              });
    }
      
  }

  ngOnDestroy(): void {
    this.orderManagementService.selectedOrderAfterRedirect = null;
    this.store.dispatch([
      new PreservedFilters.ResetPageFilters(),
      new ClearPredefinedBillRates(),
      new ClearSelectedOrder(),
      new ClearOrders(),
    ]);
    this.resizeObserver.detach();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public getalerttitle(): void {
    this.alertTitle = JSON.parse(localStorage.getItem('alertTitle') || '""') as string;
    if (
      this.alertTitle.trim().toLowerCase() !=
        AlertIdEnum[AlertIdEnum['Candidate Level Comments']].trim().toLowerCase() ||
      this.alertTitle.trim().toLowerCase() ==
        AlertIdEnum[AlertIdEnum['Candidate Status Update: Cleared to Start']].trim().toLowerCase()
    ) {
      this.globalWindow.localStorage.setItem('alertTitle', JSON.stringify(''));
    }
    if (Object.values(AlertIdEnum).includes(this.alertTitle)) {
      if((this.alertTitle.trim()).toLowerCase()==AlertIdEnum[AlertIdEnum['Order Comments-IRP']].trim().toLowerCase()
       ||  (this.alertTitle.trim()).toLowerCase()==AlertIdEnum[AlertIdEnum['Order Status Update: Custom']].trim().toLowerCase()
       ||  (this.alertTitle.trim()).toLowerCase()==AlertIdEnum[AlertIdEnum['Order Status Update: Open']].trim().toLowerCase()
       ||  (this.alertTitle.trim()).toLowerCase()==AlertIdEnum[AlertIdEnum['Order Status Update: Closed']].trim().toLowerCase()
       ||  (this.alertTitle.trim()).toLowerCase()==AlertIdEnum[AlertIdEnum['Order public comments']].trim().toLowerCase()
       
      ){
        this.isOrderDetailsTab=true;
      }
      else
      {
      this.isCondidateTab = true;
    }
  }
  }
private watchForOrderGridSystemClickEvent()
{
   this.ordergridsystemstateservice.systemClickEvents.pipe(
    takeUntil(this.unsubscribe$)).subscribe(({system,order}) => {
    if(system === 'IRP'){
      this.RedirecttoIRPOrder(order);
    }
    else if(system === 'VMS'){
    this.RedirecttoVMSorder(order);
  }
})
}

public watchForOrderIRPSubRowClickEvent(){
  this.orderManagementIRPRowPositionService.handleStatusClickEvent.pipe(
    takeUntil(this.unsubscribe$)).subscribe(({Order, orderData, system}) => {
      this.orderData = orderData;
      this.irpSubOrder = Order;
      this.systemType = system;
    if(orderData.system === 'IRP' && Order.orderType === OrderType.LongTermAssignment){
      this.openIrpSubrowDetails(Order,orderData, system);
      this.subscribeToCandidateJob(true);
    }
})
}
public openIrpSubrowDetails(Order : Order, Data : IRPOrderPosition, system : string) {
  const orderData = Data as IRPOrderPosition;
  this.store.dispatch(new GetOrderById(orderData.orderId, orderData.organizationId));
  this.dispatchAgencyOrderCandidatesList(Order.id, Order.organizationId as number, true);
  this.openChildDialog.next([Order, Data, system]);
  this.orderPositionSelected$.next({ state: false });
  this.selectedRowRef = Data;
}

public watchForDeployedState(){
  this.orderManagementService.handleIncludeDeployedEvent.pipe(
    takeUntil(this.unsubscribe$)).subscribe(({checked}) => {
      this.deployedState = checked;
    });
  }


public watchForOrderFromNotification(){
	if ((AlertIdEnum[AlertIdEnum['Order Comments-IRP']].trim()).toLowerCase() == (this.alertTitle.trim()).toLowerCase()
   || (AlertIdEnum[AlertIdEnum['Upon Cancelling']].trim()).toLowerCase() == (this.alertTitle.trim()).toLowerCase()
   || (AlertIdEnum[AlertIdEnum['Communication Open Needs LTA order']].trim()).toLowerCase() == (this.alertTitle.trim()).toLowerCase()
   || (AlertIdEnum[AlertIdEnum['Communication Open Needs PerDiem order']].trim()).toLowerCase() == (this.alertTitle.trim()).toLowerCase()){
    this.systemGroupConfig = SystemGroupConfig(true, false, OrderManagementIRPSystemId.IRP);
    this.activeSystem = OrderManagementIRPSystemId.IRP;
    this.store.dispatch(new SetHelpSystem(true));
    this.redirectedfromnotification=true;
     this.onFilterClearAll();
  }
}
public RedirecttoVMSorder(order:Order)
{
  if(!this.canViewOrderVMS)
  {
    this.store.dispatch(new ShowToast(MessageTypes.Error, ViewOrderVMS_PERMISSION));
    this.redirecttovmsfromIRP=false;
    return;
  }
  this.activeSystem=OrderManagementIRPSystemId.VMS;
  this.systemGroupConfig = SystemGroupConfig(this.isOrgIRPEnabled, this.isOrgVMSEnabled, this.activeSystem, this.canOrderJourney);
  if(order.orderType === OrderType.ReOrder)
  {
    this.activeTab = OrganizationOrderManagementTabs.ReOrders;
  }
  this.OrderFilterFormGroup.markAsDirty();
  this.OrderFilterFormGroup.get('orderPublicId')?.setValue(order.publicId!.toString());
  this.onFilterApply();
  this.redirectedvmsorderfromsystemcolumn=order.id;

  this.isShowVMSPositions=true;
}
public RedirecttoIRPOrder(order:Order)
{
  if(!this.canViewOrderIRP){
    this.store.dispatch(new ShowToast(MessageTypes.Error, ViewOrderIRP_PERMISSION));
    this.redirecttoIRPfromVMS=false;
    return;
  }
  this.activeSystem=OrderManagementIRPSystemId.IRP;
  this.systemGroupConfig = SystemGroupConfig(this.isOrgIRPEnabled, this.isOrgVMSEnabled, this.activeSystem, this.canOrderJourney);
  this.redirectedIrporder=order.id;
  this.OrderFilterFormGroup.markAsDirty();
  this.OrderFilterFormGroup.get('orderPublicId')?.setValue(order.publicId!.toString());
  this.onFilterApply();
  this.globalWindow.localStorage.setItem("IsEmployeeTab", JSON.stringify(true));
}
  private preservedOrderHandler(): void {
    const pagerState = this.preservedOrderService.getPagerSate();
    if (pagerState) {
      this.currentPage = pagerState.page;
      this.pageSize = pagerState.pageSize;
      this.filters = pagerState.filters;

      this.activeTab = this.preservedOrderService.getActiveTab();
      this.activeIRPtabs = this.preservedOrderService.getIrpActiveTab();
      this.activeIRPTabIndex = this.preservedOrderService.findIrpTabIndex(this.activeIRPtabs);
    }

    this.preservedOrderService.getPreserveOrderStream()
      .pipe(skip(1), filter(() => !!this.gridWithChildRow.dataSource), debounceTime(1000), takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.preservedOrderService.applyGridState(this.gridWithChildRow);
        this.patchFilterForm();
      });
  }

  private subscribeOnChanges(): void {
    this.cd$.pipe(debounceTime(300), takeUntil(this.unsubscribe$)).subscribe(() => {
      this.cd.detectChanges();
    });
  }

  private subscribeOnPermissions(): void {
    this.permissionService.getPermissions().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((
      { canCreateOrder, canCloseOrder,canOrderJourney,canCreateOrderIRP,canCloseOrderIRP, CanEditOrderBillRateIRP}
    ) => {
      this.canCreateOrder = canCreateOrder;
      this.canCloseOrder = canCloseOrder;
      this.canOrderJourney = canOrderJourney;
      this.canCreateOrderIRP=canCreateOrderIRP;
      this.canCloseOrderIRP=canCloseOrderIRP;
      this.CanEditOrderBillRateIRP = CanEditOrderBillRateIRP;
      this.initMenuItems();
      this.cd$.next(true);
    });
  }

  private getUsersListBySearchTerm(args: FilteringEventArgs) {
    this.filterService.getUsersListBySearchTerm(args.text).pipe(
      tap((data) => {
        args.updateData(data);
      }),
      delay(300),
      takeUntil(this.unsubscribe$)
    ).subscribe(data => {
        this.filteredUsers = this.filterColumns.contactEmails.dataSource = data;
      }
      );
  }

  private subscribeOnUserSearch(): void {
    this.userSearch$.pipe(
      filter((args) => args.text.length > 2),
      tap((args) => {
        this.filterColumns.contactEmails.dataSource = [];
        args.updateData([]);
      }),
      debounceTime(300),
      takeUntil(this.unsubscribe$)
    ).subscribe((args) => {
      this.getUsersListBySearchTerm(args);
    });
  }

  public override customExport(): void {
    if (!this.validateExport()) {
      return;
    }

    if (this.isIRPFlagEnabled && this.activeSystem === OrderManagementIRPSystemId.IRP) {
      this.defaultFileName = `Organization Management/${this.activeIRPtabs} ` + this.generateDateTime(this.datePipe);
      this.fileName = this.defaultFileName;
      this.store.dispatch(new ShowExportDialog(true));
    } else {
      this.defaultFileName = `Organization Management/${this.activeTab} ` + this.generateDateTime(this.datePipe);
      this.fileName = this.defaultFileName;
      this.store.dispatch(new ShowExportDialog(true));
    }
  }

  public contactPersonFiltering(args: FilteringEventArgs): void {
    this.userSearch$.next(args);
  }

  public closeExport() {
    this.fileName = '';
    this.store.dispatch(new ShowExportDialog(false));
  }

  public export(event: ExportOptions): void {
    this.closeExport();
    this.defaultExport(event.fileType, event);
  }

  public override defaultExport(fileType: ExportedFileType, options?: ExportOptions): void {

    if (!this.validateExport()) {
      return;
    }

    if (this.isIRPFlagEnabled && this.activeSystem === OrderManagementIRPSystemId.IRP) {
      this.defaultFileName = `Order Management/${this.activeIRPtabs} ` + this.generateDateTime(this.datePipe);
      this.store.dispatch(
        new ExportIRPOrders(
          new ExportPayload(
            fileType,
            {
              ...this.filters,
              offset: Math.abs(new Date().getTimezoneOffset()),
              ids: this.gridApi.getSelectedRows().length ? this.gridApi.getSelectedRows().map((val) => val[this.idFieldName]) : null,
            },
            options ? options.columns.map((val) => val.column) : this.columnsToExport.map((val) => val.column),
            null,
            options?.fileName || this.defaultFileName
          ),
          this.activeIRPtabs
        )
      );
      this.clearSelection(this.gridWithChildRow);
    } else if (this.activeSystem === OrderManagementIRPSystemId.VMS) {
      let filtersExport = {...this.filters};
      if(this.activeTab === OrganizationOrderManagementTabs.ReOrders){
        let reorderCandidateStatuses:CandidatesStatusText[]=[];
        filtersExport.candidateStatuses?.forEach((candidatestatus:any)=>{
          reorderCandidateStatuses.push(CandidatesStatusText[candidatestatus] as any);
        })
       filtersExport.reorderCandidateStatuses=reorderCandidateStatuses;
      }
      if(this.filters.orderLocked){
        filtersExport.orderLocked = filtersExport.orderLocked == 'false' ? false : filtersExport.orderLocked == 'true' ? true : null
      }
      this.defaultFileName = `Organization Management/${this.activeTab} ` + this.generateDateTime(this.datePipe);
      this.store.dispatch(
        new ExportOrders(
          new ExportPayload(
            fileType,
            {
              ...filtersExport,
              offset: Math.abs(new Date().getTimezoneOffset()),
              isAgency: this.activeTab === OrganizationOrderManagementTabs.ReOrders ? false : null,
              ids: this.selectedItems.length ? this.selectedItems.map((val) => val[this.idFieldName]) : null,
            },
            options ? options.columns.map((val) => val.column) : this.columnsToExport.map((val) => val.column),
            null,
            options?.fileName || this.defaultFileName
          ),
          this.activeTab
        )
      );
      this.clearSelection(this.gridWithChildRow);
    } else {
      this.defaultFileName = `Order Journey` + this.generateDateTime(this.datePipe);
      this.store.dispatch(
        new ExportOrdersJourney(
          new ExportPayload(
            fileType,
            {
              ...this.filtersOrderJourney,
              offset: Math.abs(new Date().getTimezoneOffset()),
              ids: this.selectedItems.length ? this.selectedItems.map((val) => val[this.idFieldName]) : null,
            },
            options ? options.columns.map((val) => val.column) : this.columnsToExport.map((val) => val.column),
            null,
            options?.fileName || this.defaultFileName
          ),
        )
      );
    }
  }

  validateExport():boolean {
    if (this.activeSystem != OrderManagementIRPSystemId.OrderJourney &&
      this.ordersPage &&
      this.ordersPage?.totalCount > 8000) {
      this.exportWarning.show();
      return false;
    }
    return true;
  }

  public override updatePage(clearedFilters?: boolean): void {
    this.getOrders(clearedFilters);
  }

  public updatePageforbulk(): void {
    this.clearSelection(this.gridWithChildRow);
    this.getOrders(true);
    this.cd.markForCheck();
  }

  public onAddReorderClose(): void {
    if (
      this.activeTab === OrganizationOrderManagementTabs.AllOrders ||
      this.activeTab === OrganizationOrderManagementTabs.PerDiem
    ) {
      this.clearSelection(this.gridWithChildRow);
    }
  }

  public createReorder(data: OrderManagement): void {
    this.openReOrderDialog(data.id, data.organizationId);
    this.addEditReOrderService.setReOrderDialogTitle(SidebarDialogTitlesEnum.AddReOrder);
    this.creatingReorder = true;
    this.gridWithChildRow.selectRow(parseInt((data as OrderManagement & { index: string }).index));
  }

  public searchOrders(event: KeyboardEvent): void {
    const { value } = event.target as HTMLInputElement;
    const controlName =
      this.activeTab === OrganizationOrderManagementTabs.OrderTemplates ? 'templateTitle' : 'jobTitle';
    if (value.length >= 2) {
      this.OrderFilterFormGroup.controls[controlName].setValue(value);
      this.search$.next(value);
    } else if (value.length === 0 && this.filters[controlName]?.length) {
      this.OrderFilterFormGroup.controls[controlName].setValue('');
      this.search$.next(value);
    }
  }

  public getOrders(cleared?: boolean): void {
    this.filters.orderBy = this.orderBy;
    this.filters.orderPublicId = this.filters.orderPublicId ? this.filters.orderPublicId.toUpperCase() : null;
    this.filters.pageNumber = this.currentPage;
    this.filters.agencyType =
      this.filters.agencyType !== '0' ? parseInt(this.filters.agencyType as string, 10) || null : null;
    this.filters.pageSize = this.pageSize;
    this.isIncomplete = false;
    this.filters.orderDistributionType?this.filters.orderDistributionType:null;
    if (this.activeSystem === OrderManagementIRPSystemId.IRP) {
      let IsLTAOrders=  JSON.parse(localStorage.getItem('IsLTAOrders') || '"false"') as boolean;
      if(IsLTAOrders==true){
        this.filters.candidateStatuses =  []
        this.filters.orderStatuses = []
        this.filters.isQuickLinkWidgetLTA=true
        this.OrderFilterFormGroup.controls['candidateStatuses'].setValue([])
        this.OrderFilterFormGroup.controls['orderStatuses'].setValue([])
        this.store.dispatch(new ShowFilterDialog(false));
        this.onFilterClose()
      }
      if(this.redirectedfromnotification && this.eliteOrderPublicId){
        this.OrderFilterFormGroup.get('orderPublicId')?.setValue(this.eliteOrderPublicId.toString());
        this.filters.orderPublicId=this.eliteOrderPublicId.toString();
        this.redirectedfromnotification=!this.redirectedfromnotification;
        this.eliteOrderPublicId=0;
        this.isOrderDetailsTab=false;
      }
      this.filters.orderBy = this.orderBy;
      this.filters.pageNumber = this.currentPage;
      this.filters.pageSize = this.pageSize;
      if (this.activeIRPTabIndex !== OrderManagementIRPTabsIndex.AllOrders) {
        this.filters.orderTypes = Number.isInteger(IRPTabRequestTypeMap.get(this.activeIRPTabIndex)) ? [IRPTabRequestTypeMap.get(this.activeIRPTabIndex) as number] : [];
      }
      if (this.activeIRPTabIndex == OrderManagementIRPTabsIndex.AllOrders) {
        this.activeIRPtabs = OrderManagementIRPTabs.AllOrders
        this.columnsToExport = irpAllOrdersColumnsToExport;
      }
      if (this.activeIRPTabIndex == OrderManagementIRPTabsIndex.Lta) {
        this.activeIRPtabs = OrderManagementIRPTabs.LTA
        this.columnsToExport = irpLTAOrdersColumnsToExport;
      }
      if (this.activeIRPTabIndex == OrderManagementIRPTabsIndex.Incomplete) {
        this.activeIRPtabs = OrderManagementIRPTabs.Incomplete
        this.columnsToExport = irpIncompleteOrdersColumnsToExport;
      }
      if (this.activeIRPTabIndex == OrderManagementIRPTabsIndex.PerDiem) {
        this.activeIRPtabs = OrderManagementIRPTabs.PerDiem
        this.columnsToExport = irpPerDiemOrdersColumnsToExport;
      }
      if (this.activeIRPTabIndex == OrderManagementIRPTabsIndex.OrderTemplates) {
        this.activeIRPtabs = OrderManagementIRPTabs.OrderTemplates
        this.filters.isTemplate=true;
      }
      this.isIncomplete = (this.activeIRPTabIndex === OrderManagementIRPTabsIndex.Incomplete);
      this.orderManagementService.setOrderManagementSystem(this.activeSystem ?? OrderManagementIRPSystemId.IRP);
      cleared ? this.store.dispatch(new GetIRPOrders(this.filters)).pipe(takeUntil(this.unsubscribe$)).subscribe(()=>{
        this.globalWindow.localStorage.setItem("IsLTAOrders", JSON.stringify(false));
      }) : this.store.dispatch([new GetOrderFilterDataSources(true)]);
    } else if (this.activeSystem === OrderManagementIRPSystemId.VMS) {
      this.getVmsOrders(cleared);
    } else if (this.activeSystem === OrderManagementIRPSystemId.OrderJourney) {
      this.filtersOrderJourney.orderBy = this.orderBy;
      this.filtersOrderJourney.orderPublicId = this.filtersOrderJourney.orderPublicId ? this.filtersOrderJourney.orderPublicId.toUpperCase() : null;
      this.filtersOrderJourney.pageNumber = this.currentPage;
      this.filtersOrderJourney.pageSize = this.pageSize;
      this.isIncomplete = false;
      this.columnsToExport = orderJourneyColumnsToExport;
      this.store.dispatch([new GetOrdersJourney(this.filtersOrderJourney)]).pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe((data) => {
        this.OrderJourney = data;
      })
    }

    this.cd$.next(true);
  }

  private watchForEmployeeToggleState(): void {
    this.orderManagementService.getEmployeeToggleStateStream().pipe(
      takeUntil(this.unsubscribe$),
    ).subscribe((state: IrpEmployeeToggleState) => {
      this.employeeToggleState = {...state};
    })
  }

  private getVmsOrders(cleared?: boolean): void {
    switch (this.activeTab) {
      case OrganizationOrderManagementTabs.AllOrders:
        this.filters.isTemplate = false;
        this.filters.includeReOrders = true;
        if(this.ltaOrderFlag){
          this.filters.ltaOrder = true;
          this.globalWindow.localStorage.setItem("ltaorderending", JSON.stringify(false));
        }
        this.hasOrderAllOrdersId();
        let filtersAllOrders = {...this.filters};
        if(this.filters.orderLocked){
          filtersAllOrders.orderLocked = filtersAllOrders.orderLocked == 'false' ? false : filtersAllOrders.orderLocked == 'true' ? true : null
        }
        if(this.filters.clearedToStart){
          filtersAllOrders.clearedToStart = filtersAllOrders.clearedToStart == 'no' ? false : filtersAllOrders.clearedToStart == 'yes' ? true : null
        }
        cleared ? this.store.dispatch([new GetOrders(filtersAllOrders)])
          : this.store.dispatch([new GetOrderFilterDataSources()]);
        break;
      case OrganizationOrderManagementTabs.PerDiem:
        this.filters.orderTypes = [OrderType.OpenPerDiem];
        this.filters.includeReOrders = true;
        this.filters.isTemplate = false;
        let filtersPerDiem = {...this.filters};
        if(this.filters.orderLocked){
          filtersPerDiem.orderLocked = filtersPerDiem.orderLocked == 'false' ? false : filtersPerDiem.orderLocked == 'true' ? true : null
        }
        cleared ? this.store.dispatch([new GetOrders(filtersPerDiem)])
          : this.store.dispatch([new GetOrderFilterDataSources()]);
        break;
      case OrganizationOrderManagementTabs.PermPlacement:
        this.filters.orderTypes = [OrderType.PermPlacement];
        this.filters.isTemplate = false;
        let filtersPermPlacement = {...this.filters};
        if(this.filters.orderLocked){
          filtersPermPlacement.orderLocked = filtersPermPlacement.orderLocked == 'false' ? false : filtersPermPlacement.orderLocked == 'true' ? true : null
        }
        cleared ? this.store.dispatch([new GetOrders(filtersPermPlacement)])
          : this.store.dispatch([new GetOrderFilterDataSources()]);
        break;
      case OrganizationOrderManagementTabs.ReOrders:
        this.hasOrderAllOrdersId();
        this.filters.orderTypes = [OrderType.ReOrder];
        this.filters.isTemplate = false;
        cleared ? this.store.dispatch([new GetOrders(this.filters)])
          : this.store.dispatch([new GetOrderFilterDataSources()]);
        break;
      case OrganizationOrderManagementTabs.Incomplete:
        let incompleteColumns = [...allOrdersColumnsToExport];
        let assignmentIndex = incompleteColumns.findIndex(ele=>ele.column == 'AssignmentType');
        incompleteColumns.splice(assignmentIndex,1)
        this.columnsToExport = incompleteColumns;
        this.filters.isTemplate = false;
        this.isIncomplete = true;
        cleared ? this.store.dispatch([new GetOrders(this.filters, true)]) : this.store.dispatch([new GetOrderFilterDataSources()]);
        break;
      case OrganizationOrderManagementTabs.OrderTemplates:
        this.filters.isTemplate = true;
        cleared ? this.store.dispatch([new GetOrders(this.filters)]) : this.store.dispatch([new GetOrderFilterDataSources()]);
        break;
    }
    if(this.orderManagementService.getOrderManagementSystem() != OrderManagementIRPSystemId.IRP){
      this.orderManagementService.setOrderManagementSystem(this.activeSystem ?? OrderManagementIRPSystemId.VMS);
    }
    this.checkSelectedChildrenItem();
  }

  private getAllShifts(): void {
    this.store.dispatch(new GetAllShifts());
    this.getAllShifts$.pipe(takeUntil(this.unsubscribe$)).subscribe((state) => {
      if(state){
        this.filterColumns.shiftIds.dataSource = [{ name: 'Custom', id: 0 }, ...state];
      }
    });
  }

  public onFilterClose() {
    this.patchFilterForm();
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
    setTimeout(() => { this.orderStatusFilter?.refresh(); this.cd$.next(true); }, 300);
  }

  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.OrderFilterFormGroup, this.filterColumns);
    this.OrderFilterFormGroup.markAsDirty();
  }

  private ifFilteredByOrderTypeVMS(): boolean {
    return !this.isActiveSystemIRP && (this.activeTab === OrganizationOrderManagementTabs.PerDiem ||
      this.activeTab === OrganizationOrderManagementTabs.ReOrders ||
      this.activeTab === OrganizationOrderManagementTabs.PermPlacement);
  }

  private ifFilteredByOrderTypeIRP(): boolean {
    return this.isActiveSystemIRP && (this.activeIRPTabIndex !== OrderManagementIRPTabsIndex.AllOrders);
  }

  private patchFilterForm(prepopulate = false): void {
    this.OrderFilterFormGroup.setValue({
      orderPublicId: this.filters.orderPublicId || null,
      regionIds: this.filters.regionIds || [],
      locationIds: this.filters.locationIds || [],
      departmentsIds: this.filters.departmentsIds || [],
      skillIds: this.filters.skillIds || [],
      orderTypes:
        this.ifFilteredByOrderTypeVMS() || this.ifFilteredByOrderTypeIRP()
          ? []
          : this.filters.orderTypes || [],
      jobTitle: this.filters.jobTitle || null,
      billRateFrom: this.filters.billRateFrom || null,
      billRateTo: this.filters.billRateTo || null,
      openPositions: this.filters.openPositions || null,
      jobStartDate: this.filters.jobStartDate || null,
      jobEndDate: this.filters.jobEndDate || null,
      orderStatuses: this.filters.orderStatuses ? [...this.filters.orderStatuses] : [],
      candidateStatuses: this.filters.candidateStatuses || [],
      candidatesCountFrom: this.filters.candidatesCountFrom || null,
      candidatesCountTo: this.filters.candidatesCountTo || null,
      agencyIds: this.filters.agencyIds || [],
      agencyType: this.filters.agencyType ? String(this.filters.agencyType) : '0',
      templateTitle: this.filters.templateTitle || null,
      annualSalaryRangeFrom: this.filters.annualSalaryRangeFrom || null,
      annualSalaryRangeTo: this.filters.annualSalaryRangeTo || null,
      creationDateFrom: this.filters.creationDateFrom || null,
      creationDateTo: this.filters.creationDateTo || null,
      distributedOnFrom: this.filters.distributedOnFrom || null,
      distributedOnTo: this.filters.distributedOnTo || null,
      firstNamePattern: this.filters.firstNamePattern || null,
      lastNamePattern: this.filters.lastNamePattern || null,
      projectTypeIds: this.filters.projectTypeIds || null,
      projectNameIds: this.filters.projectNameIds || null,
      poNumberIds: this.filters.poNumberIds || null,
      contactEmails: this.contactEmails,
      shiftIds: this.filters.shiftIds || [],
      irpOnly: this.filters.irpOnly || null,
      reorderStatuses: this.filters.reorderStatuses || null,
      reOrderDate: this.filters.reOrderDate || null,
      shift:this.filters.shift || null,
      orderLocked:this.filters.orderLocked || null,
      clearedToStart:this.filters.clearedToStart || null,
      orderDistributionType:this.filters.orderDistributionType || null,
      showDeletedOrders: this.filters.showDeletedOrders || null
    });

    if (!prepopulate) {
      this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns, this.datePipe);
    }
  }

  private resetTabs(): void {
    this.activeIRPTabIndex = OrderManagementIRPTabsIndex.AllOrders;
    this.activeTab = OrganizationOrderManagementTabs.AllOrders;
    this.activeIRPtabs = this.OrganizationIRPTabs.AllOrders;
  }

  private clearFilters(): void {
    if(this.ltaOrderFlag){
      this.filters.ltaOrder = true;
    }
    this.OrderFilterFormGroup.reset();
    this.OrderFilterFormGroup.controls['agencyType'].setValue('0');
    this.filteredItems = [];
    this.currentPage = this.orderManagementPagerState?.page ?? 1;
    this.filters = {};
    this.search?.clear();
  }

  private checkSelectedChildrenItem(): void {
    const hasSelectedItemChildren = this.selectedItems.some((itm) => itm.children?.length !== 0);
    const hasSelectedChildReorders = this.selectedItems.some((itm) => itm.reOrders?.length !== 0);
    this.selectedItems.length > 0 ? this.openregrateupdate = true : this.openregrateupdate = false;
    this.reorderFilledStatus = false;
    switch (this.activeTab) {
      case OrganizationOrderManagementTabs.AllOrders:
        this.allOrdersChildColumnsToExport = [...allOrdersChildColumnsToExport]
        if(this.isEnableClearedToStart){
            let newCol = { text: 'Cleared to Start', column: 'ClearedToStart' };
            this.allOrdersChildColumnsToExport.splice(2, 0, newCol);
            this.allOrdersChildColumnsToExport.join();
        }
        if(this.selectedItems.filter(ele=> ele.orderType == 1).length == this.selectedItems.length){
          this.openregrateupdate = false;
        }
        if (this.selectedItems.length === 0) {
          this.columnsToExport = [...allOrdersColumnsToExport, ...this.allOrdersChildColumnsToExport];
          return;
        }
        this.columnsToExport = hasSelectedItemChildren
          ? [...allOrdersColumnsToExport, ...this.allOrdersChildColumnsToExport]
          : allOrdersColumnsToExport;
        break;
      case OrganizationOrderManagementTabs.PerDiem:
        this.openregrateupdate = false
        if (this.selectedItems.length === 0) {
          this.columnsToExport = [...perDiemColumnsToExport, ...perDiemChildColumnsToExport];
          return;
        }
        this.columnsToExport = hasSelectedChildReorders
          ? [...perDiemColumnsToExport, ...perDiemChildColumnsToExport]
          : perDiemColumnsToExport;
        break;
      case OrganizationOrderManagementTabs.ReOrders:
        if(this.selectedItems.filter(ele=> ele.statusText == "Filled" || ele.statusText == "Closed").length == this.selectedItems.length){
          this.openregrateupdate = false;
        }
        if(this.selectedItems.filter(ele=> ele.statusText == "Filled" || ele.statusText == "Closed").length >0){
          this.reorderFilledStatus = true;
        }
        if (this.selectedItems.length === 0) {
          this.columnsToExport = [...reOrdersColumnsToExport, ...reOrdersChildColumnToExport];
          return;
        }
        this.columnsToExport = hasSelectedItemChildren
          ? [...reOrdersColumnsToExport, ...reOrdersChildColumnToExport]
          : reOrdersColumnsToExport;
        break;
      case OrganizationOrderManagementTabs.PermPlacement:
        this.columnsToExport = hasSelectedItemChildren
          ? [...permPlacementColumnsToExport, ...allOrdersChildColumnsToExport]
          : permPlacementColumnsToExport;
    }
    this.CurrentOrderDatas = [];
    this.PerDiemOrderDatas = [];
    for (let i = 0; i < this.selectedItems.length; i++) {
      if ((this.selectedItems[i].statusText === "Open") || (this.selectedItems[i].statusText === "In progress")) {
        this.CurrentOrderDatas.push(this.selectedItems[i].id);
        if ((this.selectedItems[i].orderType === OrderType.ReOrder) || (this.selectedItems[i].orderType === OrderType.OpenPerDiem)) {
          this.PerDiemOrderDatas.push(this.selectedItems[i].id);
        }
      }
    }

    this.cd$.next(true);
  }

  public onFilterClearAll(): void {
    this.ltaOrderFlag = false;
    this.clearedtoStartWidget=false;
    this.store.dispatch(new PreservedFilters.ClearPageFilters(this.getPageName()));
    this.filterApplied = true;
    this.orderManagementService.selectedOrderAfterRedirect = null;
    this.clearFilters();
    this.getOrders(true);
  }

  public onFilterApply(): void {
    this.filters.ltaOrder = false;
    if (this.OrderFilterFormGroup.dirty) {
      this.currentPage = 1;
      this.refreshFilterState();
      this.filters = PrepareOrderFilterDates(this.filters, OrderManagementFilterDates);
      this.saveFiltersByPageName();
      this.getOrders(true);
      this.store.dispatch(new ShowFilterDialog(false));
      this.OrderFilterFormGroup.markAsPristine();
      this.filteredItems = this.filterService.generateChips(
        this.OrderFilterFormGroup,
        this.filterColumns,
      );
    } else {
      this.store.dispatch(new ShowFilterDialog(false));
    }
  }

  public onDataBound(): void {
    if (this.gridWithChildRow && this.gridWithChildRow.dataSource) {
      this.gridDataBound(this.gridWithChildRow, this.cd);
    }

    this.subrowsState.clear();
    if (this.previousSelectedOrderId) {
      this.currentPage = this.orderManagementPagerState?.page ?? this.currentPage;
      const [data, index] = this.store.selectSnapshot(OrderManagementContentState.lastSelectedOrder)(
        this.previousSelectedOrderId
      );

      if (data && !isUndefined(index)) {
        this.gridWithChildRow.selectRow(index);
        this.onRowClick({ data });
      }
    }

    if (!isNil(this.selectedIndex)) {
      this.gridWithChildRow.selectRow(this.selectedIndex);
    }

    this.preservedOrderService.setPreservedOrder();

    if (this.selectedReOrder) {
      const rowIndex = this.gridWithChildRow.getRowIndexByPrimaryKey(this.selectedReOrder.selected.order);

      if (rowIndex !== -1) {
        this.focusToRowWithoutSelect(rowIndex);
        this.scrollToSelectedReorder();
      }
    }

    if (this.selectedCandidate && this.selectedCandidateMeta) {
      this.selectedCandidate.selected = this.selectedCandidateMeta;
      const rowIndex = this.gridWithChildRow.getRowIndexByPrimaryKey(this.selectedCandidateMeta.order);

      if (rowIndex !== -1) {
        this.focusToRowWithoutSelect(rowIndex);
      }
    }
    if(this.isShowVMSPositions)
    {
      if(this.redirectedvmsorderfromsystemcolumn){
        const [data, index] = this.store.selectSnapshot(OrderManagementContentState.lastSelectedOrder)(
          this.redirectedvmsorderfromsystemcolumn
        );
        if(data && !isUndefined(index)){
          this.onRowClick({ data });
        }
      }
      if (this.gridWithChildRow && this.gridWithChildRow.dataSource){
      let filteredvmsrowindex:number=0;
      this.gridWithChildRow.detailRowModule.expand(filteredvmsrowindex);

      this.isShowVMSPositions=!this.isShowVMSPositions;
    }
  }

    this.openPerDiemDetails();
    this.selectNavigationTab();
    this.openMyAllTabWithCandidate();
  }

  private openMyAllTabWithCandidate(): void {
    const { selectedOrderAfterRedirect } = this.orderManagementService;
    let index = 0;
    if (selectedOrderAfterRedirect && this.ordersPage?.items) {
      const orderAllOrders = this.ordersPage.items.find(
        (order: OrderManagement, i: number) => {
          index = i;
          return order.publicId === selectedOrderAfterRedirect.orderId;
        }
      );
      if (orderAllOrders) {
        const candidate = orderAllOrders.children.find(
          (candidate: OrderManagementChild) => candidate.candidateId === selectedOrderAfterRedirect.candidateId
        );
        if (selectedOrderAfterRedirect.isReorder) {
          this.gridWithChildRow.selectRow(index);
        } else {
          this.gridWithChildRow.detailRowModule.expand(0);
          this.onOpenCandidateDialog(candidate as OrderManagementChild, orderAllOrders);
        }
        this.orderManagementService.selectedOrderAfterRedirect = null;
      }
    }
  }

  /* Trigger when user redirect to per diem order from re-order */
  private openPerDiemDetails(): void {
    if ((this.orderPerDiemId || this.orderId) && this.ordersPage?.items) {
      const orderPerDiem = this.ordersPage.items.find(
        (order: OrderManagement) => order.publicId === this.orderPerDiemId || this.orderId
      );
      const index = (this.gridWithChildRow.dataSource as Order[])?.findIndex(
        (order: Order) => order.id === orderPerDiem?.id
      );
      this.gridWithChildRow.selectRow(index);
      this.prefix = this.orderPerDiemId = this.orderId = null;
    }
  }

  /* Check if some pending tab is present and set it as active */
  private selectNavigationTab(): void {
    const { pending } = this.store.selectSnapshot(OrderManagementContentState.navigationTab);

    if (pending && this.ordersPage?.items) {
      this.store.dispatch(new SelectNavigationTab(null, pending));
    }

    if (this.activeSystem === OrderManagementIRPSystemId.IRP) {
      this.initGridColumns();
    }
  }

  public onNextPreviousOrderEvent(event: { next: boolean, isIrpOrder: boolean }): void {
    if (event.isIrpOrder) {
      const node = this.gridApi.getSelectedNodes()[0];
      const nextIndex = event.next ? Number(node.rowIndex) + 1 : Number(node.rowIndex) - 1;
      const gridRows: RowNode[] = [];

      this.gridApi.forEachNode((item: RowNode) => {
        gridRows.push(item);
      });

      const selectEvent: Partial<RowSelectedEvent> = {
        node: gridRows[nextIndex],
        data: gridRows[nextIndex].data,
      };

      this.openIrpDetails(selectEvent);

    } else {
      const [index] = this.gridWithChildRow.getSelectedRowIndexes();
      const nextIndex = event.next ? index + 1 : index - 1;
      this.gridWithChildRow.selectRow(nextIndex);
    }
  }

  openIrpDetails(event: RowSelectedEvent | Partial<RowSelectedEvent>) {
    this.subscribeToCandidateJob(false);
    this.watchForEmployeeToggleState();
    this.subscribeForDeployedEmployees();
    this.watchForDeployedState();
    if(!this.redirecttovmsfromIRP){
      this.redirecttovmsfromIRP=!this.redirecttovmsfromIRP;
     return;
    }
    const orderData = event.data as IRPOrderManagement;
    if (orderData.isTemplate) {
      this.store.dispatch(new GetSelectedOrderById(orderData.id, true));
      this.navigateToOrderTemplateForm(orderData.id, true);
    }
    else {

      this.gridApi.selectNode(event.node as RowNode);
      this.selectedDataRow = orderData;
      const options = this.getDialogNextPreviousOption(orderData, true);
      this.store.dispatch(new GetOrderById(orderData.id, orderData.organizationId, options, true));
      if (orderData.status !== OrderStatus.Incomplete) {
        this.dispatchAgencyOrderCandidatesList(orderData.id, orderData.organizationId, true);
      }
      this.selectedCandidateMeta = this.selectedCandidate = this.selectedReOrder = null;
      this.openChildDialog.next(false);
      this.orderPositionSelected$.next({ state: false });
      this.orderManagementService.setCurrentClearToStartVal(null);
      this.openDetails.next(true);
      this.selectedRowRef = event;
      this.selectedRowIndex = event.rowIndex || null;
  }
  }
  openIrpDetailsEmployee(){
    this.OrderFilterFormGroup.markAsDirty();
    this.OrderFilterFormGroup.get('orderPublicId')?.setValue(this.selectedDataRow.publicId?.toString());
    this.onFilterApply();
    this.globalWindow.localStorage.setItem("IsEmployeeTab", JSON.stringify(true));

  }
  openvmspositions(publicId: number)
  {
    this.OrderFilterFormGroup.markAsDirty();
    this.OrderFilterFormGroup.get('orderPublicId')?.setValue(publicId.toString());
    this.onFilterApply();
    this.isShowVMSPositions=true;

  }
  setGridApi(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  public onRowClick(event: RowSelectEventArgs): void {
    if(!this.redirecttoIRPfromVMS){
      this.redirecttoIRPfromVMS=!this.redirecttoIRPfromVMS;
     return;
    }
    if (event.target) {
      this.orderManagementService.excludeDeployed = false;
    }

    if ((this.creatingReorder || event.rowIndex === event.previousRowIndex) && this.eliteOrderId == 0) {
      this.creatingReorder = false;
      return;
    }

    const rowData = event.data as OrderManagement;
    if(rowData.statusText === this.deletedStatus.Deleted)
    {
      return;
    }
    const pagerState = { page: this.currentPage, pageSize: this.pageSize, filters: this.filters };

    this.store.dispatch(new SetOrderManagementPagerState(pagerState));

    this.rowSelected(event, this.gridWithChildRow);

    if (rowData.orderType === this.orderTypes.OpenPerDiem ?? !!event.target) {
      this.getReOrdersByOrderId(rowData.id, true);
    }

    if (!event.isInteracted) {
      if (rowData?.isTemplate) {
        if (!this.canCreateOrder || this.preservedOrderService.isOrderPreserved()) {
          return;
        }
        this.navigateToOrderTemplateForm(rowData.id,false);
        this.store.dispatch(new GetSelectedOrderById(rowData.id));
      } else {
        const data = isArray(rowData) ? rowData[0] as OrderManagement : rowData as OrderManagement;
        this.selectedDataRow = data;
        const options = this.getDialogNextPreviousOption(data);
        this.store.dispatch(new GetOrderById(data.id, data.organizationId, options,
          this.activeSystem === OrderManagementIRPSystemId.IRP));
        this.selectedCandidateMeta = this.selectedCandidate = this.selectedReOrder = null;
        this.dispatchAgencyOrderCandidatesList(data.id, data.organizationId, !!data?.irpOrderMetadata);
        this.openChildDialog.next(false);
        this.orderPositionSelected$.next({ state: false });

        if (!isArray(data)) {
          this.globalWindow.localStorage.setItem("IsEmployeeTab", JSON.stringify(true));
          this.openDetails.next(true);
          this.selectedRowRef = event;
          this.selectedRowIndex = event.rowIndex || null;
        }
      }
    }

    this.checkSelectedChildrenItem();
  }

  public onRowDeselect(event: RowSelectEventArgs, grid: GridComponent) {
    this.rowDeselected(event, grid);
    this.checkSelectedChildrenItem();
  }

  private onChildDialogChange(): void {
    this.openChildDialog.pipe(takeUntil(this.unsubscribe$)).subscribe((isOpen) => {
      if (!isOpen) {
        this.selectedCandidateMeta = this.selectedCandidate = this.selectedReOrder = null;
      } else {
        this.openDetails.next(false);
        this.gridWithChildRow?.clearRowSelection();
        this.selectedIndex = null;
      }
      this.cd$.next(true);
    });
  }

  private getDialogNextPreviousOption(
    selectedOrder: OrderManagement | IRPOrderManagement, isIrpGrid = false): DialogNextPreviousOption {
    let gridData: OrderManagement[] | IRPOrderManagement[];

    if (isIrpGrid) {
      gridData = [];

      this.gridApi.forEachNode((item: RowNode) => {
        gridData.push(item.data);
      });
    } else {
      gridData = this.gridWithChildRow.dataSource as OrderManagement[];
    }
    if(gridData) {
       const first = gridData[0];
    const last = gridData[gridData.length - 1];

    return {
      previous: first.id !== selectedOrder.id,
      next: last.id !== selectedOrder.id,
    };
    }else{
      return {
        previous: 0 !== selectedOrder.id,
        next: 0 !== selectedOrder.id,
      };
    }

  }

  public navigateToOrderForm(): void {
    this.router.navigate(['./add'], { relativeTo: this.route });
    this.orderManagementService.setOrderManagementSystem(this.activeSystem);
    this.orderManagementService.setOrderTypeToPrePopulate(this.activeTab, this.activeIRPTabIndex, this.activeSystem);
  }

  public navigateToOrderTemplateForm(id: number,isIRP?:boolean): void {
    this.preserveOrder(id);
    this.router.navigate(['./add/fromTemplate'],{state:
      {isIRP:isIRP},relativeTo:this.route} );
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

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
      this.isSubrowDisplay = false;
    }
  }

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.gridWithChildRow.pageSettings.pageSize = this.pageSize;
  }

  public irpTabSelected(tabIndex: OrderManagementIRPTabsIndex) {
    if (tabIndex === this.activeIRPTabIndex) {
      return;
    }

    this.activeIRPTabIndex = tabIndex;
    this.filterApplied = false;
    this.clearFilters();
    this.clearOrderJourneyFilters();

    if (!this.previousSelectedOrderId) {
      this.openDetails.next(false);
      this.store.dispatch(new ClearOrders());
      this.selectedIndex = this.selectedRowIndex = null;

      this.initGridColumns();
      this.dispatchPreservedFilters();
      this.pageSubject.next(1);
    }
    resetAgGridHorizontalScroll(this.gridApi, this.columnApi);
    this.cd$.next(true);
  }

  public tabSelected(tabIndex: OrganizationOrderManagementTabs): void {
    this.activeTab = tabIndex;
    // Don’t need reload orders if we go back from the candidate page
    if (!this.previousSelectedOrderId) {
      const { selectedOrderAfterRedirect } = this.orderManagementService;
      this.openDetails.next(false);

      this.selectedIndex = this.selectedRowIndex = null;
      this.clearSelection(this.gridWithChildRow);

      if (this.isIRPFlagEnabled) {
        this.initGridColumns();
      }

      switch (tabIndex) {
        case OrganizationOrderManagementTabs.AllOrders:
          this.isLockMenuButtonsShown = true;
          if(this.isOrgIRPEnabled && this.isOrgVMSEnabled){
            const systemcolumnAllorders = AllOrdersColumnsConfig.find((d) => d.fieldName ==='system');
            systemcolumnAllorders!.visible=true;
          }
          this.refreshGridColumns(AllOrdersColumnsConfig, this.gridWithChildRow);
          break;
        case OrganizationOrderManagementTabs.PerDiem:
          this.isLockMenuButtonsShown = true;
          this.refreshGridColumns(PerDiemColumnsConfig, this.gridWithChildRow);
          break;
        case OrganizationOrderManagementTabs.PermPlacement:
          this.isLockMenuButtonsShown = true;
          this.refreshGridColumns(PermPlacementColumnsConfig, this.gridWithChildRow);
          break;
        case OrganizationOrderManagementTabs.ReOrders:
          this.isLockMenuButtonsShown = false;
          if(this.isOrgIRPEnabled && this.isOrgVMSEnabled){
            const systemcolumnReorders = ReOrdersColumnsConfig.find((d) => d.fieldName ==='system');
            systemcolumnReorders!.visible=true;
          !selectedOrderAfterRedirect && this.refreshGridColumns(ReOrdersColumnsConfig, this.gridWithChildRow);
          }
          break;
        case OrganizationOrderManagementTabs.OrderTemplates:
          this.refreshGridColumns(orderTemplateColumnsConfig, this.gridWithChildRow);
          break;
        case OrganizationOrderManagementTabs.Incomplete:
          this.isLockMenuButtonsShown = false;
          const systemcolumn = AllOrdersColumnsConfig.find((d) => d.fieldName ==='system');
          systemcolumn!.visible=false;
          this.refreshGridColumns(AllOrdersColumnsConfig, this.gridWithChildRow);
          break;
      }

      if (!this.preservedOrderService.isOrderPreserved()) {
        this.filterApplied = false;
        this.clearFilters();
        this.store.dispatch(new ClearOrders());
        this.pageSubject.next(1);
      }

      this.dispatchPreservedFilters();
    }
    this.resetGridHorizontalScroll(this.gridWithChildRow);
    this.cd$.next(true);
  }

  public openEditedIrpOrder(): void {

    const orderData: Partial<RowSelectedEvent> = {
      node: undefined,
      data: null,
    };
   if(this.redirectedIrporder){
    this.gridApi.forEachNode((node) => {
      if ((node.data as OrderManagement).id === this.redirectedIrporder) {
        orderData.data = node.data;
        orderData.node = node;
      }
    });

    if (orderData.node && orderData.data) {
      if (orderData.data != null) {
        this.openIrpDetails(orderData);
        this.redirectedIrporder=null;
      }
   }

  }
  else{
    const preservedOrderId = this.preservedOrderService.getPreservedOrderId();
    if (!preservedOrderId) {
      return;
    }

    this.gridApi.forEachNode((node) => {
      if ((node.data as OrderManagement).id === preservedOrderId) {
        orderData.data = node.data;
        orderData.node = node;
      }
    });

    if (orderData.node && orderData.data) {
      if (orderData.data != null && !orderData.data.isTemplate) {
        this.openIrpDetails(orderData);
      }
      this.preservedOrderService.resetPreservedOrder();
      this.gridApi.ensureNodeVisible(orderData.node);
    }
  }
}

  private setOrderTypesFilterDataSource(): void {
    if (this.activeSystem === OrderManagementIRPSystemId.VMS) {
      this.filterColumns.orderTypes.dataSource = OrderTypeOptions;
    } else {
      this.filterColumns.orderTypes.dataSource = FilterIrpOrderTypes;
      this.filterOrderJourneyColumns.orderTypes.dataSource = FilterIrpOrderTypes;
    }
  }

  changeSystem(selectedBtn: ButtonModel) {
    this.activeSystem = selectedBtn.id;
    this.closeModalsBeforeSwitchSystem();
    this.orderManagementService.saveSelectedOrderManagementSystem(this.activeSystem);

    if (!this.isRedirectedFromVmsSystem) {
      this.clearFilters();
      this.store.dispatch([new PreservedFilters.ResetPageFilters(), new ClearOrders()]);
      this.getPreservedFiltersByPage();
    }
    this.store.dispatch(new SetHelpSystem(this.activeSystem === OrderManagementIRPSystemId.IRP));
    this.orderManagementService.setOrderManagementSystem(this.activeSystem);
    this.resetTabs();
    this.setOrderTypesFilterDataSource();
    this.initMenuItems();
    this.initGridColumns();
    this.getOrders();
    this.clearOrderJourneyFilters();
    this.getProjectSpecialData();
  }

  gridSortHandler(sortEvent: SortChangedEvent): void {
    const columnWithSort = sortEvent.columnApi.getColumnState().find((col) => col.sort !== null);
    this.orderBy = columnWithSort ? `${columnWithSort.colId} ${columnWithSort.sort}` : '';

    this.getOrders(true);
  }

  gridPageChanged(page: number) {
    this.filterApplied = true;
    this.pageSubject.next(page);
  }

  gridPerPageChanged(perPage: number) {
    this.filterApplied = true;
    this.pageSize = perPage;
    this.pageSubject.next(1);
  }

  public onOpenReorderDialog(reOrder: OrderManagement, order: OrderManagement): void {
    this.selectedReOrder = reOrder;
    this.selectedReOrder.selected = {
      order: order.id,
      reOrder: reOrder.id,
    };
    this.gridWithChildRow?.clearRowSelection();
    this.selectedIndex = null;
    this.store.dispatch(new GetOrderById(reOrder.id, order.organizationId));
    this.dispatchAgencyOrderCandidatesList(reOrder.id, reOrder.organizationId, !!reOrder.irpOrderMetadata);
    this.selectedDataRow = order as any;
    this.openDetails.next(true);
  }

  public selectReOrder(event: { reOrder: OrderManagement; order: Order | OrderManagement }): void {
    const tabSwitchAnimation = 400;
    const { reOrder, order } = event;
    const tabId = Object.values(OrganizationOrderManagementTabs).indexOf(OrganizationOrderManagementTabs.ReOrders);
    this.tabNavigation.tabNavigation.select(tabId);
    setTimeout(() => {
      this.onOpenReorderDialog(reOrder, order as OrderManagement);
      this.detailsDialog.tab.select(0);
      this.cd$.next(true);
    }, tabSwitchAnimation);
  }

  public triggerSelectOrder(): void {
    const [index] = this.gridWithChildRow.getSelectedRowIndexes();
    this.selectedIndex = index;
    this.updatePage();
    this.store.dispatch(
      new GetOrderById(
        this.selectedDataRow.id,
        this.selectedDataRow.organizationId as number,
        this.getDialogNextPreviousOption(this.selectedDataRow as any)
      )
    );
  }

  public onOpenCandidateDialog(candidate: OrderManagementChild, order: OrderManagement, index?: number): void {
    this.selectedCandidate = candidate;
    this.selectedCandidateMeta = this.selectedCandidate.selected = {
      order: order.id,
      positionId: candidate.positionId,
    };
    this.dispatchAgencyOrderCandidatesList(order.id, order.organizationId, !!order.irpOrderMetadata);
    const options = this.getDialogNextPreviousOption(order);
    this.store.dispatch(new GetOrderById(order.id, order.organizationId, options));
    this.selectedDataRow = order as any;
    this.orderPositionSelected$.next({ state: true, index });
    this.orderManagementService.setCurrentClearToStartVal(null);
    this.openChildDialog.next([order, candidate]);
    this.store.dispatch(new GetAvailableSteps(order.organizationId, candidate.jobId));
    this.cd$.next(true);
  }

  public deleteOrder(id: number): void {
    if (!this.canCreateOrder) {
      return;
    }
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      }).pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe((confirm) => {
        if (confirm) {
          this.store.dispatch(new DeleteOrder(id));
        }
      });
  }

  public menuOptionSelected(id: MoreMenuType, data: OrderManagement): void {
    switch (Number(id)) {
      case MoreMenuType['Edit']:
        this.editOrder(data);
        break;
      case MoreMenuType['Duplicate']:
        this.store.dispatch(new DuplicateOrder(data.id, this.activeSystem));
        break;
      case MoreMenuType['Close']:
        this.orderManagementContentService.getOrderById(data.id).pipe(
          takeUntil(this.unsubscribe$)
        ).subscribe((order) => {
          this.selectedOrder = { ...order };
          this.store.dispatch(new ShowCloseOrderDialog(true));
        });
        break;
      case MoreMenuType['Delete']:
        this.deleteOrder(data.id);
        break;
      case MoreMenuType['Re-Open']:
        this.reOpenOrder(data);
        break;
      case MoreMenuType['Add Re-Order']:
        this.createReorder(data);
        break;
      case MoreMenuType['View history']:
      this.orderDetail.next(data);
        break;
    }
  }

  public expandAll(): void {
    this.isSubrowDisplay = true;
    this.ordersPage.items.forEach((item: OrderManagement, index: number): void => {
      super.onSubrowAllToggle(index + 1);
    });
  }

  public collapseAll(): void {
    this.isSubrowDisplay = false;
    super.onSubrowAllToggle();
  }

  public toggleRowHeight(scaled: boolean): void {
    this.rowHeight = scaled ? ROW_HEIGHT.SCALE_UP_HEIGHT : ROW_HEIGHT.SCALE_DOWN_HEIGHT;

    this.cd$.next(true);
  }

  public reOpenOrder(order: OrderManagement): void {
    this.reOpenOrderService
      .reOpenOrder({ orderId: order.id })
      .pipe(
        catchError((err) => {
          this.store.dispatch(new ShowToast(MessageTypes.Error, err.message));
          return EMPTY;
        }),
        take(1)
      )
      .subscribe(() => this.updateOrderDetails(order));
  }

  public editOrder(data: OrderManagement): void {
    if (!isNil(data.reOrderFromId) && data.reOrderFromId !== 0) {
      this.addEditReOrderService.setReOrderDialogTitle(SidebarDialogTitlesEnum.EditReOrder);
      const index = (this.gridWithChildRow.dataSource as []).findIndex((item: OrderManagement) => {
        return item.id === data.id;
      });
      this.selectedRowIndex = index < 0 ? null : index;
      this.openReOrderDialog(data.id, data.organizationId);
    } else {
      this.preserveOrder(data.id);
      this.router.navigate(['./edit', data.id], { relativeTo: this.route });
    }
  }

  public openImportDialog(): void {
    if (this.isIRPFlagEnabled && this.activeSystem === OrderManagementIRPSystemId.IRP) {
      // TODO new import for IRP system
    } else {
      this.importDialogEvent.next(true);
    }
  }

  public preserveOrder(id: number): void {
    const pagerState = { page: this.currentPage, pageSize: this.pageSize, filters: this.filters };

    if (this.activeSystem === OrderManagementIRPSystemId.IRP) {
      this.preservedOrderService.setIrpActiveTab(this.activeIRPtabs);
    } else {
      this.preservedOrderService.setActiveTab(this.activeTab);
    }

    this.preservedOrderService.preserveOrder(id, pagerState);
    const tab = this.activeSystem === OrderManagementIRPSystemId.VMS ? this.activeTab : this.activeIRPtabs;
    this.store.dispatch([new SelectNavigationTab(tab), new ClearOrders(), new ClearOrderFilterDataSources()]);
  }

  private openReOrderDialog(orderId: number, organizationId: number): void {
    this.store.dispatch(new GetOrderById(orderId, organizationId, {} as any));
    this.actions$
      .pipe(ofActionDispatched(GetOrderByIdSucceeded), take(1))
      .subscribe(() => this.store.dispatch(new ShowSideDialog(true)));
  }

  private onReloadOrderCandidatesLists(): void {
    this.actions$
      .pipe(ofActionDispatched(ReloadOrganisationOrderCandidatesLists), takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.dispatchAgencyOrderCandidatesList(this.selectedOrder.id, this.selectedOrder.organizationId as number,
          !!this.selectedOrder.irpOrderMetadata);
        this.getOrders(true);
        this.store.dispatch(
          new GetOrderById(
            this.selectedOrder.id,
            this.selectedOrder.organizationId as number,
            this.getDialogNextPreviousOption(this.selectedDataRow as any)
          )
        );
      });
  }

  private subscribeForSettings(): void {
    this.organizationSettings$.pipe(takeUntil(this.unsubscribe$)).subscribe((settings) => {
      this.settings = SettingsHelper.mapSettings(settings);
      this.cd$.next(true);
    });
  }

  private getSettings(): void {
    this.store.dispatch(new GetOrganizationSettings());
  }

  private onOrganizationChangedHandler(): void {
    this.organizationId$.pipe(
      filter(Boolean),
      takeUntil(this.unsubscribe$),
    ).subscribe((id) => {
      this.organizationId = id;
      this.getSettings();
      if (!this.isRedirectedFromDashboard && !this.isRedirectedFromToast && !this.preservedOrderService.isOrderPreserved()) {
        this.clearFilters();
      }
      if(this.eliteOrderId == 0){
        this.openDetails.next(false);
      }
      this.store.dispatch(new GetAssignedSkillsByOrganization());

      this.orderManagementService.setPreviousOrganizationId(id);
      this.getOrganization(id);
    });
  }

  private onOrdersDataLoadHandler(): void {
    this.ordersPage$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.ordersPage = data;
      if (data?.items) {
        data.items.forEach((item) => {
          item.isMoreMenuWithDeleteButton = !this.openInProgressFilledStatuses.includes(item.statusText.toLowerCase());
          item.menuItems = this.getMoreMenuDataSource(item);

          if (item.children && item.children.length) {
            item.children.sort((a, b) => a.positionId - b.positionId);
          }
        });
      }
      if (this.ordersPage?.items) {
         const filteredOrder = this.ordersPage.items.find(x => x.id == this.eliteOrderId);
        if (this.eliteOrderId > 0 && filteredOrder) {
         const data = this.ordersPage.items;
          if(this.gridApi && data){
            this.eliteOrderPublicId=filteredOrder?.publicId!;
            this.redirectedIrporder=this.eliteOrderId;
          }
          if(this.gridWithChildRow){
            this.gridWithChildRow.dataSource = this.ordersPage.items;
            this.onRowClick({ data });
          }

        }
      }

      if (data?.items.length && this.redirectfromextension) {
        this.closeChildDialog.next(null);
        this.openIRPdialog(data.items[0] as unknown as IRPOrderManagement);
      }

      this.selectNavigationTab();
    });
  }

  private onGridPageChangedHandler(): void {
    this.pageSubject.pipe(debounceTime(1), takeUntil(this.unsubscribe$)).subscribe((page) => {
      this.currentPage = page;
      const { selectedOrderAfterRedirect } = this.orderManagementService;
      if (this.orderPerDiemId || this.orderId || selectedOrderAfterRedirect) {
        this.filters.orderPublicId = (this.prefix || selectedOrderAfterRedirect?.prefix) + '-' + (this.orderPerDiemId || this.orderId || selectedOrderAfterRedirect?.orderId);
        this.OrderFilterFormGroup.controls['orderPublicId'].setValue(
          ((this.prefix || selectedOrderAfterRedirect?.prefix) + '-' + (this.orderPerDiemId || this.orderId || selectedOrderAfterRedirect?.orderId))?.toString()
        );
        this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns);
      }
      this.getOrders(this.filterApplied);
    });
  }

  private orderFilterColumnsSetup(): void {
    this.filterColumns = initOrderManagementFilterColumns();
    this.filterOrderJourneyColumns = initOrderManagementFilterColumns();

    this.search$.pipe(takeUntil(this.unsubscribe$), debounceTime(300)).subscribe(() => {
      this.onFilterApply();
      this.onOrderJourneyFilterApply();
    });
  }

  private closeModalsBeforeSwitchSystem(): void {
    this.openDetails.next(false);
    this.orderPositionSelected$.next({ state: false });
    this.openChildDialog.next(false);
  }

  private adjustFilters(isNotPreservedFilter: boolean): void {
    if (isNotPreservedFilter && this.eliteOrderId == 0) {
      this.setDefaultFilter();
    }
    this.patchFilterForm(!!this.filters?.contactEmails);
    this.populatePreservedContactPerson();
    this.cd.markForCheck();
  }

  private populatePreservedContactPerson(): void {
    if (this.filters?.contactEmails && this.activeTab !== OrganizationOrderManagementTabs.OrderTemplates) {
      this.getPreservedContactPerson(this.filters.contactEmails as string);
    }
  }

  private getPreservedContactPerson(contactEmails: string): void {
    this.filterService
      .getUsersListBySearchTerm(contactEmails)
      .pipe(take(1))
      .subscribe((data) => {
        this.filteredUsers = this.filterColumns.contactEmails.dataSource = data;
        this.OrderFilterFormGroup.get('contactEmails')?.setValue(this.contactEmails);
        this.filteredItems = this.filterService.generateChips(
          this.OrderFilterFormGroup,
          this.filterColumns,
          this.datePipe
        );

        this.cd.markForCheck();
      });
  }

  private setDefaultFilter(): void {
    if (!(this.filters.isTemplate || this.isIncomplete)) {
      const statuses = this.filterColumns.orderStatuses.dataSource
        .filter((status: FilterOrderStatus) => ![FilterOrderStatusText.Closed, FilterOrderStatusText.Incomplete].includes(status.status))
        .map((status: FilterStatus) => status.status);
      const reorderStatuses = this.filterColumns.reorderStatuses.dataSource?.filter((status: FilterOrderStatus) => {
        return ![FilterOrderStatusText.Closed].includes(status.status);
      }).map((status: FilterStatus) => status.status);

      if(this.activeSystem != OrderManagementIRPSystemId.OrderJourney){
        this.filters.orderStatuses = (this.SelectedStatus.length > 0) ? this.SelectedStatus : statuses;
        this.filters.candidateStatuses = (this.candidateStatusIds.length > 0) ? this.candidateStatusIds : [];
      }

      if (this.activeTab === OrganizationOrderManagementTabs.PerDiem) {
        this.filters.reorderStatuses = reorderStatuses.length ? reorderStatuses : [];
      }

      if(this.ltaOrderFlag){
        this.filters.orderStatuses = [];
        this.filters.candidateStatuses = [];
        this.filters.reorderStatuses = [];
      }
      if(this.clearedtoStartWidget)
      {
        this.filters.orderStatuses = [];
      }
    }
  }

  private onOrderFilterControlValueChangedHandler(): void {
    this.OrderFilterFormGroup.get('regionIds')?.valueChanges.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((val: number[]) => {
      if (val?.length) {
        const selectedRegions: OrganizationRegion[] = [];
        const locations: OrganizationLocation[] = [];

        val.forEach((id) =>
          selectedRegions.push(this.regions.find((region) => region.id === id) as OrganizationRegion)
        );
        this.filterColumns.locationIds.dataSource = [];
        selectedRegions.forEach((region) => {
          region.locations?.forEach((location) => (location.regionName = region.name));
          locations.push(...region.locations as []);
        });
        this.filterColumns.locationIds.dataSource.push(...sortByField(locations, 'name'));
      } else {
        this.filterColumns.locationIds.dataSource = [];
        this.OrderFilterFormGroup.get('locationIds')?.setValue([]);
        this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns);
      }
      this.cd$.next(true);
    });
    this.OrderFilterFormGroup.get('locationIds')?.valueChanges.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((val: number[]) => {
      if (val?.length) {
        const selectedLocations: OrganizationLocation[] = [];
        const departments: OrganizationDepartment[] = [];

        val.forEach((id) =>
          selectedLocations.push(
            this.filterColumns.locationIds.dataSource.find((location: OrganizationLocation) => location.id === id)
          )
        );
        this.filterColumns.departmentsIds.dataSource = [];
        selectedLocations.forEach((location) => {
          departments.push(...(location.departments as []));
        });
        this.filterColumns.departmentsIds.dataSource.push(...sortByField(departments, 'name'));
      } else {
        this.filterColumns.departmentsIds.dataSource = [];
        this.OrderFilterFormGroup.get('departmentsIds')?.setValue([]);
        this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns);
      }
      this.cd$.next(true);
    });

    this.OrderJourneyFilterFormGroup.get('regionIds')?.valueChanges.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((val: number[]) => {
      if (val?.length) {
        const selectedRegions: OrganizationRegion[] = [];
        const locations: OrganizationLocation[] = [];

        val.forEach((id) =>
          selectedRegions.push(this.regions.find((region) => region.id === id) as OrganizationRegion)
        );
        this.filterOrderJourneyColumns.locationIds.dataSource = [];
        selectedRegions.forEach((region) => {
          region.locations?.forEach((location) => (location.regionName = region.name));
          locations.push(...region.locations as []);
        });
        this.filterOrderJourneyColumns.locationIds.dataSource.push(...sortByField(locations, 'name'));
      } else {
        this.filterOrderJourneyColumns.locationIds.dataSource = [];
        this.OrderJourneyFilterFormGroup.get('locationIds')?.setValue([]);
        this.filteredOrdersJourneyItems = this.filterService.generateChips(this.OrderJourneyFilterFormGroup, this.filterOrderJourneyColumns);
      }
      this.cd$.next(true);
    });
    this.OrderJourneyFilterFormGroup.get('locationIds')?.valueChanges.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((val: number[]) => {
      if (val?.length) {
        const selectedLocations: OrganizationLocation[] = [];
        const departments: OrganizationDepartment[] = [];

        val.forEach((id) =>
          selectedLocations.push(
            this.filterOrderJourneyColumns.locationIds.dataSource.find((location: OrganizationLocation) => location.id === id)
          )
        );
        this.filterOrderJourneyColumns.departmentsIds.dataSource = [];
        selectedLocations.forEach((location) => {
          departments.push(...(location.departments as []));
        });
        this.filterOrderJourneyColumns.departmentsIds.dataSource.push(...sortByField(departments, 'name'));
      } else {
        this.filterOrderJourneyColumns.departmentsIds.dataSource = [];
        this.OrderJourneyFilterFormGroup.get('departmentsIds')?.setValue([]);
        this.filteredOrdersJourneyItems = this.filterService.generateChips(this.OrderJourneyFilterFormGroup, this.filterOrderJourneyColumns);
      }
      this.cd$.next(true);
    });

    this.OrderFilterFormGroup.get('projectTypeIds')?.valueChanges.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((val: number[]) => {
      if (val?.length) {
        this.projectSpecialData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: ProjectSpecialData) => {
            this.filterColumns.projectNameIds.dataSource =this.activeSystem === OrderManagementIRPSystemId.IRP?  data.projectNames.filter((f)=>val.includes(f.projectTypeId??0) && f.includeInIRP==true):data.projectNames.filter((f)=>val.includes(f.projectTypeId??0) && f.includeInVMS==true) ;
        })

      }else{
        this.filterColumns.projectNameIds.dataSource = [];
        this.OrderFilterFormGroup.get('projectNameIds')?.setValue([]);
      }
      this.cd$.next(true);
    });
  }

  private onOrderDetailsDialogOpenEventHandler(): void {
    this.openDetails.pipe(takeUntil(this.unsubscribe$)).subscribe((isOpen) => {
      if (!isOpen) {
        this.orderComments = [];
        this.clearSelection(this.gridWithChildRow);
        this.selectedReOrder = null;
        this.previousSelectedOrderId = null;
        this.orderManagementPagerState = null;
        this.selectedIndex = this.selectedRowIndex = null;
        const table = document.getElementsByClassName('e-virtualtable')[0] as HTMLElement;
        if (table) {
          table.style.transform = 'translate(0px, 0px)';
        }
      }
      if(!this.redirectedfromnotification){
       this.eliteOrderId = 0;
      }
      this.cd$.next(true);
    });
  }

  private getOrderComments(): void {
    this.store.dispatch(new GetOrderComments(this.selectedOrder.commentContainerId as number));
    this.orderComments$.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((comments: Comment[]) => {
      this.orderComments = comments;
      this.cd.markForCheck();
    });
  }

  private onSelectedOrderDataLoadHandler(): void {
    this.selectedOrder$
    .pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((order: Order) => {
      this.selectedOrder = order;

      if (this.selectedOrder?.commentContainerId) {
        this.getOrderComments();
      }
      if (this.isRedirectedFromVmsSystem) {
        this.selectFirstRow();
        this.isRedirectedFromVmsSystem = false;
      }
      this.cd$.next(true);
    });
  }

  private onSkillDataLoadHandler(): void {
    this.skills$.pipe(takeUntil(this.unsubscribe$)).subscribe((skills) => {
      if (skills && skills.length > 0) {
        this.filterColumns.skillIds.dataSource = skills;
        this.filterOrderJourneyColumns.skillIds.dataSource = skills;
        this.cd$.next(true);
      }
    });
  }

  private onOrganizationStructureDataLoadHandler(): void {
    combineLatest([
      this.organizationStructure$.pipe(filter((structure) => !!structure)),
      this.organization$.pipe(filter((organization) => !!organization), take(1)),
    ])
      .pipe(
        debounceTime(100),
        tap(([structure]) => {
          if (this.organizationId === structure.organizationId) {
            this.orgStructure = structure;
            this.regions = structure.regions;
            this.filterColumns.regionIds.dataSource = this.regions;
            this.filterOrderJourneyColumns.regionIds.dataSource = this.regions;
            this.store.dispatch(new PreservedFilters.ResetPageFilters());
            this.getPreservedFiltersByPage();
          }
        }),
        //get preserved filters and dispatch orders
        switchMap(() => this.preservedFiltersByPageName$),
        filter(({ dispatch }) => dispatch),
        tap(({ isNotPreserved, state }) => {
          if (!this.preservedOrderService.isOrderPreserved() && this.eliteOrderId == 0) {
            const updatedFilterDates = GetOrderFilterDatesInUts(state, OrderManagementFilterDates) as Partial<OrderFilter>;
            const updatedFilterState = {
              ...state,
              ...updatedFilterDates
            }

            this.prepareFiltersToDispatch(updatedFilterState);
          }
          if(this.eliteOrderId > 0){
            this.filters.orderPublicId = this.orderPublicId;
            this.OrderFilterFormGroup.controls['orderPublicId'].setValue(this.orderPublicId);
            this.getOrders(true);
         }

          if (!isNotPreserved ) {
            this.getOrders(true);
          }
        }),
        //get filter data source
        switchMap(() => this.orderFilterDataSources$),
        filter((datasource) => !!datasource),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data: OrderFilterDataSource) => {
        this.getapprovalorder();
        this.setupDefaultStatuses(data);

        const filterState = this.store.selectSnapshot(PreservedFiltersState.preservedFiltersByPageName) as
          PreservedFiltersByPage<OrderFilter>;
        if (!this.redirectFromPerdiem && !this.orderManagementService.selectedOrderAfterRedirect) {
          this.adjustFilters(filterState.isNotPreserved);
        } else {
          this.redirectFromPerdiem = false;
        }

        if (filterState.isNotPreserved) {
          this.getOrders(true);
        }

        this.cd$.next(true);
        this.clearStorage();
      });
  }

  private onApproveOrderHandler(): void {
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(ApproveOrder)).subscribe(() => {
      const [index] = this.activeSystem === OrderManagementIRPSystemId.VMS ? this.gridWithChildRow.getSelectedRowIndexes()
      : [null];
      this.selectedIndex = index;
      this.getOrders(true);
    });
  }

  private OnUpdateRegrateSucceededHandler(): void {
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionDispatched(UpdateRegRateSucceeded)).subscribe(() => {
      this.gridWithChildRow.clearRowSelection();
      this.getOrders();
    });
  }

  private onDuplicateOrderSucceededHandler(): void {
    this.actions$
      .pipe(takeUntil(this.unsubscribe$), ofActionDispatched(DuplicateOrderSuccess))
      .subscribe((data: { payload: number }) => {
        this.router.navigate(['./edit', data.payload], { relativeTo: this.route });
      });
  }

  private onLockUpdatedSucceededHandler(): void {
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionDispatched(LockUpdatedSuccessfully)).subscribe(() => {
      this.getOrders();
    });
  }

  private onDeleteOrderSucceededHandler(): void {
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionDispatched(DeleteOrderSucceeded)).subscribe(() => {
      this.gridWithChildRow?.clearRowSelection();
      this.getOrders(true);
      this.openDetails.next(false);
    });
  }

  public lockOrder(order: Order): void {
    let filtersLockOrder = {...this.filters};
    if(this.filters.orderLocked){
      filtersLockOrder.orderLocked = filtersLockOrder.orderLocked == 'false' ? false : filtersLockOrder.orderLocked == 'true' ? true : null
    }
      this.store.dispatch(
        new SetLock(order.id, this.isActiveSystemIRP ? order.isLocked! : !order.isLocked, this.isActiveSystemIRP ? !order.isLockedIRP : order.isLockedIRP!,filtersLockOrder, `${order.organizationPrefix || ''}-${order.publicId}`, this.isActiveSystemIRP, false)
      );
  }

  public disabledLock(status: OrderStatus): boolean {
    const statuses = [this.orderStatus.Open, this.orderStatus.InProgress, this.orderStatus.Filled];

    return !statuses.includes(status);
  }

  public trackById(index: number, field: OrderManagementChild): number {
    return field.orderId;
  }

  public updateGrid(reorderDialog?: boolean): void {
    this.getOrders(true);

    if (reorderDialog && this.selectedReOrder) {
      this.dispatchAgencyOrderCandidatesList(this.selectedReOrder.id, this.selectedReOrder.organizationId,
        this.selectedReOrder.irpOrderMetadata);
      this.store.dispatch(new GetOrderById(this.selectedReOrder.id, this.selectedReOrder.organizationId));

      if (this.selectedOrder.orderType === this.orderTypes.OpenPerDiem) {
        this.getReOrdersByOrderId(this.selectedOrder.id);
      }
    }

    this.actions$.pipe(ofActionSuccessful(GetOrders), take(1))
      .subscribe(() => {
        const [index] = this.selectedRowIndex === null
          ? this.gridWithChildRow.getSelectedRowIndexes() : [this.selectedRowIndex];
        this.selectedIndex = index;
        this.cd$.next(true);
      });
  }

  public getMoreMenu(order: OrderManagement): ItemModel[] {
    const orderStatuses = [OrderStatus.InProgressOfferAccepted, OrderStatus.Filled];
    if (orderStatuses.includes(OrderStatus.InProgressOfferAccepted)) {
      if (order.children?.some((child) => orderStatuses.includes(child.orderStatus))) {
        if(this.activeSystem===OrderManagementIRPSystemId.IRP){
          return order.orderType === OrderType.OpenPerDiem
          ? this.threeDotsMenuOptionsIRP['moreMenuWithCloseButton']
          : this.threeDotsMenuOptionsIRP['moreMenu'];
        }
        else{
          return order.orderType === OrderType.OpenPerDiem
          ? this.getMenuItems(order, 'moreMenuWithCloseButton')
          : this.threeDotsMenuOptions['moreMenu'];
        }


      } else if (this.activeSystem === OrderManagementIRPSystemId.IRP
        && order.activeCandidatesCount && order.activeCandidatesCount > 0) {
        return this.threeDotsMenuOptionsIRP['moreMenu'];
      }
    }
    if(this.activeSystem === OrderManagementIRPSystemId.IRP){
      return this.canReOpen(order)
      ? this.threeDotsMenuOptionsIRP['moreMenuWithReOpenButton']
      : this.threeDotsMenuOptionsIRP['moreMenuWithCloseButton'];
    }
    else{
      return this.canReOpen(order)
      ? this.threeDotsMenuOptions['moreMenuWithReOpenButton']
      : this.getMenuItems(order, 'moreMenuWithCloseButton');
    }
  }

  public getMenuForReorders(order: OrderManagement): ItemModel[] {
    if (order.children?.some((child) => OrderStatus.Filled === child.orderStatus)) {
      if(this.activeSystem===OrderManagementIRPSystemId.IRP)
        return this.threeDotsMenuOptionsIRP['filledReOrdersMenu'];
      else
      return this.threeDotsMenuOptions['filledReOrdersMenu'];
    }

    if (!order.children?.length && order.orderCloseDate && order.status !== OrderStatus.Closed) {
      if(this.activeSystem===OrderManagementIRPSystemId.IRP)
        return this.threeDotsMenuOptionsIRP['moreMenu'];
      else
        return this.threeDotsMenuOptions['moreMenu'];
    }
    if(this.activeSystem===OrderManagementIRPSystemId.IRP)
        return this.threeDotsMenuOptionsIRP['reOrdersMenu'];
      else
        return this.threeDotsMenuOptions['reOrdersMenu'];
  }

  public canReOpen(order: OrderManagement): boolean {
    return order?.status !== OrderStatus.Closed && Boolean(order?.orderClosureReasonId);
  }

  private onCommentRead(): void {
    this.actions$
      .pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(UpdateGridCommentsCounter))
      .subscribe((data) => {
        if (data.orderId && this.selectedRowRef) {
          this.selectedRowRef.data.unreadComments -= data.readComments;
          this.gridWithChildRow.setRowData(data.orderId, this.selectedRowRef.data);
          this.cd$.next(true);
        }
      });
  }

  private applyDashboardFilters(): OrderFilter {
    const filters = {} as OrderFilter;

    this.orderStaus > 0 ? this.numberArr.push(this.orderStaus) : [];

    const candidatesOrderStatusList = this.globalWindow.localStorage.getItem('candidatesOrderStatusListFromDashboard');
    if(candidatesOrderStatusList){
      this.numberArr = [];
      JSON.parse(candidatesOrderStatusList).forEach((data:any)=>{
        this.numberArr.push(data.value);
        data.name = data.name.replace(/\s/g, '');
        this.SelectedStatus.push(data.name)
      })
      this.documentEle.defaultView?.localStorage.setItem('candidatesOrderStatusListFromDashboard', '');
    }
    if(this.ltaOrderFlag){
      this.filters.ltaOrder = this.ltaOrderFlag;
      this.clearFilters();
    }
    filters.orderStatuses = this.numberArr;
    this.candidateStatusId!= '' ? this.candidateStatusIds.push(this.candidateStatusId) : [];
    filters.candidateStatuses = this.candidateStatusIds;
    filters.orderStatuses = this.orderPositionStatus
      ? [this.orderPositionStatus.replace(/\s*\([^)]*\)\s*|\s+/g, '')]
      : [];

    const dashboardFilterState = this.globalWindow.localStorage.getItem('dashboardFilterState') || 'null';
    const items = JSON.parse(dashboardFilterState) as FilteredItem[] || [];
    let pendingApprovalOrders = this.globalWindow.localStorage.getItem('pendingApprovalOrders') || 'null';
    if (pendingApprovalOrders != '') {
      this.store.dispatch(new PreservedFilters.ResetPageFilters());
    }
    const filteredItems = items.filter((item: FilteredItem) =>
      (item.organizationId === this.organizationId && item.column !== FilterColumnTypeEnum.ORGANIZATION)
      || item.column === FilterColumnTypeEnum.SKILL
    );

    filteredItems.forEach((item: FilteredItem) => {
      const filterKey = item.column as keyof OrderFilter;
      if (filterKey in filters) {
        (filters[filterKey] as number[]).push(item.value);
      } else {
        (filters[filterKey] as number[]) = [item.value];
      }
    });
    const clearedtostarttotal = this.globalWindow.localStorage.getItem('clearedtostarttotal');
    const startend =  JSON.parse(this.globalWindow.localStorage.getItem('cleatedtostartdate') || '""');
    var dates = startend.split('-');
    var startDate = new Date(dates[0]);;
    var endDate = new Date(dates[1]);
   if(clearedtostarttotal)
    {
      filters.ActualStartDate=this.datePipe.transform(startDate, 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'');;
      filters.ActualEndDate=this.datePipe.transform(endDate, 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\''); 
      filters.IsClearToStartDashboard=true
      this.documentEle.defaultView?.localStorage.setItem('clearedtostarttotal', '');
      this.documentEle.defaultView?.localStorage.setItem('cleatedtostartdate', '');
      this.clearedtoStartWidget=true;
    }
    const clearedtostart= this.globalWindow.localStorage.getItem('clearedtostart');
    if(clearedtostart)
    {
      filters.ActualStartDate=this.datePipe.transform(startDate, 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'');;
      filters.ActualEndDate=this.datePipe.transform(endDate, 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\''); 
      filters.IsClearToStartDashboard=true 
       filters.IsWidgetClearToStart=true
      this.documentEle.defaultView?.localStorage.setItem('clearedtostart', '');
      this.documentEle.defaultView?.localStorage.setItem('cleatedtostartdate', '');
      this.clearedtoStartWidget=true;
    }
    this.orderPositionStatus = null;
    this.isRedirectedFromDashboard = false;

    return filters;
  }

  private listenRedirectFromExtension(): void {
    this.orderManagementService.orderId$
      .pipe(takeUntil(this.unsubscribe$), filter(Boolean), debounceTime(300))
      .subscribe((data: { id: number; prefix: string }) => {
        this.currentPage = 1;
        this.orderId = data.id;
        this.prefix = data.prefix;
        this.clearFilters();
        this.filters.orderPublicId = this.prefix + '-' + this.orderId;
        this.OrderFilterFormGroup.controls['orderPublicId'].setValue(this.prefix + '-' + this.orderId);
        this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns);
        this.getOrders(true);
        this.redirectfromextension = true;
      });
  }

  private openIRPdialog(orderData : IRPOrderManagement){
    this.node = {data : orderData};
    this.selectedDataRow = orderData;
    const options = {} as DialogNextPreviousOption;
    this.store.dispatch(new GetOrderById(orderData.id, orderData.organizationId,options, true));
    if (orderData.status !== OrderStatus.Incomplete) {
      this.dispatchAgencyOrderCandidatesList(orderData.id, orderData.organizationId, true);
    }
    this.selectedCandidateMeta = this.selectedCandidate = this.selectedReOrder = null;
    this.openChildDialog.next(false);
    this.orderPositionSelected$.next({ state: false });
    this.openDetails.next(true);
    this.redirectfromextension = false;
  }

  private listenRedirectFromPerDiem(): void {
    this.orderManagementService.reorderId$
      .pipe(takeUntil(this.unsubscribe$), filter(Boolean), debounceTime(300))
      .subscribe((data: { id: number; prefix: string }) => {
        this.orderId = data.id;
        this.prefix = data.prefix;
        this.clearFilters();
        this.redirectFromPerdiem = true;
        this.filters.orderPublicId = this.prefix + '-' + this.orderId;
        this.OrderFilterFormGroup.controls['orderPublicId'].setValue(this.prefix + '-' + this.orderId);
        this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns);
        this.getOrders(true);
      });
  }

  private listenRedirectFromReOrder(): void {
    this.orderManagementService.orderPerDiemId$
      .pipe(
        takeUntil(this.unsubscribe$),
        debounceTime(50)
      )
      .subscribe((data: { id: number; prefix: string }) => {
        this.orderPerDiemId = data.id;
        this.prefix = data.prefix;
        this.clearFilters();
        this.redirectFromPerdiem = true;
        this.filters.orderPublicId = this.prefix + '-' + this.orderPerDiemId;
        this.OrderFilterFormGroup.controls['orderPublicId'].setValue(this.prefix + '-' + this.orderPerDiemId);
        this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns);
        this.getOrders(true);
        this.cd.markForCheck();
      });
  }

  private hasOrderAllOrdersId(): void {
    const { selectedOrderAfterRedirect } = this.orderManagementService;
    if (selectedOrderAfterRedirect) {
      this.OrderFilterFormGroup.patchValue({ orderId: selectedOrderAfterRedirect.orderId.toString() });
      this.filters = this.OrderFilterFormGroup.getRawValue();
      if (!Array.isArray(this.filters.contactEmails)) {
        this.filters.contactEmails = this.filters.contactEmails ? [this.filters.contactEmails] : this.filters.contactEmails;
      }
      this.filters.orderPublicId = selectedOrderAfterRedirect.prefix + '-' + selectedOrderAfterRedirect.orderId;
      this.filters.agencyType = null;
      this.filters.includeReOrders = false;
      this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns);

      if (selectedOrderAfterRedirect.orderType === OrderType.ReOrder) {
        this.filters.orderTypes = [OrderType.ReOrder];
      }
    }
  }

  updateOrderDetails(order: Order | OrderManagement): void {
    this.store.dispatch(new GetOrderById(order.id, order.organizationId as number, undefined,
      this.activeSystem === OrderManagementIRPSystemId.IRP ));
    this.dispatchAgencyOrderCandidatesList(order.id, order.organizationId as number, !!order.irpOrderMetadata);
    this.getOrders(true);
  }

  updatePositionDetails(position: OrderManagementChild): void {
    this.getOrders(true);
    this.store.dispatch(new GetOrganisationCandidateJob(position.organizationId, position.jobId));
    this.candidatesJob$.pipe(take(2), filter(Boolean)).subscribe((res) => {
      this.selectedCandidate = {
        ...position,
        closeDate: res.closeDate,
        positionClosureReason: res.positionClosureReason,
        positionClosureReasonId: res.positionClosureReasonId,
        orderStatus: res.orderStatus,
        candidateStatus: res.applicantStatus.applicantStatus,
        actualStartDate: res.actualStartDate,
        actualEndDate: res.actualEndDate,
      };
      this.cd.detectChanges();
      this.dispatchAgencyOrderCandidatesList(this.selectedCandidate.orderId, this.selectedCandidate.organizationId,
        this.selectedCandidate.irpOrderMetadata);
    });
  }

  updatePositionDetailsforIRP(position: IRPOrderPosition): void{
    this.getOrders(true);
    this.getIrpCandidatesforExtension$.pipe(take(2), filter(Boolean)).subscribe((res) => {
      res.items.filter(irpcandidate => irpcandidate.candidateJobId !== null && this.orderData.candidateProfileId === irpcandidate.candidateProfileId ? this.selectedCandidateforIRP = irpcandidate : "");
      const orderData = this.selectedCandidateforIRP as IRPOrderPosition;
      if (orderData.isTemplate) {
        this.store.dispatch(new GetSelectedOrderById(this.selectedOrder.id, true));
        this.navigateToOrderTemplateForm(this.selectedOrder.id, true);
      }
      else {
        this.selectedDataRow = orderData as unknown as IRPOrderManagement;
        this.dispatchAgencyOrderCandidatesList(this.selectedOrder.id, orderData.organizationId, true);
        this.selectedCandidateMeta = this.selectedCandidate = this.selectedReOrder = null;
        this.openChildDialog.next(false);
        this.orderPositionSelected$.next({ state: false });
        this.openDetails.next(true);
      }
      this.store.dispatch(new GetOrderById(this.selectedOrder.id, this.selectedOrder.organizationId as number, undefined, true, "IRP"));
      this.cd.detectChanges();
    });
   }


  private handleRedirectFromQuickOrderToast(): void {
    if (this.isRedirectedFromToast) {
      const prefix = this.prefix || '';
      this.orderManagementService.orderId$.next({ id: this.quickOrderId, prefix: prefix });
    }
  }

  private showFilterFormAfterOpenDialog(): void {
    this.actions
      .pipe(ofActionDispatched(ShowFilterDialog), takeUntil(this.unsubscribe$), debounceTime(200))
      .subscribe((isOpen) => (this.showFilterForm = isOpen.isDialogShown));
  }

  private getProjectSpecialData(): void {
    this.organizationId$.pipe(
      filter((id) => !!id),
      tap(() => {
        this.store.dispatch(new GetProjectSpecialData());
      }),
      switchMap(() => this.projectSpecialData$),
      filter((project) => !!project),
      take(1),
    ).subscribe((data) => {
      const { poNumbers, projectNames, specialProjectCategories } = data;
      this.filterColumns.projectTypeIds.dataSource =this.activeSystem === OrderManagementIRPSystemId.IRP? specialProjectCategories.filter(f=>f.includeInIRP == true) :  specialProjectCategories.filter(f=>f.includeInVMS == true);
      // this.filterColumns.projectNameIds.dataSource = projectNames;
      this.filterColumns.poNumberIds.dataSource = poNumbers;
      this.filterColumns.shift.dataSource = this.shift;
      this.cd$.next(true);
    });
  }

  private initMenuItems(): void {
    this.threeDotsMenuOptions = ThreeDotsMenuOptions(this.canCreateOrder, this.canCloseOrder, this.activeSystem);
    this.threeDotsMenuOptionsIRP = ThreeDotsMenuOptionsIRP(this.canCreateOrderIRP, this.canCloseOrderIRP, this.activeSystem);
  }

  private watchForPermissions(): void {
    this.getPermissionStream().pipe(takeUntil(this.unsubscribe$)).subscribe((permissions: Permission) => {
      this.hasCreateEditOrderPermission = permissions[this.userPermissions.CanCreateOrders]
        || permissions[this.userPermissions.CanOrganizationEditOrders];
      this.canViewOrderVMS = permissions[this.userPermissions.CanOrganizationViewOrders];
      this.canViewOrderIRP=permissions[this.userPermissions.CanOrganizationViewOrdersIRP]
      this.canEditOrderIRP=permissions[this.userPermissions.CanOrganizationEditOrdersIRP]
      this.canViewOrderVMS=permissions[this.userPermissions.CanOrganizationViewOrders];
      this.cd$.next(true);
    });
  }

  private subscribeToCandidateJob(subrow?: boolean): void {
      this.getIrpCandidatesforExtension$.pipe(take(2), filter(Boolean)).subscribe((res) => {
        if(!subrow){
          res.items.filter(irpcandidate => irpcandidate.candidateJobId !== null ? this.selectedCandidateforIRPorderDetails = irpcandidate : "");
        } else {
          res.items.filter(irpcandidate => irpcandidate.candidateJobId !== null && this.orderData.candidateProfileId === irpcandidate.candidateProfileId ? this.selectedCandidateforIRP = irpcandidate : "");
        }
      });
  }

  private subscribeForDeployedEmployees(): void {
    this.organizationSettingService.getOrganizationSettings().subscribe(data => {
      const showdeployedEmployee = data.filter(settingdata => settingdata.settingKey === SettingsKeys.ShowDeployedEmployees);
      this.DeployedEmployeeConfigValue = Object.assign({},...showdeployedEmployee)?.value && JSON.parse(Object.assign({},...showdeployedEmployee)?.value);
    });
  }


  private dispatchAgencyOrderCandidatesList(orderId: number, organizationId: number, isIrp: boolean): void {
    const irpIncludeDeploy = this.selectedDataRow?.orderType === OrderJobType.PerDiem ? true : this.employeeToggleState?.includeDeployed;

    this.store.dispatch(new GetAgencyOrderCandidatesList(
      orderId,
      organizationId,
      GRID_CONFIG.initialPage,
      GRID_CONFIG.initialRowsPerPage,
      this.orderManagementService.excludeDeployed,
      ""
    ));
    if (isIrp) {
      this.store.dispatch(new GetIrpOrderCandidates(
        orderId,
        organizationId,
        GRID_CONFIG.initialPage,
        GRID_CONFIG.initialRowsPerPage,
        this.employeeToggleState?.isAvailable,
        this.deployedState !== undefined ? this.deployedState : this.DeployedEmployeeConfigValue,
        ""
      ));
      this.store.dispatch(new GetIrpOrderExtensionCandidates(
        orderId,
        organizationId,
        GRID_CONFIG.initialPage,
        GRID_CONFIG.initialRowsPerPage,
        this.employeeToggleState?.isAvailable,
        this.deployedState !== undefined ? this.deployedState : this.DeployedEmployeeConfigValue,
        ""
      ));
    }
  }

  private getOrganization(businessUnitId: number) {
    const id = businessUnitId || this.store.selectSnapshot(UserState.user)?.businessUnitId as number;

    this.store.dispatch(new GetOrganizationById(id)).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      const { isIRPEnabled, isVMCEnabled } =
        this.store.selectSnapshot(OrganizationManagementState.organization)?.preferences || {};

      this.isOrgIRPEnabled = !!isIRPEnabled;
      this.isOrgVMSEnabled = !!isVMCEnabled;
      if(!this.isRedirectedFromDashboard){
        this.setPreviousSelectedSystem();
      }
      if (this.previousSelectedSystemId === OrderManagementIRPSystemId.IRP && !this.isOrgIRPEnabled) {
        this.activeSystem = OrderManagementIRPSystemId.VMS;
        this.store.dispatch(new SetHelpSystem(false));
      } else if (this.previousSelectedSystemId === OrderManagementIRPSystemId.IRP && this.isOrgIRPEnabled) {
        this.activeSystem = OrderManagementIRPSystemId.IRP;
        this.store.dispatch(new SetHelpSystem(true));
        this.getPreservedFiltersByPage();
      }

      if (this.previousSelectedSystemId === OrderManagementIRPSystemId.VMS && !this.isOrgVMSEnabled) {
        this.activeSystem = OrderManagementIRPSystemId.IRP;
        this.store.dispatch(new SetHelpSystem(true));
      } else if (this.previousSelectedSystemId === OrderManagementIRPSystemId.VMS && this.isOrgVMSEnabled) {
        this.activeSystem = OrderManagementIRPSystemId.VMS;
        this.store.dispatch(new SetHelpSystem(false));
      }

      if (!this.previousSelectedSystemId) {
        this.activeSystem = DetectActiveSystem(this.isOrgIRPEnabled, this.isOrgVMSEnabled);
        this.store.dispatch(new SetHelpSystem(this.activeSystem === OrderManagementIRPSystemId.IRP));
      }
      this.systemGroupConfig = SystemGroupConfig(this.isOrgIRPEnabled, this.isOrgVMSEnabled, this.activeSystem,this.canOrderJourney);
      if(!this.canViewOrderIRP){
        this.isOrgIRPEnabled = false;
        let irpIndex = this.systemGroupConfig.findIndex(ordertab => ordertab.title === "IRP");
        if(irpIndex){
          this.systemGroupConfig.splice(irpIndex, 1);
        }
      }
      if(!this.canViewOrderVMS){
        this.isOrgVMSEnabled = false;
        let vmsIndex = this.systemGroupConfig.findIndex(ordertab => ordertab.title === "VMS");
        if(vmsIndex){
          this.systemGroupConfig.splice(vmsIndex,1);
        }
      }
      if(this.canViewOrderIRP && !this.canViewOrderVMS){
        this.activeSystem = OrderManagementIRPSystemId.IRP;
        this.store.dispatch(new SetHelpSystem(true));
      }
      this.systemGroupConfig = SystemGroupConfig(this.isOrgIRPEnabled, this.isOrgVMSEnabled, this.activeSystem,this.canOrderJourney);
      this.cd.detectChanges();
      this.setOrderTypesFilterDataSource();
      this.initMenuItems();
      this.initGridColumns();
      this.getOrders();
      this.getProjectSpecialData();
      this.checkEnableClearToStart();
      this.previousSelectedSystemId = null;
      this.orderManagementService.saveSelectedOrderManagementSystem(this.activeSystem);
    });
  }

  private firstInitGridColumns(): void {
    of(null).pipe(
      delay(1000),
      take(1),
      takeUntil(this.unsubscribe$),
    ).subscribe(() => {
      this.initGridColumns();
    });
  }

  private initGridColumns(): void {
    this.columnDefs = OrderManagementIrpGridHelper.prepareColDefs(
      this.activeSystem,
      this.activeIRPTabIndex,
      this.threeDotsMenuOptionsIRP,
      this.canCreateOrder,
      this.settings[SettingsKeys.IsReOrder]?.value,
      this.hasCreateEditOrderPermission,
      this.isOrgIRPEnabled,
      this.isOrgVMSEnabled,
    );

    this.cd$.next(true);
  }

  private setPreviousSelectedSystem(): void {
    this.previousSelectedSystemId = this.orderManagementService.getOrderManagementSystem();
  }

  private getDeviceScreen(): void {
    this.breakpointService.getBreakpointMediaRanges().pipe(takeUntil(this.unsubscribe$)).subscribe((screen) => {
      this.isMobile = screen.isMobile;
      this.isTablet = screen.isTablet;
      this.isSmallDesktop = screen.isDesktopSmall;
      this.isDesktop = screen.isDesktopLarge;
      this.gridDomLayout = this.isMobile ? 'autoHeight' : 'normal';
      this.cd.markForCheck();
    });
  }

  private initResizeObserver(): void {
    this.resizeObserver = ResizeObserverService.init(this.targetElement!);
  }

  private watchForUpdateCandidate(): void {
    this.orderManagementService.getCandidate().pipe(
      filter(Boolean),
      takeUntil(this.unsubscribe$),
    ).subscribe(() => {
      const options = this.getDialogNextPreviousOption(this.selectedDataRow, true);
      this.store.dispatch([
        new GetIRPOrders(this.filters),
        new GetOrderById(this.selectedOrder.id, this.selectedOrder.organizationId as number, options, true),
      ]);
    });
  }

  private listenParentContainerWidth(): void {
    const resizeToolbarObserver$: Observable<number> = this.resizeObserver.resize$.pipe(
      map((data) => data[0].contentRect.width),
      distinctUntilChanged()
    );

    resizeToolbarObserver$.pipe(throttleTime(150), takeUntil(this.unsubscribe$)).subscribe((toolbarWidth) => {
      this.isContentSmallDesktop = toolbarWidth <= SmallDesktopWidth && (this.isDesktop || this.isSmallDesktop);
      this.isContentTabletWidth = toolbarWidth <= TabletWidth && !this.isTablet;
      this.isMiddleTabletWidth = toolbarWidth <= MiddleTabletWidth && (this.isTablet || this.isMobile);
      this.cd.markForCheck();
    });
  }

  public smallMenuSelected({ item: { text } }: MenuEventArgs): void {
    switch (text) {
      case MobileMenuItems.Filters:
        this.showFilters();
        break;
      case MobileMenuItems.Import:
        this.openImportDialog();
        break;
      case MobileMenuItems.ExportCSV:
        this.defaultExport(ExportedFileType.csv);
        break;
      case MobileMenuItems.ExportCustom:
        this.customExport();
        break;
      case MobileMenuItems.ExportExel:
        this.defaultExport(ExportedFileType.excel);
        break;
    }
  }

  public getapprovalorder(): void {
    this.orgpendingOrderapproval = JSON.parse(localStorage.getItem('pendingApprovalOrders') || '""') as string;
  }

  @OutsideZone
  private clearStorage(): void {
    setTimeout(() => {
      this.globalWindow.localStorage.setItem('pendingApprovalOrders', JSON.stringify(''));
      this.orgpendingOrderapproval = '';
    }, 5000);
  }

  private getLocationState(): void {
    const locationState = this.location.getState() as
      { orderId: number, orderManagementPagerState: OrderManagementPagerState,candidateJobId:number, organizationId:number,clearToStartValue:boolean  };
    this.previousSelectedOrderId = locationState.orderId;
    this.orderManagementPagerState = locationState?.orderManagementPagerState;
    this.pageSize = this.orderManagementPagerState?.pageSize ?? this.pageSize;
    if(locationState?.clearToStartValue != null){
      this.clearToStartDataset.clearToStart = locationState?.clearToStartValue;
      this.clearToStartDataset.jobId = locationState?.candidateJobId;
      this.clearToStartDataset.organizationId = locationState?.organizationId;
      this.store.dispatch(new SaveClearToStart(this.clearToStartDataset));
      this.orderManagementService.setCurrentClearToStartVal(locationState?.clearToStartValue);
    }

    this.cd.markForCheck();
  }

  private getPreservedFiltersByPage(): void {
    this.store.dispatch(new PreservedFilters.GetPreservedFiltersByPage(this.getPageName()));
  }

  private saveFiltersByPageName(): void {
    this.store.dispatch(new PreservedFilters.SaveFiltersByPageName(this.getPageName(), { ...this.filters }));
  }

  private refreshFilterState(): void {
    this.filterApplied = true;
    this.filters = this.OrderFilterFormGroup.getRawValue();
    if (!Array.isArray(this.filters.contactEmails)) {
      this.filters.contactEmails = this.filters.contactEmails
        ? [this.filters.contactEmails]
        : this.filters.contactEmails;
    }
    this.filters.firstNamePattern = this.filters.firstNamePattern || null;
    this.filters.lastNamePattern = this.filters.lastNamePattern || null;
    this.filters.orderPublicId = this.filters.orderPublicId || null;
    this.filters.billRateFrom = this.filters.billRateFrom || null;
    this.filters.billRateTo = this.filters.billRateTo || null;
    this.filters.jobStartDate = this.filters.jobStartDate || null;
    this.filters.jobEndDate = this.filters.jobEndDate || null;
    this.filters.annualSalaryRangeFrom = this.filters.annualSalaryRangeFrom || null;
    this.filters.annualSalaryRangeTo = this.filters.annualSalaryRangeTo || null;
    this.filters.candidatesCountFrom = this.filters.candidatesCountFrom || null;
    this.filters.candidatesCountTo = this.filters.candidatesCountTo || null;
    this.filters.openPositions = this.filters.openPositions || null;
    this.filters.orderTypes = this.filters.orderTypes || [];
    this.filters.irpOnly = !!this.filters.irpOnly;
    this.filters.orderDistributionType=this.filters.orderDistributionType || null;
  }

  private getPageName(): FilterPageName {
    if (this.isActiveSystemIRP) {
      return FilterPageName.OrderManagementIRPOrganization;
    } else {
      return FilterPageName.OrderManagementVMSOrganization;
    }
  }

  private setupDefaultStatuses(data: OrderFilterDataSource): void {
    let statuses: FilterOrderStatus[] = [];
    let candidateStatuses: FilterStatus[] = [];

    if (this.activeTab === OrganizationOrderManagementTabs.ReOrders) {
      statuses = data.orderStatuses.filter((status) => ReorderDefaultStatuses.includes(status.status));
      candidateStatuses = data.candidateStatuses.filter((status) => ReorderCandidateStatuses.includes(status.status));
    } else if (this.activeTab === OrganizationOrderManagementTabs.PerDiem) {
      statuses = data.orderStatuses.filter((status: FilterOrderStatus) =>
        ![PerDiemDefaultStatuses,FilterOrderStatusText.OrdersOpenPositions].includes(status.status)
      );
      candidateStatuses = data.candidateStatuses.filter((status) => StatusesByDefault.includes(status.status));
    }
    else if (this.activeTab === OrganizationOrderManagementTabs.PermPlacement || this.activeTab === OrganizationOrderManagementTabs.Incomplete) {
      statuses = data.orderStatuses.filter((status: FilterOrderStatus) =>
        ![FilterOrderStatusText.OrdersOpenPositions].includes(status.status)
      );
      candidateStatuses = data.candidateStatuses.filter((status) => !AllCandidateStatuses.includes(status.status)).sort((a, b) => a.filterStatus && b.filterStatus ? a.filterStatus.localeCompare(b.filterStatus) : a.statusText.localeCompare(b.statusText));
    }
     else if (this.orgpendingOrderapproval === LocalStorageStatus.OrdersforApproval) {
      if (this.activeTab === OrganizationOrderManagementTabs.AllOrders) {
        statuses = data.orderStatuses.filter((status: FilterOrderStatus) =>
          !AllOrdersDefaultStatuses.includes(status.status)
        );
        candidateStatuses = data.candidateStatuses.filter((status) => StatusesByDefault.includes(status.status));
      }
    } else if (this.orgpendingOrderapproval === LocalStorageStatus.Ordercountzero) {
      if (this.activeTab === OrganizationOrderManagementTabs.AllOrders) {
        statuses = [
          {
            status: FilterOrderStatusText.NoRecordsFound,
            statusText: FilterOrderStatusText.NoRecordsFound,
          },
        ];
        candidateStatuses = [];
      }
    } else {
      data.orderStatuses.forEach((val:any)=> val.status = val.status.trim());
      statuses = data.orderStatuses;
      candidateStatuses = data.candidateStatuses.filter((status) => !AllCandidateStatuses.includes(status.status)).sort((a, b) => a.filterStatus && b.filterStatus ? a.filterStatus.localeCompare(b.filterStatus) : a.statusText.localeCompare(b.statusText));
    }

    this.filterColumns.orderStatuses.dataSource = statuses;
    this.filterOrderJourneyColumns.orderStatuses.dataSource = statuses;
    this.filterColumns.reorderStatuses.dataSource = data.reorderStatuses;
    this.filterColumns.agencyIds.dataSource = data.partneredAgencies;
    this.filterColumns.candidateStatuses.dataSource = candidateStatuses;
    const candidatesOrderStatusList =  this.globalWindow.localStorage.getItem('candidateStatusListFromDashboard') ? JSON.parse(this.globalWindow.localStorage.getItem('candidateStatusListFromDashboard') || '') :'';
    if(candidatesOrderStatusList != ''){
      const candstatuses = this.filterColumns.candidateStatuses.dataSource.filter((f: { status: any; })=>candidatesOrderStatusList.map((m: { value: any; })=>m.value).includes(f.status))
      const candidateStatuses = candstatuses.map((m: { filterStatus: any; })=>m.filterStatus);
      this.numberArr = [];
      candidateStatuses.forEach((candidateStatuses:any)=>{
        this.numberArr.push(candidateStatuses);
        this.candidateStatusIds.push(candidateStatuses)
      })
      this.documentEle.defaultView?.localStorage.setItem('candidateStatusListFromDashboard', JSON.stringify(''));
    }
    const orderTypeInWidget = this.globalWindow.localStorage.getItem('orderTypeFromDashboard') ? JSON.parse(this.globalWindow.localStorage.getItem('orderTypeFromDashboard') || '') :'';
    if(orderTypeInWidget != ''){
      this.filters.orderTypes = [OrderType.LongTermAssignment,OrderType.ContractToPerm];
      this.documentEle.defaultView?.localStorage.setItem('orderTypeFromDashboard', '');
    }
  }

  private prepareFiltersToDispatch(state: OrderFilter): void {
    if (this.orderManagementPagerState) {
      this.filters = { ...this.orderManagementPagerState.filters };
      return;
    }

    if (this.isRedirectedFromDashboard) {
      this.filters = this.applyDashboardFilters();
      return;
    }

    const filterState = { ...state, orderStatuses: state?.orderStatuses ? [...state.orderStatuses] : [] };
    const filterFormConfig = this.isActiveSystemIRP
      ? GetIRPFilterFormConfig(this.activeIRPTabIndex)
      : GetVMSFilterFormConfig(this.activeTab);

    this.filters = this.filterService.composeFilterState(filterFormConfig, filterState);
    this.filters.clearedToStart = this.isEnableClearedToStart ? this.filters.clearedToStart == false ? "no" : this.filters.clearedToStart == true ? 'yes' : null : null;
    if (this.activeTab === OrganizationOrderManagementTabs.Incomplete && this.filters) {
      this.filters  = this.checkFiltersForIncompleteTab(this.filters);
    }
  }

  private dispatchPreservedFilters(): void {
    let filterState = this.store.selectSnapshot(PreservedFiltersState.preservedFiltersState) as OrderFilter;

    const isIncompleteTab =
    (this.activeTab === OrganizationOrderManagementTabs.Incomplete && this.activeSystem === OrderManagementIRPSystemId.VMS)
    || (this.activeIRPTabIndex === OrderManagementIRPTabsIndex.Incomplete
      && this.activeSystem === OrderManagementIRPSystemId.IRP);

    if (isIncompleteTab) {
      filterState = this.checkFiltersForIncompleteTab(filterState);
    }

    if (filterState) {
      this.prepareFiltersToDispatch(filterState);
      this.getOrders(true);
    }
  }

  onOrderJourneyRowClick(event: any): void {
    this.rowSelected(event, this.gridWithChildRow);
  }
  onOrderJourneyRowDeselect(event: any, grid: any): void {
    this.rowDeselected(event, grid);
  }

  public onOrderJourneyFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.OrderJourneyFilterFormGroup, this.filterOrderJourneyColumns);
    this.OrderJourneyFilterFormGroup.markAsDirty();
  }

  public onOrderJourneyFilterClearAll(): void {
    this.store.dispatch(new PreservedFilters.ClearPageFilters(this.getPageName()));
    this.filterApplied = true;
    this.orderManagementService.selectedOrderAfterRedirect = null;
    this.clearOrderJourneyFilters();
    this.getOrders(true);
  }
  private clearOrderJourneyFilters(): void {
    this.OrderJourneyFilterFormGroup.reset();
    this.OrderJourneyFilterFormGroup.controls['includeInIRP'].setValue(true);
    this.OrderJourneyFilterFormGroup.controls['includeInVMS'].setValue(true);
    this.filteredOrdersJourneyItems = [];
    this.currentPage = this.orderManagementPagerState?.page ?? 1;
    this.filtersOrderJourney = {};
    this.search?.clear();
  }
  public onOrderJourneyFilterApply(): void {
    if(!this.OrderJourneyFilterFormGroup.get("includeInIRP")?.value && !this.OrderJourneyFilterFormGroup.get("includeInVMS")?.value){
      this.store.dispatch(new ShowToast(MessageTypes.Error, "Please select atleast one system"));
      return;
    }
    if (this.OrderJourneyFilterFormGroup.dirty) {
      this.refreshOrderJourneyFilterState();
      this.filters = PrepareOrderFilterDates(this.filtersOrderJourney, OrderJourneyFilterDates);
      this.saveFiltersOrdersJourneyByPageName();
      this.getOrders(true);
      this.store.dispatch(new ShowFilterDialog(false));
      this.OrderJourneyFilterFormGroup.markAsPristine();
      this.filteredOrdersJourneyItems = this.filterService.generateChips(
        this.OrderJourneyFilterFormGroup,
        this.filterOrderJourneyColumns,
      );
    } else {
      this.store.dispatch(new ShowFilterDialog(false));
    }
  }
  private patchOrdersJourneyFilterForm(prepopulate = false): void {
    this.OrderJourneyFilterFormGroup.setValue({
      orderPublicId: this.filtersOrderJourney.orderPublicId || null,
      regionIds: this.filtersOrderJourney.regionIds || [],
      locationIds: this.filtersOrderJourney.locationIds || [],
      departmentsIds: this.filtersOrderJourney.departmentsIds || [],
      skillIds: this.filtersOrderJourney.skillIds || [],
      orderTypes:
        this.ifFilteredByOrderTypeVMS() || this.ifFilteredByOrderTypeIRP()
          ? []
          : this.filtersOrderJourney.orderTypes || [],
      jobTitle: this.filtersOrderJourney.jobTitle || null,
      jobStartDate: this.filtersOrderJourney.jobStartDate || null,
      jobEndDate: this.filtersOrderJourney.jobEndDate || null,
      orderStatuses: this.filtersOrderJourney.orderStatuses ? [...this.filtersOrderJourney.orderStatuses] : [],
      includeInIRP:this.filtersOrderJourney.includeInIRP ||this.OrderJourneyFilterFormGroup.get("includeInIRP")?.value,
      includeInVMS:this.filtersOrderJourney.includeInVMS ||this.OrderJourneyFilterFormGroup.get("includeInVMS")?.value
    });

    if (!prepopulate) {
      this.filteredOrdersJourneyItems = this.filterService.generateChips(this.OrderJourneyFilterFormGroup, this.filterOrderJourneyColumns, this.datePipe);
    }
  }
  public onOrderJourneyFilterClose() {
    this.patchOrdersJourneyFilterForm();
  }
  private refreshOrderJourneyFilterState(): void {
    this.filterApplied = true;
    this.filtersOrderJourney = this.OrderJourneyFilterFormGroup.getRawValue();
    this.filtersOrderJourney.orderPublicId = this.filtersOrderJourney.orderPublicId || null;
    this.filtersOrderJourney.jobStartDate = this.filtersOrderJourney.jobStartDate || null;
    this.filtersOrderJourney.jobEndDate = this.filtersOrderJourney.jobEndDate || null;
    this.filtersOrderJourney.orderTypes = this.filtersOrderJourney.orderTypes || [];
    this.filtersOrderJourney.orderStatuses = this.filtersOrderJourney.orderStatuses || [];
    this.filtersOrderJourney.includeInIRP = this.filtersOrderJourney.includeInIRP;
    this.filtersOrderJourney.includeInVMS = this.filtersOrderJourney.includeInVMS;
  }
  private saveFiltersOrdersJourneyByPageName(): void {
    this.store.dispatch(new PreservedFilters.SaveFiltersByPageName(this.getPageName(), { ...this.filtersOrderJourney }));
  }
  onClickSystem(obj: any) {
    if (obj == "IRP") {
      this.activeSystem = OrderManagementIRPSystemId.IRP;
      this.store.dispatch(new SetHelpSystem(true));
    } else if (obj == "VMS") {
      this.activeSystem = OrderManagementIRPSystemId.VMS;
      this.store.dispatch(new SetHelpSystem(false));
    }
    this.systemGroupConfig = SystemGroupConfig(this.isOrgIRPEnabled, this.isOrgVMSEnabled, this.activeSystem, this.canOrderJourney);
    this.clearFilters();
    this.clearOrderJourneyFilters();
    this.store.dispatch([new PreservedFilters.ResetPageFilters(), new ClearOrders()]);
    this.getPreservedFiltersByPage();
    this.orderManagementService.setOrderManagementSystem(this.activeSystem);

    this.setOrderTypesFilterDataSource();
    this.resetTabs();
    this.initMenuItems();
    this.initGridColumns();
    this.getOrders();
  }

  private getReOrdersByOrderId(orderId: number, resetReOrderPager = false): void {
    const pageSettings = this.store.selectSnapshot(ReOrderState.GetReOrderPageSettings);
    const pageNumber = resetReOrderPager ? GRID_CONFIG.initialPage : pageSettings.pageNumber;
    const pageSize = resetReOrderPager ? GRID_CONFIG.initialRowsPerPage : pageSettings.pageSize;

    this.store.dispatch(new GetReOrdersByOrderId(orderId, pageNumber, pageSize))
      .pipe(
        take(1),
        filter(() => resetReOrderPager)
      ).subscribe(() => {
        this.store.dispatch(new SaveReOrderPageSettings(pageNumber, pageSize, true));
      });
  }

  private getMoreMenuDataSource(order: OrderManagement): ItemModel[] {
    if (order.status === this.orderStatus.Closed) {
      return this.threeDotsMenuOptions['closedOrderMenu'];
    }
    if(order.statusText === this.deletedStatus.Deleted)
    {
      return this.threeDotsMenuOptions['deletedOrderMenu'];
    }
    if (this.activeTab === OrganizationOrderManagementTabs.ReOrders) {
      return this.getMenuForReorders(order);
    }
    if (!this.openInProgressFilledStatuses.includes(order.statusText.toLowerCase())) {
      return this.getMenuItems(order, 'moreMenuWithDeleteButton');
    } else {
      return this.getMoreMenu(order);
    }
  }

  private getMenuItems(order: OrderManagement, menuKey: string): ItemModel[] {
    const isPerDiem =
      this.activeTab !== OrganizationOrderManagementTabs.Incomplete && this.orderTypes.OpenPerDiem === order.orderType;
    const hideAddReOrderButton = !this.canCreateOrder
      || order.status === this.orderStatus.PreOpen
      || order.status === this.orderStatus.Closed
      || !this.settings[SettingsKeys.IsReOrder]?.value
      || !this.hasCreateEditOrderPermission;

    if (isPerDiem && !hideAddReOrderButton) {
       return [...this.threeDotsMenuOptions['moreMenuAddReOrderButton'], ...this.threeDotsMenuOptions[menuKey]];
    } else {
      return this.threeDotsMenuOptions[menuKey];
    }
  }

  private watchForOrderFromAnotherSystem(): void {
    this.orderManagementService.getOrderFromAnotherSystemStream()
      .pipe(
        filter((orderLinkDetails) => !!orderLinkDetails),
        takeUntil(this.unsubscribe$),
      )
      .subscribe((orderLinkDetails: OrderLinkDetails | null) => {
        if (orderLinkDetails?.system === OrderManagementIRPSystemId.IRP) {
          this.clearFilters();
          this.filters.orderPublicId = orderLinkDetails.orderId;
          this.OrderFilterFormGroup.get('orderPublicId')?.setValue(orderLinkDetails.orderId);
          this.isRedirectedFromVmsSystem = true;
          this.isCondidateTab = true;
        }

        this.systemGroup.selectButton({ id: orderLinkDetails?.system as OrderManagementIRPSystemId } as ButtonModel);
      });
  }

  @OutsideZone
  private openFirstIrpOrderDetails(): void {
    setTimeout(() => {
      const node = this.gridApi?.getRowNode('0');

      if (node) {
        this.openIrpDetails({node, data: node?.data});
      }
    });
  }

  @OutsideZone
  private selectFirstRow(): void {
    setTimeout(() => {
      this.gridApi?.selectIndex(0, false, false);
    }, 300);
  }
  public onSelect(args:any) {
    if (args.itemData.status == 'OrdersOpenPositions') {
      var liCollections = document.querySelectorAll(
        '.e-popup.custom .e-list-item'
      );
      for (var i = 0; i < liCollections.length; i++) {
        if ((liCollections[i] as any).innerText != 'Order(s) - Open Positions') {
          liCollections[i].classList.add('e-disabled');
          liCollections[i].classList.add('e-overlay');
        }
      }
    }
    else{
      var liCollections = document.querySelectorAll(
        '.e-popup.custom .e-list-item'
      );
      for (var i = 0; i < liCollections.length; i++) {
        if ((liCollections[i] as any).innerText == 'Order(s) - Open Positions') {
          liCollections[i].classList.add('e-disabled');
          liCollections[i].classList.add('e-overlay');
        }
      }
    }
  }
  public orderStatusSelect(){
    let orderStatus = this.OrderFilterFormGroup.get("orderStatuses")?.value;
    if (orderStatus == 'OrdersOpenPositions') {
      var liCollections = document.querySelectorAll(
        '.e-popup.custom .e-list-item'
      );
      for (var i = 0; i < liCollections.length; i++) {
        if ((liCollections[i] as any).innerText != 'Order(s) - Open Positions') {
          liCollections[i].classList.add('e-disabled');
          liCollections[i].classList.add('e-overlay');
        }
      }
    }
    else if(orderStatus != 'OrdersOpenPositions' && orderStatus.length != 0){
      var liCollections = document.querySelectorAll(
        '.e-popup.custom .e-list-item'
      );
      for (var i = 0; i < liCollections.length; i++) {
        if ((liCollections[i] as any).innerText == 'Order(s) - Open Positions') {
          liCollections[i].classList.add('e-disabled');
          liCollections[i].classList.add('e-overlay');
        }
      }
    }
  }

  private focusToRowWithoutSelect(rowIndex: number): void {
    const row = this.gridWithChildRow.getRowByIndex(rowIndex);
    row.scrollIntoView(true);
    this.gridWithChildRow.detailRowModule.expand(rowIndex);
  }

  @OutsideZone
  private scrollToSelectedReorder(): void {
    setTimeout(() => {
      this.gridWithChildRow.element.querySelector('.reorder-row.selected')?.scrollIntoView(true);
    }, 300);
  }

  private checkFiltersForIncompleteTab(filters: OrderFilter): OrderFilter {
     if (filters.orderStatuses && filters.orderStatuses.length) {
      filters.orderStatuses = [];
     }

     if (filters.agencyIds && filters.agencyIds) {
      filters.agencyIds = [];
     }

     if (filters.candidateStatuses && filters.candidateStatuses.length) {
      filters.candidateStatuses = [];
     }

     if (filters.candidatesCountFrom !== null && filters.candidatesCountFrom !== undefined) {
      filters.candidatesCountFrom = null;
     }

     if (filters.candidatesCountTo !== null && filters.candidatesCountTo !== undefined) {
      filters.candidatesCountTo = null;
     }

     if (filters.distributedOnFrom) {
      filters.distributedOnFrom = null;
     }

     if (filters.distributedOnTo) {
      filters.distributedOnTo = null;
     }

     if (filters.firstNamePattern) {
      filters.firstNamePattern = null;
     }

     if (filters.lastNamePattern) {
      filters.lastNamePattern = null;
     }

     if (typeof filters.orderLocked === 'boolean') {
      filters.orderLocked = null;
     }

     if (filters.openPositions !== null || filters.openPositions !== undefined) {
      filters.openPositions = null;
     }

     if (filters.orderDistributionType) {
      filters.orderDistributionType = null;
     }

     if (typeof filters.irpOnly === 'boolean') {
      filters.irpOnly = null;
     }

     if (this.activeSystem === OrderManagementIRPSystemId.IRP && filters.billRateFrom) {
      filters.billRateFrom = null;
     }

     if (this.activeSystem === OrderManagementIRPSystemId.IRP && filters.billRateTo) {
      filters.billRateTo = null;
     }

     return filters;
  }
}
