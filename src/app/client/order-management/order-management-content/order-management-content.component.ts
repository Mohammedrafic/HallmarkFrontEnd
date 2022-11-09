import { DatePipe, Location } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ApproveOrder,
  ClearOrders,
  ClearSelectedOrder,
  DeleteOrder,
  DeleteOrderSucceeded,
  DuplicateOrder,
  DuplicateOrderSuccess,
  ExportOrders,
  GetAgencyOrderCandidatesList,
  GetAvailableSteps,
  GetOrderById,
  GetOrderByIdSucceeded,
  GetOrderFilterDataSources,
  GetOrders,
  GetOrganisationCandidateJob,
  GetProjectSpecialData,
  GetSelectedOrderById,
  LockUpdatedSuccessfully,
  ReloadOrganisationOrderCandidatesLists,
  SelectNavigationTab,
  SetLock
} from '@client/store/order-managment-content.actions';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { Permission } from "@core/interface";
import { Actions, ofActionDispatched, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { GetAllOrganizationSkills, GetOrganizationSettings } from '@organization-management/store/organization-management.actions';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE, GRID_CONFIG } from '@shared/constants';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { OrganizationOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';
import { OrderType, OrderTypeOptions } from '@shared/enums/order-type';
import { AbstractPermissionGrid } from "@shared/helpers/permissions";
import { FilteredItem } from '@shared/models/filter.model';
import {
  FilterOrderStatus,
  FilterStatus,
  Order,
  OrderCandidateJob,
  OrderFilter,
  OrderFilterDataSource,
  OrderManagement,
  OrderManagementChild,
  OrderManagementPage
} from '@shared/models/order-management.model';
import { OrganizationLocation, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { Skill } from '@shared/models/skill.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { FilterService } from '@shared/services/filter.service';
import { DetailRowService, GridComponent, VirtualScrollService } from '@syncfusion/ej2-angular-grids';
import { SelectionSettingsModel, TextWrapSettingsModel } from '@syncfusion/ej2-grids/src/grid/base/grid-model';
import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';
import {
  catchError,
  combineLatest,
  debounceTime,
  EMPTY,
  filter,
  Observable,
  Subject,
  Subscription,
  take,
  takeUntil,
  throttleTime
} from 'rxjs';
import { CandidatesStatusText, FilterOrderStatusText, STATUS_COLOR_GROUP } from 'src/app/shared/enums/status';
import {
  SetHeaderState,
  ShowCloseOrderDialog,
  ShowExportDialog,
  ShowFilterDialog,
  ShowSideDialog,
  ShowToast
} from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import { ORDERS_GRID_CONFIG } from '../../client.config';
import {
  allOrdersChildColumnsToExport,
  AllOrdersColumnsConfig,
  allOrdersColumnsToExport,
  MoreMenuType,
  orderTemplateColumnsConfig,
  perDiemChildColumnsToExport,
  PerDiemColumnsConfig,
  perDiemColumnsToExport,
  PermPlacementColumnsConfig,
  permPlacementColumnsToExport,
  reOrdersChildColumnToExport,
  ReOrdersColumnsConfig,
  reOrdersColumnsToExport,
  ROW_HEIGHT
} from './order-management-content.constants';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { CandidatStatus } from '@shared/enums/applicant-status.enum';
import { SearchComponent } from '@shared/components/search/search.component';
import { OrderStatus } from '@shared/enums/order-management';
import { DashboardState } from 'src/app/dashboard/store/dashboard.state';
import { TabNavigationComponent } from '@client/order-management/order-management-content/tab-navigation/tab-navigation.component';
import { OrderDetailsDialogComponent } from '@client/order-management/order-details-dialog/order-details-dialog.component';
import isNil from 'lodash/fp/isNil';
import { OrderManagementService } from '@client/order-management/order-management-content/order-management.service';
import { isArray, isUndefined } from 'lodash';
import { FilterColumnTypeEnum } from 'src/app/dashboard/enums/dashboard-filter-fields.enum';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import { AddEditReorderService } from '@client/order-management/add-edit-reorder/add-edit-reorder.service';
import { SidebarDialogTitlesEnum } from '@shared/enums/sidebar-dialog-titles.enum';
import { UpdateGridCommentsCounter } from '@shared/components/comments/store/comments.actions';
import { OrganizationSettingsGet } from '@shared/models/organization-settings.model';
import { SettingsKeys } from '@shared/enums/settings';
import { SettingsHelper } from '@core/helpers/settings.helper';
import { MessageTypes } from '@shared/enums/message-types';
import { ReOpenOrderService } from '@client/order-management/reopen-order/reopen-order.service';
import { ProjectSpecialData } from '@shared/models/project-special-data.model';
import { FieldSettingsModel, MultiSelectComponent } from '@syncfusion/ej2-angular-dropdowns';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { PermissionService } from '../../../security/services/permission.service';
import { PreservedFiltersState } from 'src/app/store/preserved-filters.state';
import { PreservedFilters } from '@shared/models/preserved-filters.model';

@Component({
  selector: 'app-order-management-content',
  templateUrl: './order-management-content.component.html',
  styleUrls: ['./order-management-content.component.scss'],
  providers: [VirtualScrollService, DetailRowService, MaskedDateTimeService],
})
export class OrderManagementContentComponent extends AbstractPermissionGrid implements OnInit, OnDestroy {
  @ViewChild('grid') override gridWithChildRow: GridComponent;
  @ViewChild('search') search: SearchComponent;
  @ViewChild('detailsDialog') detailsDialog: OrderDetailsDialogComponent;
  @ViewChild('tabNavigation') tabNavigation: TabNavigationComponent;

  @ViewChild('orderStatusFilter') public readonly orderStatusFilter: MultiSelectComponent;

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

  @Select(OrganizationManagementState.allOrganizationSkills)
  skills$: Observable<Skill[]>;

  @Select(OrganizationManagementState.organizationSettings)
  organizationSettings$: Observable<OrganizationSettingsGet[]>;

  @Select(UserState.currentUserPermissions)
  currentUserPermissions$: Observable<any[]>;

  @Select(OrderManagementContentState.candidatesJob)
  private readonly candidatesJob$: Observable<OrderCandidateJob | null>;

  @Select(DashboardState.filteredItems) private readonly filteredItems$: Observable<FilteredItem[]>;

  @Select(PreservedFiltersState.preservedFilters) private readonly preservedFilters$: Observable<PreservedFilters>;

  @Select(OrderManagementContentState.projectSpecialData)
  public readonly projectSpecialData$: Observable<ProjectSpecialData>;
  public readonly specialProjectCategoriesFields: FieldSettingsModel = { text: 'projectType', value: 'id' };
  public readonly projectNameFields: FieldSettingsModel = { text: 'projectName', value: 'id' };
  public readonly poNumberFields: FieldSettingsModel = { text: 'poNumber', value: 'id' };

  public settings: { [key in SettingsKeys]?: OrganizationSettingsGet };
  public SettingsKeys = SettingsKeys;
  public activeTab: OrganizationOrderManagementTabs = OrganizationOrderManagementTabs.AllOrders;
  public allowWrap = ORDERS_GRID_CONFIG.isWordWrappingEnabled;
  public wrapSettings: TextWrapSettingsModel = ORDERS_GRID_CONFIG.wordWrapSettings;
  public showFilterForm = false;
  public isLockMenuButtonsShown = true;

  public moreMenuWithDeleteButton: ItemModel[];
  public moreMenuWithCloseButton: ItemModel[];
  public moreMenuWithReOpenButton: ItemModel[];
  public moreMenu: ItemModel[];
  public reOrdersMenu: ItemModel[];
  public closedOrderMenu: ItemModel[];

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

  private unsubscribe$: Subject<void> = new Subject();
  private pageSubject = new Subject<number>();
  private search$ = new Subject();
  public selectedDataRow: OrderManagement;

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
  public filters: OrderFilter = {};
  public filterColumns: any;
  public orgStructure: OrganizationStructure;
  public regions: OrganizationRegion[] = [];
  public previousSelectedOrderId: number | null;
  public selectedCandidate: any | null;
  public selectedReOrder: any | null;
  public openChildDialog = new Subject<any>();
  public isRowScaleUp: boolean = true;
  public isSubrowDisplay: boolean = false;
  public OrganizationOrderManagementTabs = OrganizationOrderManagementTabs;
  public orderStatus = OrderStatus;
  public reOrderCount$ = new Subject<number>();
  public orderTypes = OrderType;
  public canCreateOrder: boolean;
  public canCloseOrder: boolean;

  private selectedCandidateMeta: { order: number; positionId: number } | null;
  private selectedIndex: number | null;
  private ordersPage: OrderManagementPage;

  public columnsToExport: ExportColumn[];

  public fileName: string;
  public defaultFileName: string;
  public selectedRowRef: any;

  private isRedirectedFromDashboard: boolean;
  private orderStaus: number;
  private numberArr : number[] =[];

  private isRedirectedFromToast: boolean;
  private quickOrderId: number;
  private dashboardFilterSubscription: Subscription;
  private orderPerDiemId: number | null;
  private prefix: string | null;
  private orderId: number | null;
  private creatingReorder = false;
  private filterApplied = false;
  private isIncomplete = false;

  constructor(
    protected override store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private actions$: Actions,
    private confirmService: ConfirmService,
    private filterService: FilterService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private location: Location,
    private readonly actions: Actions,
    private orderManagementService: OrderManagementService,
    private orderManagementContentService: OrderManagementContentService,
    private addEditReOrderService: AddEditReorderService,
    private reOpenOrderService: ReOpenOrderService,
    private permissionService: PermissionService
  ) {
    super(store);
    this.isRedirectedFromDashboard =
      this.router.getCurrentNavigation()?.extras?.state?.['redirectedFromDashboard'] || false;
    this.orderStaus = this.router.getCurrentNavigation()?.extras?.state?.['orderStatus'] || 0;

    this.isRedirectedFromToast = this.router.getCurrentNavigation()?.extras?.state?.['redirectedFromToast'] || false;
    this.quickOrderId = this.router.getCurrentNavigation()?.extras?.state?.['publicId'];
    this.prefix = this.router.getCurrentNavigation()?.extras?.state?.['prefix'];

    store.dispatch(new SetHeaderState({ title: 'Order Management', iconName: 'file-text' }));
    this.OrderFilterFormGroup = this.fb.group({
      orderPublicId: new FormControl(null),
      regionIds: new FormControl([]),
      locationIds: new FormControl([]),
      departmentsIds: new FormControl([]),
      skillIds: new FormControl([]),
      orderTypes: new FormControl([]),
      jobTitle: new FormControl(null),
      billRateFrom: new FormControl(null),
      billRateTo: new FormControl(null),
      openPositions: new FormControl(null),
      jobStartDate: new FormControl(null),
      jobEndDate: new FormControl(null),
      orderStatuses: new FormControl([]),
      annualSalaryRangeFrom: new FormControl(null),
      annualSalaryRangeTo: new FormControl(null),
      candidateStatuses: new FormControl([]),
      candidatesCountFrom: new FormControl(null),
      candidatesCountTo: new FormControl(null),
      agencyIds: new FormControl([]),
      agencyType: new FormControl('0'),
      templateTitle: new FormControl(null),
      creationDateFrom: new FormControl(null),
      creationDateTo: new FormControl(null),
      distributedOnFrom: new FormControl(null),
      distributedOnTo: new FormControl(null),
      candidateName: new FormControl(null),
      projectTypeIds: new FormControl(null),
      projectNameIds: new FormControl(null),
      poNumberIds: new FormControl(null),
    });
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.watchForPermissions();
    this.handleDashboardFilters();
    this.orderFilterColumnsSetup();

    this.onOrganizationStructureDataLoadHandler();
    this.onDuplicateOrderSucceededHandler();
    this.onDeleteOrderSucceededHandler();
    this.onApproveOrderHandler();

    this.onSelectedOrderDataLoadHandler();

    const locationState = this.location.getState() as { orderId: number };
    this.previousSelectedOrderId = locationState.orderId;

    this.onGridPageChangedHandler();
    this.onOrganizationChangedHandler();
    this.onOrdersDataLoadHandler();

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
    this.getProjectSpecialData();
    this.subscribeOnPermissions();
  }

  ngOnDestroy(): void {
    this.orderManagementService.selectedOrderAfterRedirect = null;
    this.store.dispatch(new ClearSelectedOrder());
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private subscribeOnPermissions(): void {
    this.permissionService.getPermissions().subscribe(({ canCreateOrder, canCloseOrder }) => {
      this.canCreateOrder = canCreateOrder;
      this.canCloseOrder = canCloseOrder;
      this.initMenuItems();
    });
  }

  public override customExport(): void {
    this.defaultFileName = `Organization Management/${this.activeTab} ` + this.generateDateTime(this.datePipe);
    this.fileName = this.defaultFileName;
    this.store.dispatch(new ShowExportDialog(true));
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
    this.defaultFileName = `Organization Management/${this.activeTab} ` + this.generateDateTime(this.datePipe);
    this.store.dispatch(
      new ExportOrders(
        new ExportPayload(
          fileType,
          {
            ...this.filters,
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
  }

  public override updatePage(): void {
    this.getOrders();
  }

  public onAddReorderClose(): void {
    if (
      this.activeTab === OrganizationOrderManagementTabs.AllOrders ||
      this.activeTab === OrganizationOrderManagementTabs.PerDiem
    ) {
      this.clearSelection(this.gridWithChildRow);
    }
  }

  public createReorder(data: any): void {
    this.openReOrderDialog(data.id, data.organizationId);
    this.addEditReOrderService.setReOrderDialogTitle(SidebarDialogTitlesEnum.AddReOrder);
    this.creatingReorder = true;
    this.gridWithChildRow.selectRow(parseInt(data.index));
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
    this.filters.jobStartDate ? this.filters.jobStartDate : null;
    this.filters.jobEndDate ? this.filters.jobEndDate : null;
    this.filters.billRateFrom ? this.filters.billRateFrom : null;
    this.filters.billRateTo ? this.filters.billRateTo : null;
    this.filters.pageNumber = this.currentPage;
    this.filters.agencyType =
      this.filters.agencyType !== '0' ? parseInt(this.filters.agencyType as string, 10) || null : null;
    this.filters.pageSize = this.pageSize;
    this.isIncomplete = false;
    switch (this.activeTab) {
      case OrganizationOrderManagementTabs.AllOrders:
        this.filters.isTemplate = false;
        this.filters.includeReOrders = true;
        this.hasOrderAllOrdersId();
        cleared ? this.store.dispatch([new GetOrders(this.filters)]) : this.store.dispatch([new GetOrderFilterDataSources()]);
        break;
      case OrganizationOrderManagementTabs.PerDiem:
        this.filters.orderTypes = [OrderType.OpenPerDiem];
        this.filters.includeReOrders = true;
        this.filters.isTemplate = false;
        cleared ? this.store.dispatch([new GetOrders(this.filters)]) : this.store.dispatch([new GetOrderFilterDataSources()]);
        break;
      case OrganizationOrderManagementTabs.PermPlacement:
        this.filters.orderTypes = [OrderType.PermPlacement];
        this.filters.isTemplate = false;
        cleared ? this.store.dispatch([new GetOrders(this.filters)]) : this.store.dispatch([new GetOrderFilterDataSources()]);
        break;
      case OrganizationOrderManagementTabs.ReOrders:
        this.hasOrderAllOrdersId();
        this.filters.orderTypes = [OrderType.ReOrder];
        this.filters.isTemplate = false;
        cleared ? this.store.dispatch([new GetOrders(this.filters)]) : this.store.dispatch([new GetOrderFilterDataSources()]);
        break;
      case OrganizationOrderManagementTabs.Incomplete:
        this.columnsToExport = allOrdersColumnsToExport;
        this.filters.isTemplate = false;
        this.isIncomplete = true;
        cleared ? this.store.dispatch([new GetOrders(this.filters, true)]) : this.store.dispatch([new GetOrderFilterDataSources()]);
        break;
      case OrganizationOrderManagementTabs.OrderTemplates:
        this.filters.isTemplate = true;
        cleared ? this.store.dispatch([new GetOrders(this.filters)]) : this.store.dispatch([new GetOrderFilterDataSources()]);
        break;
    }

    this.checkSelectedChildrenItem();
  }

  public onFilterClose() {
    this.OrderFilterFormGroup.setValue({
      orderPublicId: this.filters.orderPublicId || null,
      regionIds: this.filters.regionIds || [],
      locationIds: this.filters.locationIds || [],
      departmentsIds: this.filters.departmentsIds || [],
      skillIds: this.filters.skillIds || [],
      orderTypes:
        this.activeTab === OrganizationOrderManagementTabs.PerDiem ||
        this.activeTab === OrganizationOrderManagementTabs.ReOrders ||
        this.activeTab === OrganizationOrderManagementTabs.PermPlacement
          ? []
          : this.filters.orderTypes || [],
      jobTitle: this.filters.jobTitle || null,
      billRateFrom: this.filters.billRateFrom || null,
      billRateTo: this.filters.billRateTo || null,
      openPositions: this.filters.openPositions || null,
      jobStartDate: this.filters.jobStartDate || null,
      jobEndDate: this.filters.jobEndDate || null,
      orderStatuses: this.filters.orderStatuses || [],
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
      candidateName: this.filters.candidateName || null,
      projectTypeIds: this.filters.projectTypeIds || null,
      projectNameIds: this.filters.projectNameIds || null,
      poNumberIds: this.filters.poNumberIds || null,
    });
    this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns, this.datePipe);
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
    setTimeout(() => this.orderStatusFilter?.refresh(), 300);
  }

  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.OrderFilterFormGroup, this.filterColumns);
  }

  private clearFilters(): void {
    this.OrderFilterFormGroup.reset();
    this.OrderFilterFormGroup.controls['agencyType'].setValue('0');
    this.filteredItems = [];
    this.currentPage = 1;
    this.filters = {};
    this.search?.clear();
  }

  private checkSelectedChildrenItem(): void {
    const hasSelectedItemChildren = this.selectedItems.some((itm) => itm.children?.length !== 0);
    const hasSelectedChildReorders = this.selectedItems.some((itm) => itm.reOrders?.length !== 0);

    switch (this.activeTab) {
      case OrganizationOrderManagementTabs.AllOrders:
        if (this.selectedItems.length === 0) {
          this.columnsToExport = [...allOrdersColumnsToExport, ...allOrdersChildColumnsToExport];
          return;
        }
        this.columnsToExport = hasSelectedItemChildren
          ? [...allOrdersColumnsToExport, ...allOrdersChildColumnsToExport]
          : allOrdersColumnsToExport;
        break;
      case OrganizationOrderManagementTabs.PerDiem:
        if (this.selectedItems.length === 0) {
          this.columnsToExport = [...perDiemColumnsToExport, ...perDiemChildColumnsToExport];
          return;
        }
        this.columnsToExport = hasSelectedChildReorders
          ? [...perDiemColumnsToExport, ...perDiemChildColumnsToExport]
          : perDiemColumnsToExport;
        break;
      case OrganizationOrderManagementTabs.ReOrders:
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
  }

  public onFilterClearAll(): void {
    this.filterApplied = true;
    this.orderManagementService.selectedOrderAfterRedirect = null;
    this.clearFilters();
    this.getOrders(true);
  }

  public onFilterApply(): void {
    this.filterApplied = true;
    this.filters = this.OrderFilterFormGroup.getRawValue();
    this.filters.candidateName = this.filters.candidateName || null;
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
    this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns, this.datePipe);
    this.getOrders(true);
    this.store.dispatch(new ShowFilterDialog(false));
    this.filterService.setPreservedFIlters(this.filters);
  }

  public onDataBound(): void {
    if (this.gridWithChildRow && this.gridWithChildRow.dataSource) {
      this.gridDataBound(this.gridWithChildRow);
    }
    this.subrowsState.clear();
    if (this.previousSelectedOrderId) {
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

    if (this.selectedCandidate) {
      if (this.selectedCandidateMeta) {
        this.selectedCandidate.selected = this.selectedCandidateMeta;
        const rowIndex = this.gridWithChildRow.getRowIndexByPrimaryKey(this.selectedCandidateMeta.order);
        if (rowIndex) {
          this.gridWithChildRow.detailRowModule.expand(rowIndex);
        }
      }
    }

    this.openPerDiemDetails();
    this.selectNavigationTab();
    this.openMyAllTabWithCandidate();
  }

  private openMyAllTabWithCandidate(): void {
    const { selectedOrderAfterRedirect } = this.orderManagementService;
    if (selectedOrderAfterRedirect && this.ordersPage?.items) {
      const orderAllOrders = this.ordersPage.items.find(
        (order: any) => order.publicId === selectedOrderAfterRedirect.orderId
      );
      if (orderAllOrders) {
        const candidate = orderAllOrders.children.find(
          (candidate: OrderManagementChild) => candidate.candidateId === selectedOrderAfterRedirect.candidateId
        );
        this.gridWithChildRow.detailRowModule.expand(0);
        this.onOpenCandidateDialog(candidate as OrderManagementChild, orderAllOrders);
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
    if (pending && this.ordersPage.items) {
      this.store.dispatch(new SelectNavigationTab(null, pending));
    }
  }

  public onNextPreviousOrderEvent(next: boolean): void {
    const [index] = this.gridWithChildRow.getSelectedRowIndexes();
    const nextIndex = next ? index + 1 : index - 1;
    this.gridWithChildRow.selectRow(nextIndex);
  }

  public onRowClick(event: any): void {
    if (event.target) {
      this.orderManagementService.excludeDeployed = false;
    }

    if (this.creatingReorder) {
      this.creatingReorder = false;
      return;
    }

    this.rowSelected(event, this.gridWithChildRow);

    if (!event.isInteracted) {
      if (event.data?.isTemplate) {
        if (!this.canCreateOrder) {
          return;
        }
        this.navigateToOrderTemplateForm();
        this.store.dispatch(new GetSelectedOrderById(event.data.id));
      } else {
        const data = isArray(event.data) ? event.data[0] : event.data;
        this.selectedDataRow = data;
        const options = this.getDialogNextPreviousOption(data);
        this.store.dispatch(new GetOrderById(data.id, data.organizationId, options));
        this.store.dispatch(
          new GetAgencyOrderCandidatesList(
            data.id,
            data.organizationId,
            GRID_CONFIG.initialPage,
            GRID_CONFIG.initialRowsPerPage,
            this.orderManagementService.excludeDeployed
          )
        );
        this.selectedCandidateMeta = this.selectedCandidate = this.selectedReOrder = null;
        this.openChildDialog.next(false);
        this.orderPositionSelected$.next({ state: false });
        if (!isArray(data)) {
          this.openDetails.next(true);
          this.selectedRowRef = event;
        }
      }
    }

    this.checkSelectedChildrenItem();
  }

  public onRowDeselect(event: any, grid: any) {
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
    });
  }

  private getDialogNextPreviousOption(selectedOrder: OrderManagement): DialogNextPreviousOption {
    const gridData = this.gridWithChildRow.dataSource as OrderManagement[];
    const first = gridData[0];
    const last = gridData[gridData.length - 1];
    return {
      previous: first.id !== selectedOrder.id,
      next: last.id !== selectedOrder.id,
    };
  }

  public navigateToOrderForm(): void {
    this.router.navigate(['./add'], { relativeTo: this.route });
  }

  public navigateToOrderTemplateForm(): void {
    this.router.navigate(['./add/fromTemplate'], { relativeTo: this.route });
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

  public setRowHighlight(args: any): void {
    // get and highlight rows with status 'open'
    if (Object.values(STATUS_COLOR_GROUP)[0].includes(args.data['status'])) {
      args.row.classList.add('e-success-row');
    }
  }

  public tabSelected(tabIndex: OrganizationOrderManagementTabs): void {
    this.activeTab = tabIndex;
    this.clearFilters();
    this.filterApplied = false;

    // Don’t need reload orders if we go back from the candidate page
    if (!this.previousSelectedOrderId) {
      const { selectedOrderAfterRedirect } = this.orderManagementService;
      this.openDetails.next(false);
      this.store.dispatch(new ClearOrders());
      this.selectedIndex = null;
      this.clearSelection(this.gridWithChildRow);

      switch (tabIndex) {
        case OrganizationOrderManagementTabs.AllOrders:
          this.isLockMenuButtonsShown = true;
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
          !selectedOrderAfterRedirect && this.refreshGridColumns(ReOrdersColumnsConfig, this.gridWithChildRow);
          break;
        case OrganizationOrderManagementTabs.OrderTemplates:
          this.refreshGridColumns(orderTemplateColumnsConfig, this.gridWithChildRow);
          break;
        case OrganizationOrderManagementTabs.Incomplete:
          this.isLockMenuButtonsShown = false;
          this.refreshGridColumns(AllOrdersColumnsConfig, this.gridWithChildRow);
          break;
      }
      this.pageSubject.next(1);
    }
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
    this.store.dispatch(
      new GetAgencyOrderCandidatesList(
        reOrder.id,
        reOrder.organizationId,
        GRID_CONFIG.initialPage,
        GRID_CONFIG.initialRowsPerPage,
        this.orderManagementService.excludeDeployed
      )
    );
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
    this.store.dispatch(
      new GetAgencyOrderCandidatesList(
        order.id,
        order.organizationId,
        GRID_CONFIG.initialPage,
        GRID_CONFIG.initialRowsPerPage,
        this.orderManagementService.excludeDeployed
      )
    );
    const options = this.getDialogNextPreviousOption(order);
    this.store.dispatch(new GetOrderById(order.id, order.organizationId, options));
    this.selectedDataRow = order as any;
    this.orderPositionSelected$.next({ state: true, index });
    this.openChildDialog.next([order, candidate]);
    this.store.dispatch(new GetAvailableSteps(order.organizationId, candidate.jobId));
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
      })
      .subscribe((confirm) => {
        if (confirm) {
          this.store.dispatch(new DeleteOrder(id));
        }
      });
  }

  public menuOptionSelected(event: any, data: OrderManagement): void {
    switch (Number(event.item.properties.id)) {
      case MoreMenuType['Edit']:
        this.editOrder(data);
        break;
      case MoreMenuType['Duplicate']:
        this.store.dispatch(new DuplicateOrder(data.id));
        break;
      case MoreMenuType['Close']:
        this.orderManagementContentService.getOrderById(data.id).subscribe((order) => {
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
      this.openReOrderDialog(data.id, data.organizationId);
    } else {
      this.router.navigate(['./edit', data.id], { relativeTo: this.route });
    }
  }

  private openReOrderDialog(orderId: number, organizationId: number): void {
    this.store.dispatch(new GetOrderById(orderId, organizationId, {} as any));
    this.actions$
      .pipe(ofActionDispatched(GetOrderByIdSucceeded), take(1))
      .subscribe(() => this.store.dispatch(new ShowSideDialog(true)));
  }

  private onReloadOrderCandidatesLists(): void {
    this.actions$
      .pipe(ofActionSuccessful(ReloadOrganisationOrderCandidatesLists), takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.store.dispatch(
          new GetAgencyOrderCandidatesList(
            this.selectedOrder.id,
            this.selectedOrder.organizationId as number,
            GRID_CONFIG.initialPage,
            GRID_CONFIG.initialRowsPerPage,
            this.orderManagementService.excludeDeployed
          )
        );
        this.getOrders();
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
    });
  }

  private getSettings(): void {
    this.store.dispatch(new GetOrganizationSettings());
  }

  private onOrganizationChangedHandler(): void {
    this.organizationId$
      .pipe(
        takeUntil(this.unsubscribe$),
        filter((data) => !!data)
      )
      .subscribe(() => {
        this.getSettings();
        if (!this.isRedirectedFromDashboard && !this.isRedirectedFromToast) {
          this.clearFilters();
        }
        if (!this.previousSelectedOrderId) {
          this.pageSubject.next(1);
        }
        this.store.dispatch(new GetAllOrganizationSkills());
      });
  }

  private onOrdersDataLoadHandler(): void {
    this.ordersPage$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.ordersPage = data;
      if (data?.items) {
        data.items.forEach((item) => {
          item.isMoreMenuWithDeleteButton = !this.openInProgressFilledStatuses.includes(item.statusText.toLowerCase());
          if (item.children && item.children.length) {
            item.children.sort((a, b) => a.positionId - b.positionId);
          }
        });
      }
    });
  }

  private onGridPageChangedHandler(): void {
    this.pageSubject.pipe(takeUntil(this.unsubscribe$), throttleTime(100)).subscribe((page) => {
      this.currentPage = page;
      if (this.orderPerDiemId || this.orderId) {
        this.filters.orderPublicId = this.prefix + '-' + this.orderPerDiemId;
        this.OrderFilterFormGroup.controls['orderPublicId'].setValue(
          (this.prefix + '-' + (this.orderPerDiemId || this.orderId))?.toString()
        );
        this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns);
      }
      this.getOrders(this.filterApplied);
    });
  }

  private orderFilterColumnsSetup(): void {
    this.filterColumns = {
      orderPublicId: { type: ControlTypes.Text, valueType: ValueType.Text },
      regionIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      locationIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      departmentsIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      skillIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'skillDescription',
        valueId: 'id',
      },
      orderTypes: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: OrderTypeOptions,
        valueField: 'name',
        valueId: 'id',
      },
      jobTitle: { type: ControlTypes.Text, valueType: ValueType.Text },
      billRateFrom: { type: ControlTypes.Text, valueType: ValueType.Text },
      billRateTo: { type: ControlTypes.Text, valueType: ValueType.Text },
      openPositions: { type: ControlTypes.Text, valueType: ValueType.Text },
      jobStartDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      jobEndDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      orderStatuses: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'statusText',
        valueId: 'status',
      },
      candidateStatuses: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'statusText',
        valueId: 'status',
      },
      candidatesCountFrom: { type: ControlTypes.Text, valueType: ValueType.Text },
      candidatesCountTo: { type: ControlTypes.Text, valueType: ValueType.Text },
      agencyIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      agencyType: { type: ControlTypes.Radio, dataSource: { 1: 'Yes', 2: 'No' }, default: '0' },
      templateTitle: { type: ControlTypes.Text, valueType: ValueType.Text },
      annualSalaryRangeFrom: {
        type: ControlTypes.Text,
        valueType: ValueType.Text,
      },
      annualSalaryRangeTo: {
        type: ControlTypes.Text,
        valueType: ValueType.Text,
      },
      creationDateFrom: { type: ControlTypes.Date, valueType: ValueType.Text },
      creationDateTo: { type: ControlTypes.Date, valueType: ValueType.Text },
      distributedOnFrom: { type: ControlTypes.Date, valueType: ValueType.Text },
      distributedOnTo: { type: ControlTypes.Date, valueType: ValueType.Text },
      candidateName: { type: ControlTypes.Text, valueType: ValueType.Text },
      projectTypeIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'projectType',
        valueId: 'id',
      },
      projectNameIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'projectName',
        valueId: 'id',
      },
      poNumberIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'poNumber',
        valueId: 'id',
      },
    };
    this.search$.pipe(takeUntil(this.unsubscribe$), debounceTime(300)).subscribe(() => {
      this.onFilterApply();
    });
  }

  private onOrderFilterDataSourcesLoadHandler(): void {
    this.orderFilterDataSources$
      .pipe(takeUntil(this.unsubscribe$), filter(Boolean))
      .subscribe((data: OrderFilterDataSource) => {
        let statuses = [];
        let candidateStatuses = [];
        const statusesByDefault = [
          CandidatStatus.Applied,
          CandidatStatus.Shortlisted,
          CandidatStatus.Offered,
          CandidatStatus.Accepted,
          CandidatStatus.OnBoard,
          CandidatStatus.Withdraw,
          CandidatStatus.Offboard,
          CandidatStatus.Rejected,
          CandidatStatus.Cancelled,
        ];
        if (this.activeTab === OrganizationOrderManagementTabs.ReOrders) {
          statuses = data.orderStatuses.filter((status) =>
            [FilterOrderStatusText.Open, FilterOrderStatusText['In Progress'], FilterOrderStatusText.Filled, FilterOrderStatusText.Closed].includes(status.status)
          );
          candidateStatuses = data.candidateStatuses.filter((status) =>
            [
              CandidatesStatusText['Bill Rate Pending'],
              CandidatesStatusText['Offered Bill Rate'],
              CandidatesStatusText.Onboard,
              CandidatesStatusText.Rejected,
              CandidatStatus.Cancelled,
            ].includes(status.status)
          );
        } else if (this.activeTab === OrganizationOrderManagementTabs.PerDiem) {
          statuses = data.orderStatuses.filter((status: FilterOrderStatus) =>
            ![FilterOrderStatusText.Filled, FilterOrderStatusText['In Progress']].includes(status.status)
          );
          candidateStatuses = data.candidateStatuses.filter((status) => statusesByDefault.includes(status.status));
        } else {
          statuses = data.orderStatuses;
          candidateStatuses = data.candidateStatuses.filter((status) => statusesByDefault.includes(status.status));
        }
        this.filterColumns.orderStatuses.dataSource = statuses;
        this.filterColumns.agencyIds.dataSource = data.partneredAgencies;
        this.filterColumns.candidateStatuses.dataSource = candidateStatuses;
        this.setDefaultFilter();
        this.store.dispatch([new GetOrders(this.filters, this.isIncomplete)]);
      });
  }

  private setDefaultFilter(): void {
    if (this.filterService.canPreserveFilters()) {
      const preservedFilters = this.store.selectSnapshot(PreservedFiltersState.preservedFilters);
      if (preservedFilters?.regions) {
        this.OrderFilterFormGroup.get('regionIds')?.setValue([...preservedFilters.regions]);
        this.filters.regionIds = [...preservedFilters.regions];
        if (preservedFilters?.locations) {
          this.OrderFilterFormGroup.get('locationIds')?.setValue([...preservedFilters.locations]);
          this.filters.locationIds = [...preservedFilters.locations];
        }
      }
    }
    if (!(this.filters.isTemplate || this.isIncomplete)) {
      const statuses = this.filterColumns.orderStatuses.dataSource
                      .filter((status: FilterOrderStatus) => ![FilterOrderStatusText.Closed].includes(status.status))
                      .map((status: FilterStatus) => status.status);
      this.OrderFilterFormGroup.get('orderStatuses')?.setValue(statuses);
      this.filters.orderStatuses = statuses;
    }
    this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns, this.datePipe);
  }

  private onOrderFilterControlValueChangedHandler(): void {
    this.OrderFilterFormGroup.get('regionIds')?.valueChanges.subscribe((val: number[]) => {
      if (val?.length) {
        const selectedRegions: OrganizationRegion[] = [];
        val.forEach((id) =>
          selectedRegions.push(this.regions.find((region) => region.id === id) as OrganizationRegion)
        );
        this.filterColumns.locationIds.dataSource = [];
        selectedRegions.forEach((region) => {
          region.locations?.forEach((location) => (location.regionName = region.name));
          this.filterColumns.locationIds.dataSource.push(...(region.locations as []));
        });
      } else {
        this.filterColumns.locationIds.dataSource = [];
        this.OrderFilterFormGroup.get('locationIds')?.setValue([]);
        this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns);
      }
    });
    this.OrderFilterFormGroup.get('locationIds')?.valueChanges.subscribe((val: number[]) => {
      if (val?.length) {
        const selectedLocations: OrganizationLocation[] = [];
        val.forEach((id) =>
          selectedLocations.push(
            this.filterColumns.locationIds.dataSource.find((location: OrganizationLocation) => location.id === id)
          )
        );
        this.filterColumns.departmentsIds.dataSource = [];
        selectedLocations.forEach((location) => {
          this.filterColumns.departmentsIds.dataSource.push(...(location.departments as []));
        });
      } else {
        this.filterColumns.departmentsIds.dataSource = [];
        this.OrderFilterFormGroup.get('departmentsIds')?.setValue([]);
        this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns);
      }
    });
  }

  private onOrderDetailsDialogOpenEventHandler(): void {
    this.openDetails.pipe(takeUntil(this.unsubscribe$)).subscribe((isOpen) => {
      if (!isOpen) {
        this.clearSelection(this.gridWithChildRow);
        this.selectedReOrder = null;
        this.previousSelectedOrderId = null;
        const table = document.getElementsByClassName('e-virtualtable')[0] as HTMLElement;
        if (table) {
          table.style.transform = 'translate(0px, 0px)';
        }
      }
    });
  }

  private onSelectedOrderDataLoadHandler(): void {
    this.selectedOrder$.pipe(takeUntil(this.unsubscribe$)).subscribe((order: Order) => {
      this.selectedOrder = order;
    });
  }

  private onSkillDataLoadHandler(): void {
    this.skills$.pipe(takeUntil(this.unsubscribe$)).subscribe((skills) => {
      if (skills && skills.length > 0) {
        this.filterColumns.skillIds.dataSource = skills;
      }
    });
  }

  private onOrganizationStructureDataLoadHandler(): void {
    this.organizationStructure$
      .pipe(takeUntil(this.unsubscribe$), filter(Boolean))
      .subscribe((structure: OrganizationStructure) => {
        this.orgStructure = structure;
        this.regions = structure.regions;
        this.filterColumns.regionIds.dataSource = this.regions;
        this.onOrderFilterDataSourcesLoadHandler();
      });
  }

  private onApproveOrderHandler(): void {
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(ApproveOrder)).subscribe(() => {
      const [index] = this.gridWithChildRow.getSelectedRowIndexes();
      this.selectedIndex = index;
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
      this.gridWithChildRow.clearRowSelection();
      this.getOrders();
      this.openDetails.next(false);
    });
  }

  public lockOrder(order: Order): void {
    this.store.dispatch(
      new SetLock(order.id, !order.isLocked, this.filters, `${order.organizationPrefix || ''}-${order.publicId}`)
    );
  }

  public disabledLock(status: OrderStatus): boolean {
    const statuses = [this.orderStatus.Open, this.orderStatus.InProgress, this.orderStatus.Filled];

    return !statuses.includes(status);
  }

  public updateGrid(): void {
    this.getOrders();
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(GetOrders)).subscribe(() => {
      const [index] = this.gridWithChildRow.getSelectedRowIndexes();
      this.selectedIndex = index;
    });
  }

  public getMoreMenu(order: OrderManagement): ItemModel[] {
    const orderStatuses = [OrderStatus.InProgressOfferAccepted, OrderStatus.Filled];
    if (orderStatuses.includes(OrderStatus.InProgressOfferAccepted)) {
      if (Boolean(order.children?.some((child) => orderStatuses.includes(child.orderStatus)))) {
        return this.moreMenu;
      }
    }
    return this.canReOpen(order) ? this.moreMenuWithReOpenButton : this.moreMenuWithCloseButton;
  }

  public getMenuForReorders(order: OrderManagement): ItemModel[] {
    if (!order.children?.length && order.orderCloseDate && order.status !== OrderStatus.Closed) {
      return this.moreMenu;
    }

    return this.reOrdersMenu;
  }

  canReOpen(order: OrderManagement): boolean {
    return order?.status !== OrderStatus.Closed && Boolean(order?.orderClosureReasonId);
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

  private handleDashboardFilters(): void {
    if (this.isRedirectedFromDashboard) {
      this.applyDashboardFilters();

      this.dashboardFilterSubscription = this.actions
        .pipe(
          ofActionDispatched(ShowFilterDialog),
          filter((data) => data.isDialogShown),
          takeUntil(this.unsubscribe$)
        )
        .subscribe(() => this.setFilterState());
    }
  }

  private applyDashboardFilters(): void {
    this.orderStaus >0 ? this.numberArr.push(this.orderStaus) : [];
    this.filters.orderStatuses = this.numberArr;

    combineLatest([this.organizationId$, this.filteredItems$])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(([organizationId, items]) => {
        this.filteredItems = items.filter(
          (item: FilteredItem) =>
            (item.organizationId === organizationId && item.column !== FilterColumnTypeEnum.ORGANIZATION) ||
            item.column === FilterColumnTypeEnum.SKILL
        );

        this.filteredItems.forEach((item: FilteredItem) => {
          const filterKey = item.column as keyof OrderFilter;
          if (filterKey in this.filters) {
            (this.filters[filterKey] as number[]).push(item.value);
          } else {
            (this.filters[filterKey] as number[]) = [item.value];
          }
        });
      });
  }

  private setFilterState(): void {
    this.organizationStructure$
      .pipe(
        takeUntil(this.unsubscribe$),
        filter((orgs) => !!orgs)
      )
      .subscribe(() => {
        Object.entries(this.filters).forEach(([key, value]) => {
          this.OrderFilterFormGroup.get(key)?.setValue(value);
        });
        this.isRedirectedFromDashboard = false;
        this.dashboardFilterSubscription.unsubscribe();
      });
  }

  private listenRedirectFromExtension(): void {
    this.orderManagementService.orderId$
      .pipe(takeUntil(this.unsubscribe$), filter(Boolean), debounceTime(300))
      .subscribe((data: { id: number; prefix: string }) => {
        this.currentPage = 1;
        this.orderId = data.id;
        this.prefix = data.prefix;
        this.filters.orderPublicId = this.prefix + '-' + this.orderId;
        this.OrderFilterFormGroup.controls['orderPublicId'].setValue(this.prefix + '-' + this.orderId);
        this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns);
        this.getOrders();
      });
  }

  private listenRedirectFromPerDiem(): void {
    this.orderManagementService.reorderId$
      .pipe(takeUntil(this.unsubscribe$), filter(Boolean), debounceTime(300))
      .subscribe((data: { id: number; prefix: string }) => {
        this.orderId = data.id;
        this.prefix = data.prefix;
        this.filters.orderPublicId = this.prefix + '-' + this.orderId;
        this.OrderFilterFormGroup.controls['orderPublicId'].setValue(this.prefix + '-' + this.orderId);
        this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns);
        this.getOrders();
      });
  }

  private listenRedirectFromReOrder(): void {
    this.orderManagementService.orderPerDiemId$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: { id: number; prefix: string }) => {
        this.orderPerDiemId = data.id;
        this.prefix = data.prefix;
      });
  }

  private hasOrderAllOrdersId(): void {
    const { selectedOrderAfterRedirect } = this.orderManagementService;
    if (selectedOrderAfterRedirect) {
      this.OrderFilterFormGroup.patchValue({ orderId: selectedOrderAfterRedirect.orderId.toString() });
      this.filters = this.OrderFilterFormGroup.getRawValue();
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
    this.store.dispatch(new GetOrderById(order.id, order.organizationId as number));
    this.store.dispatch(
      new GetAgencyOrderCandidatesList(
        order.id,
        order.organizationId as number,
        GRID_CONFIG.initialPage,
        GRID_CONFIG.initialRowsPerPage,
        this.orderManagementService.excludeDeployed
      )
    );
    this.getOrders();
  }

  updatePositionDetails(position: OrderManagementChild): void {
    this.getOrders();
    this.store.dispatch(new GetOrganisationCandidateJob(position.organizationId, position.jobId));
    this.candidatesJob$.pipe(take(2), filter(Boolean)).subscribe((res) => {
      this.selectedCandidate = {
        ...position,
        closeDate: res.closeDate,
        positionClosureReason: res.positionClosureReason,
        positionClosureReasonId: res.positionClosureReasonId,
        orderStatus: res.orderStatus,
        candidateStatus: res.applicantStatus.applicantStatus,
      };
    });
  }

  private handleRedirectFromQuickOrderToast(): void {
    if (this.isRedirectedFromToast) {
      let prefix = this.prefix || '';
      this.orderManagementService.orderId$.next({ id: this.quickOrderId, prefix: prefix });
    }
  }

  private showFilterFormAfterOpenDialog(): void {
    this.actions
      .pipe(ofActionDispatched(ShowFilterDialog), takeUntil(this.unsubscribe$), debounceTime(200))
      .subscribe((isOpen) => (this.showFilterForm = isOpen.isDialogShown));
  }

  private getProjectSpecialData(): void {
    this.organizationId$.pipe(filter(Boolean), take(1)).subscribe(() => {
      this.store.dispatch(new GetProjectSpecialData());
      this.projectSpecialData$.pipe(takeUntil(this.unsubscribe$), filter(Boolean)).subscribe((data) => {
        const { poNumbers, projectNames, specialProjectCategories } = data;
        this.filterColumns.projectTypeIds.dataSource = specialProjectCategories;
        this.filterColumns.projectNameIds.dataSource = projectNames;
        this.filterColumns.poNumberIds.dataSource = poNumbers;
      });
    });
  }

  private initMenuItems(): void {
    this.moreMenuWithDeleteButton = [
      { text: MoreMenuType[0], id: '0', disabled: !this.canCreateOrder },
      { text: MoreMenuType[1], id: '1', disabled: !this.canCreateOrder },
      { text: MoreMenuType[3], id: '3', disabled: !this.canCreateOrder },
    ];

    this.moreMenuWithCloseButton = [
      { text: MoreMenuType[0], id: '0', disabled: !this.canCreateOrder },
      { text: MoreMenuType[1], id: '1', disabled: !this.canCreateOrder },
      { text: MoreMenuType[2], id: '2', disabled: !this.canCloseOrder },
    ];

    this.moreMenuWithReOpenButton = [
      { text: MoreMenuType[0], id: '0', disabled: !this.canCreateOrder },
      { text: MoreMenuType[1], id: '1', disabled: !this.canCreateOrder },
      { text: MoreMenuType[4], id: '4', disabled: !this.canCreateOrder },
    ];

    this.moreMenu = [
      { text: MoreMenuType[0], id: '0', disabled: !this.canCreateOrder },
      { text: MoreMenuType[1], id: '1', disabled: !this.canCreateOrder },
    ];

    this.reOrdersMenu = [
      { text: MoreMenuType[0], id: '0', disabled: !this.canCreateOrder },
      { text: MoreMenuType[2], id: '2', disabled: !this.canCloseOrder },
    ];

    this.closedOrderMenu = [{ text: MoreMenuType[1], id: '1', disabled: !this.canCreateOrder }];
  }

  private watchForPermissions(): void {
    this.getPermissionStream().pipe(takeUntil(this.unsubscribe$)).subscribe((permissions: Permission) => {
      this.hasCreateEditOrderPermission = permissions[this.userPermissions.CanCreateOrders]
        || permissions[this.userPermissions.CanOrganizationEditOrders]
    });
  }
}
