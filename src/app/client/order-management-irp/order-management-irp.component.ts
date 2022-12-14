import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import {
  OrderManagementIRPSystemId,
  OrderManagementIRPTabsIndex,
  OrderManagementVMSTabsIndex,
  OrganizationOrderManagementTabIndex,
} from '@shared/enums/order-management-tabs.enum';
import { FormGroup } from '@angular/forms';
import { BaseObservable } from '@core/helpers';
import {
  IRPOrderManagementPage,
  Order,
  OrderFilter,
  OrderManagement,
  OrderManagementPage,
} from '@shared/models/order-management.model';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { DashboardState } from '../../dashboard/store/dashboard.state';
import { catchError, debounceTime, delay, EMPTY, Observable, of, Subject, takeUntil, throttleTime } from 'rxjs';
import { FilteredItem } from '@shared/models/filter.model';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import { ActivatedRoute, Router } from '@angular/router';
import { SetHeaderState, ShowFilterDialog, ShowToast } from '../../store/app.actions';
import { MultiSelectComponent } from '@syncfusion/ej2-angular-dropdowns';
import { TakeUntilDestroy } from '@core/decorators';
import {
  ClearOrders,
  DeleteOrder,
  DuplicateOrder,
  DuplicateOrderSuccess,
  GetAgencyOrderCandidatesList,
  GetIRPOrders,
  GetOrderById,
  GetOrders,
  SetLock,
} from '@client/store/order-managment-content.actions';
import {
  MoreMenuType,
  ROW_HEIGHT,
} from '@client/order-management/order-management-content/order-management-content.constants';
import { SearchComponent } from '@shared/components/search/search.component';
import { Location } from '@angular/common';
import {
  TabNavigationComponent,
} from '@client/order-management/order-management-content/tab-navigation/tab-navigation.component';
import { OrderManagementIrpService } from '@client/order-management-irp/services/order-management-irp.service';
import {
  irpTabsConfig,
  MapSystemWithTabs, openInProgressFilledStatuses,
  orderGridSubRowOptions,
  systemGroupConfig,
  ThreeDotsMenuOptions,
} from '@client/order-management-irp/constants/order-management-irp.const';
import { ButtonModel } from '@shared/models/buttons-group.model';
import { PermissionService } from '../../security/services/permission.service';
import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';
import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';
import { ColDef, GridOptions, Module, SortChangedEvent } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GRID_EMPTY_MESSAGE } from '@shared/components/grid/constants/grid.constants';
import { OrderManagementIrpHelper } from '@client/order-management-irp/helpers/order-management-irp.helper';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { OrganizationSettingsGet } from '@shared/models/organization-settings.model';
import { SettingsKeys } from '@shared/enums/settings';
import { SettingsHelper } from '@core/helpers/settings.helper';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { Permission } from '@core/interface';
import { filter, take } from 'rxjs/operators';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE, GRID_CONFIG } from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';
import { MessageTypes } from '@shared/enums/message-types';
import { ReOpenOrderService } from '@client/order-management/reopen-order/reopen-order.service';
import isNil from 'lodash/fp/isNil';
import { FilterService } from '@shared/services/filter.service';

@TakeUntilDestroy
@Component({
  selector: 'app-order-management-irp',
  templateUrl: './order-management-irp.component.html',
  styleUrls: ['./order-management-irp.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderManagementIrpComponent extends AbstractPermissionGrid {
  @ViewChild('search') search: SearchComponent;
  @ViewChild('orderStatusFilter') readonly orderStatusFilter: MultiSelectComponent;
  @ViewChild('tabNavigation') tabNavigation: TabNavigationComponent;

  @Select(OrderManagementContentState.IRPOrdersPage)
  ordersPage$: Observable<IRPOrderManagementPage>;

  @Select(OrganizationManagementState.organizationSettings)
  organizationSettings$: Observable<OrganizationSettingsGet[]>;

  @Select(DashboardState.filteredItems)
  private readonly filteredItems$: Observable<FilteredItem[]>;

  settings: { [key in SettingsKeys]?: OrganizationSettingsGet };
  SettingsKeys = SettingsKeys;

  activeTab: OrderManagementIRPTabsIndex | OrderManagementVMSTabsIndex = OrderManagementIRPTabsIndex.AllOrders;
  activeSystem: OrderManagementIRPSystemId = OrderManagementIRPSystemId.IRP;
  systemGroupConfig: ButtonModel[] = systemGroupConfig;
  tabsListConfig: TabsListConfig[] = irpTabsConfig;

  OrderFilterFormGroup: FormGroup;
  filters: OrderFilter = {};
  filterColumns: any;
  canCreateOrder: boolean;
  canCloseOrder: boolean;
  hasCreateEditOrderPermission: boolean;
  OrganizationOrderManagementTabIndex = OrganizationOrderManagementTabIndex;
  OrderManagementIRPSystemId = OrderManagementIRPSystemId;
  previousSelectedOrderId: number | null;
  isLockMenuButtonsShown = true;
  selectedOrder: Order;

  importDialogEvent: BaseObservable<boolean> = new BaseObservable<boolean>(false);
  openDetails = new Subject<boolean>();

  threeDotsMenuOptions: Record<string, ItemModel[]>;
  columnDefs: ColDef[] = [];
  context: { componentParent: OrderManagementIrpComponent };
  gridOptions: GridOptions = orderGridSubRowOptions;

  readonly gridEmptyMessage = GRID_EMPTY_MESSAGE;
  readonly modules: Module[] = [ClientSideRowModelModule];

  protected componentDestroy: () => Observable<unknown>;

  private filterApplied = false;
  private selectedIndex: number | null;
  private searchSubj: BaseObservable<string> = new BaseObservable<string>('');
  private cd$: Subject<boolean> = new Subject<boolean>();
  private pageSubject: Subject<number> = new Subject<number>();
  private orderPerDiemId: number | null;
  private orderId: number | null;
  private ordersPage: IRPOrderManagementPage;
  private openInProgressFilledStatuses = openInProgressFilledStatuses;
  private prefix: string | null;

  constructor(
    protected override store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private location: Location,
    private orderManagementIrpService: OrderManagementIrpService,
    private orderManagementAPIService: OrderManagementContentService,
    private permissionService: PermissionService,
    private confirmService: ConfirmService,
    private reOpenOrderService: ReOpenOrderService,
    private actions$: Actions,
    private filterService: FilterService,
  ) {
    super(store);

    this.context = { componentParent: this };

    const routerState = this.router.getCurrentNavigation()?.extras?.state;

    // this.isRedirectedFromDashboard = routerState?.['redirectedFromDashboard'] || false;
    // this.orderStaus = routerState?.['orderStatus'] || 0;
    // this.isRedirectedFromToast = routerState?.['redirectedFromToast'] || false;
    // this.quickOrderId = routerState?.['publicId'];
    this.prefix = routerState?.['prefix'];

    store.dispatch(new SetHeaderState({ title: 'Order Management', iconName: 'file-text' }));
    // this.OrderFilterFormGroup = this.fb.group({
    //   orderPublicId: new FormControl(null),
    //   regionIds: new FormControl([]),
    //   locationIds: new FormControl([]),
    //   departmentsIds: new FormControl([]),
    //   skillIds: new FormControl([]),
    //   orderTypes: new FormControl([]),
    //   jobTitle: new FormControl(null),
    //   billRateFrom: new FormControl(null),
    //   billRateTo: new FormControl(null),
    //   openPositions: new FormControl(null),
    //   jobStartDate: new FormControl(null),
    //   jobEndDate: new FormControl(null),
    //   orderStatuses: new FormControl([]),
    //   annualSalaryRangeFrom: new FormControl(null),
    //   annualSalaryRangeTo: new FormControl(null),
    //   candidateStatuses: new FormControl([]),
    //   candidatesCountFrom: new FormControl(null),
    //   candidatesCountTo: new FormControl(null),
    //   agencyIds: new FormControl([]),
    //   agencyType: new FormControl('0'),
    //   templateTitle: new FormControl(null),
    //   creationDateFrom: new FormControl(null),
    //   creationDateTo: new FormControl(null),
    //   distributedOnFrom: new FormControl(null),
    //   distributedOnTo: new FormControl(null),
    //   candidateName: new FormControl(null),
    //   projectTypeIds: new FormControl(null),
    //   projectNameIds: new FormControl(null),
    //   poNumberIds: new FormControl(null),
    // });
  }

  override ngOnInit(): void {
    super.ngOnInit();

    this.subscribeForSettings();
    this.getOrders();

    const locationState = this.location.getState() as { orderId: number };
    this.previousSelectedOrderId = locationState.orderId;

    this.subscribeOnPermissions();
    this.duplicateOrderSucceededHandler();
    this.gridPageChangedHandler();
    this.ordersDataLoadHandler();
    this.watchForPermissions();
    this.subscribeOnChanges();
    this.firstInitGridColumns();
  }

  searchOrders(event: KeyboardEvent): void {
    const { value } = event.target as HTMLInputElement;
    const controlName = 'jobTitle';
    if (value.length >= 2) {
      this.OrderFilterFormGroup.controls[controlName].setValue(value);
      this.searchSubj.set(value);
    } else if (value.length === 0 && this.filters[controlName]?.length) {
      this.OrderFilterFormGroup.controls[controlName].setValue('');
      this.searchSubj.set(value);
    }
  }

  openImportDialog(): void {
    this.importDialogEvent.set(true);
  }

  navigateToOrderForm(): void {
    this.router.navigate(['./add'], { relativeTo: this.route });
  }

  showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
    setTimeout(() => {
      this.orderStatusFilter?.refresh();
      this.cd$.next(true);
    }, 300);
  }

  tabSelected(tabIndex: number): void {
    this.activeTab = tabIndex;
    this.clearFilters();
    this.filterApplied = false;

    if (!this.previousSelectedOrderId) {
      this.openDetails.next(false);
      this.store.dispatch(new ClearOrders());
      this.selectedIndex = null;

      this.initGridColumns();

      this.pageSubject.next(1);

      this.getOrders();
    }
    this.cd$.next(true);
  }

  buttonGroupChange(selectedBtn: ButtonModel) {
    this.activeSystem = selectedBtn.id;
    this.tabsListConfig = MapSystemWithTabs.get(this.activeSystem) || [];

    this.initGridColumns();

    this.cd$.next(true);
  }

  // GRID ACTIONS START ----------
  createReorder(data: OrderManagement): void {
    console.log(data, 'data');
    // this.openReOrderDialog(data.id, data.organizationId);
    // this.addEditReOrderService.setReOrderDialogTitle(SidebarDialogTitlesEnum.AddReOrder);
    // this.creatingReorder = true;
    // this.gridWithChildRow.selectRow(parseInt(data.index));
  }

  openOrderDetail(data: OrderManagement): void {
    console.log(data, 'data');
    // this.openReOrderDialog(data.id, data.organizationId);
    // this.addEditReOrderService.setReOrderDialogTitle(SidebarDialogTitlesEnum.AddReOrder);
    // this.creatingReorder = true;
    // this.gridWithChildRow.selectRow(parseInt(data.index));
  }

  lockOrder(order: Order): void {
    this.store.dispatch(
      new SetLock(order.id, !order.isLocked, this.filters, `${order.organizationPrefix || ''}-${order.publicId}`)
    );
  }

  menuOptionSelected(id: MoreMenuType, data: OrderManagement): void {
    switch (Number(id)) {
      case MoreMenuType['Edit']:
        this.editOrder(data);
        break;
      case MoreMenuType['Duplicate']:
        this.store.dispatch(new DuplicateOrder(data.id));
        break;
      case MoreMenuType['Close']:
        this.orderManagementAPIService.getOrderById(data.id).pipe(
          take(1),
          takeUntil(this.componentDestroy())
        ).subscribe((order) => {
          this.selectedOrder = { ...order };
          // this.store.dispatch(new ShowCloseOrderDialog(true));
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

  toggleRowHeight(scaled: boolean): void {
    this.rowHeight = scaled ? ROW_HEIGHT.SCALE_UP_HEIGHT : ROW_HEIGHT.SCALE_DOWN_HEIGHT;

    this.cd$.next(true);
  }
  // GRID ACTIONS END ----------

  editOrder(data: OrderManagement): void {
    if (!isNil(data.reOrderFromId) && data.reOrderFromId !== 0) {
    //   this.addEditReOrderService.setReOrderDialogTitle(SidebarDialogTitlesEnum.EditReOrder);
    //   this.openReOrderDialog(data.id, data.organizationId);
    } else {
      this.router.navigate(['./edit', data.id], { relativeTo: this.route });
    }
  }

  deleteOrder(id: number): void {
    if (!this.canCreateOrder) {
      return;
    }
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      }).pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.store.dispatch(new DeleteOrder(id));
    });
  }

  reOpenOrder(order: OrderManagement): void {
    this.reOpenOrderService
      .reOpenOrder({ orderId: order.id })
      .pipe(
        catchError((err) => {
          this.store.dispatch(new ShowToast(MessageTypes.Error, err.message));
          return EMPTY;
        }),
        take(1),
        takeUntil(this.componentDestroy()),
      )
      .subscribe(() => this.updateOrderDetails(order));
  }

  updateOrderDetails(order: Order | OrderManagement): void {
    this.store.dispatch(new GetOrderById(order.id, order.organizationId as number));
    this.dispatchAgencyOrderCandidatesList(order.id, order.organizationId as number);
    this.getOrders();
  }

  gridPageChanged(page: number) {
    this.pageSubject.next(page);
  }

  gridPerPageChanged(perPage: number) {
    this.pageSize = perPage;
    this.pageSubject.next(1);
  }

  gridSortHandler(sortEvent: SortChangedEvent): void {
    const columnWithSort = sortEvent.columnApi.getColumnState().find((col) => col.sort !== null);
    const orderBy = columnWithSort ? `${columnWithSort.colId} ${columnWithSort.sort}` : undefined;

    this.filters = {
      ...this.filters,
      orderBy,
    };

    this.getOrders();
  }

  getOrders(): void {
    this.filters.pageNumber = this.currentPage;
    this.filters.pageSize = this.pageSize;
    this.filters.orderType = this.activeTab ? this.activeTab - 1 : null;

    if (this.activeSystem === OrderManagementIRPSystemId.IRP) {
      this.store.dispatch(new GetIRPOrders(this.filters, this.activeTab === OrderManagementIRPTabsIndex.Incomplete));
    } else {
      this.store.dispatch(new GetOrders(this.filters, this.activeTab === OrderManagementIRPTabsIndex.Incomplete));
    }
  }

  private clearFilters(): void {
    // this.OrderFilterFormGroup.reset();
    // this.OrderFilterFormGroup.controls['agencyType'].setValue('0');
    // this.filteredItems = [];
    this.currentPage = 1;
    this.filters = {};
    this.search?.clear();
  }

  private subscribeOnChanges(): void {
    this.cd$.pipe(
      debounceTime(300),
      takeUntil(this.componentDestroy()),
    ).subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  private subscribeOnPermissions(): void {
    this.permissionService.getPermissions().pipe(
      takeUntil(this.componentDestroy()),
    ).subscribe(({ canCreateOrder, canCloseOrder }) => {
      this.canCreateOrder = canCreateOrder;
      this.canCloseOrder = canCloseOrder;
      this.initMenuItems();
      this.cd$.next(true);
    });
  }

  private initMenuItems(): void {
    this.threeDotsMenuOptions = ThreeDotsMenuOptions(this.canCreateOrder, this.canCloseOrder);
  }

  private watchForPermissions(): void {
    this.getPermissionStream().pipe(
      takeUntil(this.componentDestroy()),
    ).subscribe((permissions: Permission) => {
      this.hasCreateEditOrderPermission = permissions[this.userPermissions.CanCreateOrders]
        || permissions[this.userPermissions.CanOrganizationEditOrders];
      this.cd$.next(true);
    });
  }

  private subscribeForSettings(): void {
    this.organizationSettings$.pipe(
      takeUntil(this.componentDestroy()),
    ).subscribe((settings) => {
      this.settings = SettingsHelper.mapSettings(settings);
      this.cd$.next(true);
    });
  }

  private dispatchAgencyOrderCandidatesList(orderId: number, organizationId: number): void {
    this.store.dispatch(
      new GetAgencyOrderCandidatesList(
        orderId,
        organizationId,
        GRID_CONFIG.initialPage,
        GRID_CONFIG.initialRowsPerPage,
        this.orderManagementIrpService.excludeDeployed
      )
    );
  }

  private duplicateOrderSucceededHandler(): void {
    this.actions$.pipe(
      ofActionDispatched(DuplicateOrderSuccess),
      takeUntil(this.componentDestroy()),
    ).subscribe((data: { payload: number }) => {
      this.router.navigate(['./edit', data.payload], { relativeTo: this.route });
    });
  }

  private ordersDataLoadHandler(): void {
    this.ordersPage$.pipe(
      takeUntil(this.componentDestroy()),
    ).subscribe((data) => {
      this.ordersPage = data;
      if (data?.items) {
        data.items.forEach((item) => {
          item.isMoreMenuWithDeleteButton = !this.openInProgressFilledStatuses.includes(item.statusText.toLowerCase());
        });
      }
    });
  }

  private gridPageChangedHandler(): void {
    this.pageSubject.pipe(
      throttleTime(100),
      takeUntil(this.componentDestroy()),
    ).subscribe((page) => {
      this.currentPage = page;

      const { selectedOrderAfterRedirect } = this.orderManagementIrpService;

      if (this.orderPerDiemId || this.orderId || selectedOrderAfterRedirect) {
        const prefix = this.prefix || selectedOrderAfterRedirect?.prefix;
        const id = this.orderPerDiemId || this.orderId || selectedOrderAfterRedirect?.orderId;

        this.filters.orderPublicId = prefix + '-' + id;
        this.OrderFilterFormGroup.controls['orderPublicId'].setValue(
          (prefix + '-' + id)?.toString()
        );
        this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns);
      }
      this.getOrders();
    });
  }

  private firstInitGridColumns(): void {
    of(null).pipe(
      delay(1000),
      take(1),
      takeUntil(this.componentDestroy()),
    ).subscribe(() => {
      this.initGridColumns();

      this.cd$.next(true);
    });
  }

  private initGridColumns(): void {
    this.columnDefs = OrderManagementIrpHelper.prepareColDefs(
      this.activeSystem,
      this.activeTab,
      this.threeDotsMenuOptions,
      this.canCreateOrder,
      this.settings[SettingsKeys.IsReOrder]?.value,
      this.hasCreateEditOrderPermission,
    );
  }
}
