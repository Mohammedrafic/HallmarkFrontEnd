import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, ofActionCompleted, ofActionDispatched, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { DetailRowService, GridComponent, VirtualScrollService } from '@syncfusion/ej2-angular-grids';
import {
  combineLatest,
  debounceTime,
  filter,
  first,
  Observable,
  Subject,
  Subscription,
  take,
  takeUntil,
  throttleTime,
} from 'rxjs';
import {
  SetHeaderState,
  ShowCloseOrderDialog,
  ShowExportDialog,
  ShowFilterDialog,
  ShowSideDialog,
} from 'src/app/store/app.actions';
import { ORDERS_GRID_CONFIG } from '../../client.config';
import { SelectionSettingsModel, TextWrapSettingsModel } from '@syncfusion/ej2-grids/src/grid/base/grid-model';
import { CandidatesStatusText, OrderStatusText, STATUS_COLOR_GROUP } from 'src/app/shared/enums/status';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
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
  GetOrderFilterDataSources,
  GetOrders,
  GetSelectedOrderById,
  LockUpdatedSuccessfully,
  ReloadOrganisationOrderCandidatesLists,
  SelectNavigationTab,
  SetLock,
} from '@client/store/order-managment-content.actions';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import {
  Order,
  OrderFilter,
  OrderFilterDataSource,
  OrderManagement,
  OrderManagementChild,
  OrderManagementPage,
} from '@shared/models/order-management.model';
import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';
import { UserState } from '../../../store/user.state';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { ConfirmService } from '@shared/services/confirm.service';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from '@shared/constants';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { OrganizationLocation, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { Skill } from '@shared/models/skill.model';
import { GetAllOrganizationSkills, GetOrganizationSettings
} from '@organization-management/store/organization-management.actions';
import { OrderType, OrderTypeOptions } from '@shared/enums/order-type';
import { DatePipe, Location } from '@angular/common';
import { OrganizationOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';
import {
  allOrdersChildColumnsToExport,
  AllOrdersColumnsConfig,
  allOrdersColumnsToExport,
  MoreMenuType,
  orderTemplateColumnsConfig,
  OrderTypeName,
  perDiemChildColumnsToExport,
  PerDiemColumnsConfig,
  perDiemColumnsToExport,
  PermPlacementColumnsConfig,
  reOrdersChildColumnToExport,
  ReOrdersColumnsConfig,
  reOrdersColumnsToExport,
  ROW_HEIGHT,
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
import { isArray } from 'lodash';
import { FilterColumnTypeEnum } from 'src/app/dashboard/enums/dashboard-filter-fields.enum';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import { AddEditReorderService } from '@client/order-management/add-edit-reorder/add-edit-reorder.service';
import { SidebarDialogTitlesEnum } from '@shared/enums/sidebar-dialog-titles.enum';
import { UpdateGridCommentsCounter } from '@shared/components/comments/store/comments.actions';
import { OrganizationSettingsGet } from '@shared/models/organization-settings.model';
import { SettingsKeys } from '@shared/enums/settings';
import { SettingsHelper } from '@core/helpers/settings.helper';

@Component({
  selector: 'app-order-management-content',
  templateUrl: './order-management-content.component.html',
  styleUrls: ['./order-management-content.component.scss'],
  providers: [VirtualScrollService, DetailRowService],
})
export class OrderManagementContentComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('grid') override gridWithChildRow: GridComponent;
  @ViewChild('search') search: SearchComponent;
  @ViewChild('detailsDialog') detailsDialog: OrderDetailsDialogComponent;
  @ViewChild('tabNavigation') tabNavigation: TabNavigationComponent;

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

  @Select(DashboardState.filteredItems) private readonly filteredItems$: Observable<FilteredItem[]>;

  public settings: { [key in SettingsKeys]?: OrganizationSettingsGet };
  public SettingsKeys = SettingsKeys;
  public activeTab: OrganizationOrderManagementTabs = OrganizationOrderManagementTabs.AllOrders;
  public allowWrap = ORDERS_GRID_CONFIG.isWordWrappingEnabled;
  public wrapSettings: TextWrapSettingsModel = ORDERS_GRID_CONFIG.wordWrapSettings;
  public isLockMenuButtonsShown = true;
  public moreMenuWithDeleteButton: ItemModel[] = [
    { text: MoreMenuType[0], id: '0' },
    { text: MoreMenuType[1], id: '1' },
    { text: MoreMenuType[3], id: '3' },
  ];
  public moreMenuWithCloseButton: ItemModel[] = [
    { text: MoreMenuType[0], id: '0' },
    { text: MoreMenuType[1], id: '1' },
    { text: MoreMenuType[2], id: '2' },
  ];

  public moreMenu: ItemModel[] = [
    { text: MoreMenuType[0], id: '0' },
    { text: MoreMenuType[1], id: '1' },
  ];

  public reOrdersMenu: ItemModel[] = [
    { text: MoreMenuType[0], id: '0' },
    { text: MoreMenuType[2], id: '2' },
  ];

  public closedOrderMenu: ItemModel[] = [{ text: MoreMenuType[1], id: '1' }];

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

  public selectedOrder: Order;
  public openDetails = new Subject<boolean>();
  public selectionOptions: SelectionSettingsModel = {
    type: 'Single',
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

  private selectedCandidateMeta: { order: number; positionId: number } | null;
  private selectedIndex: number | null;
  private ordersPage: OrderManagementPage;

  public columnsToExport: ExportColumn[];

  public fileName: string;
  public defaultFileName: string;
  public selectedRowRef: any;

  private isRedirectedFromDashboard: boolean;
  private isRedirectedFromToast: boolean;
  private organizationPrefix: string;
  private publicId: number;
  private dashboardFilterSubscription: Subscription;
  private orderPerDiemId: number | null;
  private creatingReorder = false;

  constructor(
    private store: Store,
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
    private addEditReOrderService: AddEditReorderService
  ) {
    super();
    this.isRedirectedFromDashboard =
      this.router.getCurrentNavigation()?.extras?.state?.['redirectedFromDashboard'] || false;
    this.isRedirectedFromToast = this.router.getCurrentNavigation()?.extras?.state?.['redirectedFromToast'] || false;
    this.organizationPrefix = this.router.getCurrentNavigation()?.extras?.state?.['organizationPrefix'];
    this.publicId = this.router.getCurrentNavigation()?.extras?.state?.['publicId'];

    store.dispatch(new SetHeaderState({ title: 'Order Management', iconName: 'file-text' }));
    this.OrderFilterFormGroup = this.fb.group({
      orderId: new FormControl(null),
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
    });
  }

  ngOnInit(): void {
    this.handleRedirectFromQuickOrderToast();
    this.handleDashboardFilters();
    this.orderFilterColumnsSetup();
    this.onOrderFilterDataSourcesLoadHandler();

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
    this.subscribeForSettings();
  }

  ngOnDestroy(): void {
    this.orderManagementService.selectedOrderAfterRedirect = null;
    this.store.dispatch(new ClearSelectedOrder());
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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

  public getOrders(): void {
    this.filters.orderBy = this.orderBy;
    this.filters.orderId ? this.filters.orderId : null;
    this.filters.jobStartDate ? this.filters.jobStartDate : null;
    this.filters.jobEndDate ? this.filters.jobEndDate : null;
    this.filters.billRateFrom ? this.filters.billRateFrom : null;
    this.filters.billRateTo ? this.filters.billRateTo : null;
    this.filters.pageNumber = this.currentPage;
    this.filters.agencyType =
      this.filters.agencyType !== '0' ? parseInt(this.filters.agencyType as string, 10) || null : null;
    this.filters.pageSize = this.pageSize;

    switch (this.activeTab) {
      case OrganizationOrderManagementTabs.AllOrders:
        this.filters.isTemplate = false;
        this.filters.includeReOrders = true;
        this.hasOrderAllOrdersId();
        this.store.dispatch([new GetOrders(this.filters), new GetOrderFilterDataSources()]);
        break;
      case OrganizationOrderManagementTabs.PerDiem:
        this.filters.orderTypes = [OrderType.OpenPerDiem];
        this.filters.includeReOrders = true;
        this.filters.isTemplate = false;
        this.store.dispatch([new GetOrders(this.filters), new GetOrderFilterDataSources()]);
        break;
      case OrganizationOrderManagementTabs.PermPlacement:
        this.filters.orderTypes = [OrderType.PermPlacement];
        this.filters.isTemplate = false;
        this.store.dispatch([new GetOrders(this.filters), new GetOrderFilterDataSources()]);
        break;
      case OrganizationOrderManagementTabs.ReOrders:
        this.hasOrderAllOrdersId();
        this.filters.orderTypes = [OrderType.ReOrder];
        this.filters.isTemplate = false;
        this.store.dispatch([new GetOrders(this.filters), new GetOrderFilterDataSources()]);
        break;
      case OrganizationOrderManagementTabs.Incomplete:
        this.columnsToExport = allOrdersColumnsToExport;
        this.filters.isTemplate = false;
        this.store.dispatch(new GetOrders({ pageNumber: this.currentPage, pageSize: this.pageSize }, true));
        break;
      case OrganizationOrderManagementTabs.OrderTemplates:
        this.filters.isTemplate = true;
        this.store.dispatch([new GetOrders(this.filters), new GetOrderFilterDataSources()]);
        break;
    }

    this.checkSelectedChildrenItem();
  }

  public onFilterClose() {
    this.OrderFilterFormGroup.setValue({
      orderId: this.filters.orderId || null,
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
    });
    this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns, this.datePipe);
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
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
    }
  }

  public onFilterClearAll(): void {
    this.orderManagementService.selectedOrderAfterRedirect = null;
    this.clearFilters();
    this.getOrders();
  }

  public onFilterApply(): void {
    this.filters = this.OrderFilterFormGroup.getRawValue();
    this.filters.orderId = this.filters.orderId || null;
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
    this.getOrders();
    this.store.dispatch(new ShowFilterDialog(false));
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
      if (data && index) {
        this.gridWithChildRow.selectRow(index);
        this.onRowClick({ data });
      }
    }

    if (!isNil(this.selectedIndex)) {
      this.gridWithChildRow.selectRow(this.selectedIndex);
    }

    if (this.selectedCandidate) {
      const [data, index] = this.store.selectSnapshot(OrderManagementContentState.lastSelectedOrder)(
        this.selectedDataRow.id
      );
      const updatedCandidate = data?.children.find((child) => child.candidateId === this.selectedCandidate.candidateId);
      this.selectedCandidate = updatedCandidate;
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
        (order: any) => order.id === selectedOrderAfterRedirect.orderId
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
    if (this.orderPerDiemId && this.ordersPage?.items) {
      const orderPerDiem = this.ordersPage.items.find((order: OrderManagement) => order.id === this.orderPerDiemId);
      const index = (this.gridWithChildRow.dataSource as Order[])?.findIndex(
        (order: Order) => order.id === orderPerDiem?.id
      );
      this.gridWithChildRow.selectRow(index);
      this.orderPerDiemId = null;
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
      if (event.data.isTemplate) {
        this.navigateToOrderForm();
        this.store.dispatch(new GetSelectedOrderById(event.data.id));
      } else {
        this.selectedDataRow = event.data;
        const data = event.data;
        const options = this.getDialogNextPreviousOption(data);
        this.store.dispatch(new GetOrderById(data.id, data.organizationId, options));
        this.store.dispatch(
          new GetAgencyOrderCandidatesList(
            data.id,
            data.organizationId,
            1,
            30,
            this.orderManagementService.excludeDeployed
          )
        );
        this.selectedCandidateMeta = this.selectedCandidate = this.selectedReOrder = null;
        this.openChildDialog.next(false);
        if (!isArray(event.data)) {
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

  public getOrderTypeName(orderType: number): string {
    return OrderTypeName[OrderType[orderType] as OrderTypeName];
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
        1,
        30,
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

  public onOpenCandidateDialog(candidate: OrderManagementChild, order: OrderManagement): void {
    this.selectedCandidate = candidate;
    this.selectedCandidateMeta = this.selectedCandidate.selected = {
      order: order.id,
      positionId: candidate.positionId,
    };
    const options = this.getDialogNextPreviousOption(order);
    this.store.dispatch(new GetOrderById(order.id, order.organizationId, options));
    this.selectedDataRow = order as any;
    this.openChildDialog.next([order, candidate]);
    this.store.dispatch(new GetAvailableSteps(order.organizationId, candidate.jobId));
  }

  public deleteOrder(id: number): void {
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
      .pipe(first(), ofActionCompleted(GetOrderById))
      .subscribe(() => this.store.dispatch(new ShowSideDialog(true)));
  }

  private onReloadOrderCandidatesLists(): void {
    this.actions$
      .pipe(ofActionSuccessful(ReloadOrganisationOrderCandidatesLists), takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.store.dispatch(
          new GetAgencyOrderCandidatesList(
            this.selectedDataRow.id,
            this.selectedDataRow.organizationId as number,
            1,
            30,
            this.orderManagementService.excludeDeployed
          )
        );
        this.getOrders();
        this.store.dispatch(
          new GetOrderById(
            this.selectedDataRow.id,
            this.selectedDataRow.organizationId as number,
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
    this.organizationId$.pipe(takeUntil(this.unsubscribe$), debounceTime(400)).subscribe(() => {
      this.getSettings();
      if (!this.isRedirectedFromDashboard) {
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
      this.getOrders();
    });
  }

  private orderFilterColumnsSetup(): void {
    this.filterColumns = {
      orderId: { type: ControlTypes.Text, valueType: ValueType.Text },
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
        if (this.activeTab === OrganizationOrderManagementTabs.ReOrders) {
          statuses = data.orderStatuses.filter((status) =>
            [OrderStatusText.Open, OrderStatusText.Filled, OrderStatusText.Closed].includes(status.status)
          );
          candidateStatuses = data.candidateStatuses.filter((status) =>
            [
              CandidatesStatusText['Bill Rate Pending'],
              CandidatesStatusText['Offered Bill Rate'],
              CandidatesStatusText.Onboard,
              CandidatesStatusText.Rejected,
            ].includes(status.status)
          ); // TODO: after BE implementation also add Pending, Rejected
        } else if (this.activeTab === OrganizationOrderManagementTabs.PerDiem) {
          statuses = data.orderStatuses.filter((status) =>
            [OrderStatusText.Open, OrderStatusText.Closed].includes(status.status)
          );
          candidateStatuses = data.candidateStatuses.filter((status) =>
            [
              CandidatStatus['Not Applied'],
              CandidatStatus.Applied,
              CandidatStatus.Offered,
              CandidatStatus.Accepted,
              CandidatStatus.OnBoard,
              CandidatStatus.Rejected,
            ].includes(status.status)
          );
        } else {
          statuses = data.orderStatuses;
          candidateStatuses = data.candidateStatuses;
        }
        this.filterColumns.orderStatuses.dataSource = statuses;
        this.filterColumns.agencyIds.dataSource = data.partneredAgencies;
        this.filterColumns.candidateStatuses.dataSource = candidateStatuses;
      });
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
    this.store.dispatch(new SetLock(order.id, !order.isLocked, this.filters, `${order.organizationPrefix || ''}-${order.publicId}`));
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
    return this.moreMenuWithCloseButton;
  }

  public getMenuForReorders(order: OrderManagement): ItemModel[] {
    if (!order.children.length && order.orderCloseDate && order.status !== OrderStatus.Closed) {
      return this.moreMenu;
    }

    return this.reOrdersMenu;
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
    this.orderManagementService.orderId$.pipe(takeUntil(this.unsubscribe$), filter(Boolean)).subscribe((id: number) => {
      const index = (this.gridWithChildRow.dataSource as Order[])?.findIndex((order: Order) => order.id === id);
      this.gridWithChildRow.selectRow(index);
    });
  }

  private listenRedirectFromReOrder(): void {
    this.orderManagementService.orderPerDiemId$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((orderId: number) => (this.orderPerDiemId = orderId));
  }

  private hasOrderAllOrdersId(): void {
    const { selectedOrderAfterRedirect } = this.orderManagementService;
    if (selectedOrderAfterRedirect) {
      this.OrderFilterFormGroup.patchValue({ orderId: selectedOrderAfterRedirect.orderId.toString() });
      this.filters = this.OrderFilterFormGroup.getRawValue();
      this.filters.orderId = selectedOrderAfterRedirect.orderId;
      this.filters.agencyType = null;
      this.filters.includeReOrders = false;
      this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns);
    }
  }

  updateOrderDetails(order: Order | OrderManagement): void {
    this.store.dispatch(new GetOrderById(order.id, order.organizationId as number));
    this.store.dispatch(
      new GetAgencyOrderCandidatesList(
        order.id,
        order.organizationId as number,
        1,
        30,
        this.orderManagementService.excludeDeployed
      )
    );
    this.getOrders();
  }

  updatePositionDetails(position: OrderManagementChild): void {
    this.getOrders();
    this.orderManagementContentService.getCandidateJob(position.organizationId, position.jobId).subscribe((res) => {
      this.selectedCandidate = {
        ...position,
        closeDate: res.closeDate,
        positionClosureReason: res.positionClosureReason,
        positionClosureReasonId: res.positionClosureReasonId,
      };
    });
  }

  private handleRedirectFromQuickOrderToast(): void {
    if (this.isRedirectedFromToast) {
      this.ordersPage$.pipe(filter(Boolean), take(1)).subscribe((data) => {
        this.pageSubject.next(data.totalPages);
        this.isSubrowDisplay = false;
        this.actions$.pipe(ofActionSuccessful(GetOrders)).subscribe(() => {
          this.ordersPage$.pipe(take(1)).subscribe((data) => {
            data.items.find((item, i) => {
              if (item.publicId === this.publicId && item.organizationPrefix === this.organizationPrefix) {
                this.gridWithChildRow.selectRow(i);
              }
            });
          });
        });
      });
    }
  }
}
