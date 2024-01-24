import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DatePipe, Location } from '@angular/common';

import { debounceTime, filter, Observable, skip, Subject, takeUntil, takeWhile, tap, take, BehaviorSubject } from 'rxjs';
import { Actions, ofActionDispatched, ofActionSuccessful, Select, Store } from '@ngxs/store';

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
import { GRID_CONFIG, OrganizationSettingKeys, OrganizationalHierarchy } from '@shared/constants';
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
  ClearSelectedOrder,
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
  OrderStatusesList,
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
import { OrderType, VmsOrderTypeTooltipMessage } from '@shared/enums/order-type';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { PreviewOrderDialogComponent } from
  '@agency/order-management/order-management-grid/preview-order-dialog/preview-order-dialog.component';
import { OrderManagementAgencyService } from '@agency/order-management/order-management-agency.service';
import { UpdateGridCommentsCounter } from '@shared/components/comments/store/comments.actions';
import { PreservedFiltersState } from 'src/app/store/preserved-filters.state';
import { GetIrpOrderCandidates } from '@client/store/order-managment-content.actions';
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
import { OrderManagementService } from '@client/order-management/components/order-management-content/order-management.service';
import { AlertIdEnum } from '@admin/alerts/alerts.enum';
import { OutsideZone } from '@core/decorators';
import { SecurityState } from 'src/app/security/store/security.state';
import { DateTimeHelper } from '@core/helpers';
import { Router } from '@angular/router';
import { SettingsViewService } from '@shared/services';
import { GetOrganizationsStructureAll } from 'src/app/security/store/security.actions';

@Component({
  selector: 'app-order-management-grid',
  templateUrl: './order-management-grid.component.html',
  styleUrls: ['./order-management-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ChipsCssClass, DetailRowService],
})
export class OrderManagementGridComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @Input() filteredItems$: Subject<number>;
  @Input() selectedTab: AgencyOrderManagementTabs;
  @Input() exportButtonClicked: boolean;
  @Input() onExportClicked$: Subject<any>;
  @Input() search$: Subject<string>;
  @Input() public orderStatus: string[];
  @Input() public candidateStatuses: string[];
  @Input() public ltaOrder: boolean | null = false;

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
  public orderPositionSelected$ = new Subject<boolean>();
  public openChildDialog = new Subject<any>();
  public previousSelectedOrderId: number | null;
  public selectedCandidate: any | null;
  public selectedReOrder: any | null;
  public filters: AgencyOrderFilters = {
    includeReOrders: true,
  };
  public filterColumns = AgencyOrderFiltersComponent.generateFilterColumns(false);
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
  public orderTypeTooltipMessage = VmsOrderTypeTooltipMessage;
  public selectedRowRef: any;
  public openDetailsTab = false;
  public targetElement: HTMLElement | null = document.body.querySelector('#main');
  private orderPerDiemId: number | null;
  private prefix: string | null;
  private orderId: number | null;
  private redirectFromPerDiem = false;
  private orderManagementPagerState: OrderManagementPagerState | null;
  private isAlive = true;
  private unsubscribe$: Subject<void> = new Subject();
  private pageSubject = new Subject<number>();
  private alertOrderId:number;
  private orderPublicId:string;
  public isAgencyVisibilityFlagEnabled = false;
  public isRedirectedFromDashboard : boolean;
  public isEnableClearedToStart:boolean = false;
  public myAgencyChildColumnsToExport:ExportColumn[] = myAgencyChildColumnsToExport;
  public isEnableClearedToStart$ : BehaviorSubject<boolean> =new BehaviorSubject<boolean>(false);
  constructor(
    private store: Store,
    private location: Location,
    private actions$: Actions,
    private datePipe: DatePipe,
    private filterService: FilterService,
    private orderManagementAgencyService: OrderManagementAgencyService,
    @Inject(GlobalWindow) protected readonly globalWindow : WindowProxy & typeof globalThis,
    private orderManagementService: OrderManagementService,
    private cd: ChangeDetectorRef,
    private readonly ngZone: NgZone,
    private router: Router,
    private settingService: SettingsViewService,
  ) {
    super();
    const routerState = this.router.getCurrentNavigation()?.extras?.state;
    this.isRedirectedFromDashboard = routerState?.['redirectedFromDashboard'] || false;
    this.listenRedirectFromExtension();
  }

  ngOnInit(): void {
    this.isAgencyVisibilityFlagEnabled = this.store.selectSnapshot(SecurityState.isAgencyVisibilityFlagEnabled);
    this.filterColumns = AgencyOrderFiltersComponent.generateFilterColumns(this.isAgencyVisibilityFlagEnabled);
    this.getAlertOrderId();
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
      if(this.filterColumns.regionIds.dataSource.length > 0 && this.isRedirectedFromDashboard){       
        this.isRedirectedFromDashboard=false;
        this.patchFilterForm();
        this.prepopulateAgencyFilterFormStructure();
      }
      this.ordersPage = data;
      this.reOrderNumber.emit(data?.items[0]?.reOrderCount || 0);
      if(this.ordersPage?.items){
        const filteredOrder= this.ordersPage.items.find((i) => i.orderId === this.alertOrderId);
        if(this.alertOrderId>0 && filteredOrder){
         this.gridWithChildRow.dataSource=this.ordersPage.items;
          this.onRowClick({data:this.ordersPage.items[0],isInteracted:false})
        }
      }
      this.cd.detectChanges();
    });

    this.subscribeOnPageChanges();
    this.onTabChange();
    this.onCommentRead();
    this.listenRedirectFromPerDiem();
    this.listenRedirectFromReOrder();
    if(!this.isRedirectedFromDashboard){
      this.getPreservedFiltersByPageName();
    }

  }

  public getMappedOrganizations($event:Array<any>): void {    
    this.isEnableClearedToStart = false;
    this.isEnableClearedToStart$.next(false);
    if($event.length > 0 && this.selectedTab == AgencyOrderManagementTabs.MyAgency){
      let mappedOrg = $event.map((ele:any)=> ele.id ? ele.id : ele.organizationId);
      this.settingService
      .getViewSettingsOfMultiOrg(
        OrganizationSettingKeys.EnableClearedToStartForAcceptedCandidates,
        OrganizationalHierarchy.Organization,
        mappedOrg[0],
        mappedOrg,
      ).pipe(takeUntil(this.unsubscribe$))
        .subscribe(({ EnableClearedToStartForAcceptedCandidates }) => {
          this.isEnableClearedToStart = JSON.parse(EnableClearedToStartForAcceptedCandidates);
          console.log('isEnableClearedToStart',this.isEnableClearedToStart);
          this.isEnableClearedToStart$.next(this.isEnableClearedToStart);
          this.checkSelectedChildrenItem();
        });
    }
    
  }

  ngOnDestroy(): void {
    this.store.dispatch([
      new ResetPageFilters(),
      new ClearSelectedOrder(),
      new ClearOrders(),
    ]);
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
        this.cd.detectChanges();
      });
  }

  public onExportSelectedSubscribe(): void {
    this.onExportClicked$
      .pipe(takeUntil(this.unsubscribe$), filter(Boolean))
      .subscribe((event: any) => this.exportSelected(event));
  }
  public getAlertOrderId():void{
    let alertTitle = JSON.parse(localStorage.getItem('alertTitle') || '""') as string;
    this.alertOrderId = JSON.parse((localStorage.getItem('OrderId') || '0')) as number;
    this.orderPublicId = JSON.parse((localStorage.getItem('OrderPublicId') || '""')) as string;
    (!this.alertOrderId)?this.alertOrderId=0:"";
    (!this.orderPublicId)?this.orderPublicId='':"";
    if((alertTitle.trim()).toLowerCase()!=AlertIdEnum[AlertIdEnum['Candidate Level Comments']].trim().toLowerCase()){
      this.globalWindow.localStorage.setItem("alertTitle", JSON.stringify(""));
    }
    window.localStorage.setItem("OrderId", JSON.stringify(""));
    window.localStorage.setItem("OrderPublicId", JSON.stringify(""));
    if(this.alertOrderId>0){
      if((AlertIdEnum[AlertIdEnum['Candidate Status Update: Shortlisted']].trim()).toLowerCase() == (alertTitle.trim()).toLowerCase()
       || (AlertIdEnum[AlertIdEnum['Candidate Status Update: Onboard']].trim()).toLowerCase() == (alertTitle.trim()).toLowerCase()
       || (AlertIdEnum[AlertIdEnum['Candidate Status Update: Accepted']].trim()).toLowerCase() == (alertTitle.trim()).toLowerCase()
       || (AlertIdEnum[AlertIdEnum['Candidate Status Update: Offered']].trim()).toLowerCase() == (alertTitle.trim()).toLowerCase()
       || (AlertIdEnum[AlertIdEnum['Candidate Status Update: Rejected']].trim()).toLowerCase() == (alertTitle.trim()).toLowerCase()
       || (AlertIdEnum[AlertIdEnum['Candidate Status Update: Cancelled']].trim()).toLowerCase() == (alertTitle.trim()).toLowerCase()
       || (AlertIdEnum[AlertIdEnum['Candidate Status Update: Offboard']].trim()).toLowerCase() == (alertTitle.trim()).toLowerCase()
       || (AlertIdEnum[AlertIdEnum['Candidate Status Update: Applied']].trim()).toLowerCase() == (alertTitle.trim()).toLowerCase()
       || (AlertIdEnum[AlertIdEnum['Candidate Status Update: Custom Status']].trim()).toLowerCase() == (alertTitle.trim()).toLowerCase()
       || (AlertIdEnum[AlertIdEnum['Candidate Status Update: End']].trim()).toLowerCase() == (alertTitle.trim()).toLowerCase()
       || (alertTitle.trim()).toLowerCase()==AlertIdEnum[AlertIdEnum['Candidate Level Comments']].trim().toLowerCase()
      )
      this.previousSelectedOrderId = this.alertOrderId;
      else{
        this.openDetailsTab = true;
      }
    }
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
            ...filtersExport,
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
      }
    }

    if (this.selectedReOrder) {
      const rowIndex = this.gridWithChildRow.getRowIndexByPrimaryKey(this.selectedReOrder.selected.order);
      if (rowIndex !== -1) {
        this.focusToRowWithoutSelect(rowIndex);
        this.scrollToSelectedReorder();
      }
    }

    this.openPerDiemDetails();
    this.openMyAgencyTabWithCandidate();
    this.contentLoadedHandler(this.cd);
  }

  private applyDashboardFilters(): AgencyOrderFilters {
    const filters = {} as AgencyOrderFilters;
    filters.orderStatuses=this.orderStatus;
    filters.candidateStatuses=this.candidateStatuses;
    const dashboardFilterState = this.globalWindow.localStorage.getItem('dashboardFilterState') || 'null';
    const items = JSON.parse(dashboardFilterState) as FilteredItem[] || [];
    items.forEach((item: FilteredItem) => {
      const filterKey = item.column as keyof AgencyOrderFilters;
      if (filterKey in filters) {
        (filters[filterKey] as number[]).push(item.value);
      } else {
        (filters[filterKey] as number[]) = [item.value];
      }
    });
    return filters;
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
    this.cd.detectChanges();
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

  public setDefaultFilters(orderStatusesList: OrderStatusesList): void {
    if (this.orderManagementPagerState?.filters) {
      // apply preserved filters by redirecting back from the candidate profile
      this.filters = { ...this.orderManagementPagerState?.filters };
      this.patchFilterForm(!!this.filters?.regionIds?.length);
      this.prepopulateFilterFormStructure();
      this.dispatchNewPage();
      return;
    }

    const preservedFiltes = this.store.selectSnapshot(
      PreservedFiltersState.preservedFiltersByPageName
    ) as PreservedFiltersByPage<AgencyOrderFilters>;

    if (!preservedFiltes.isNotPreserved && this.alertOrderId == 0) {
      const { state } = preservedFiltes;
      const orderStatuses = Array.isArray(state.orderStatuses) ? [...state.orderStatuses] : [];
      const filterState = { ...state, orderStatuses };
      const filterFormConfig = GetAgencyFilterFormConfig(this.selectedTab);
      this.filters = this.filterService.composeFilterState(filterFormConfig, filterState);
      this.filters.clearedToStart = this.isEnableClearedToStart ? this.filters.clearedToStart == false ? "no" : this.filters.clearedToStart == true ? 'yes' : null :  null;
      if(this.Organizations != null && this.Organizations.length > 0){
        this.OrderFilterFormGroup.get('organizationIds')?.setValue([...this.Organizations]);
        this.filters.organizationIds = (this.Organizations.length > 0) ? this.Organizations : undefined;
      }
      if(this.orderStatus != null && this.orderStatus.length > 0){
        this.OrderFilterFormGroup.get('orderStatuses')?.setValue([...this.orderStatus]);
        this.filters.orderStatuses = this.orderStatus.length > 0 ? this.orderStatus : undefined;
      }
      if(this.candidateStatuses != null && this.candidateStatuses.length > 0){
        this.clearFilters();
        this.setDefaultStatuses(orderStatusesList, true);
      }
      if(this.ltaOrder){
        this.clearFilters();
      }
        if(this.isAgencyVisibilityFlagEnabled){
          this.patchFilterForm();
          this.prepopulateAgencyFilterFormStructure();
        }else{
          this.patchFilterForm(!!this.filters?.regionIds?.length);
          this.prepopulateFilterFormStructure();
        }

      this.dispatchNewPage();
      return;
    }
    if(this.alertOrderId > 0){
      this.filters.orderPublicId = this.orderPublicId;
      this.dispatchNewPage();
      this.OrderFilterFormGroup.controls['orderPublicId'].setValue(this.orderPublicId);
      this.generateFilterChips();
   }
    const { selectedOrderAfterRedirect } = this.orderManagementAgencyService;
    if (this.redirectFromPerDiem || selectedOrderAfterRedirect) {
      this.redirectFromPerDiem = false;
      selectedOrderAfterRedirect && this.selectedTab && this.dispatchNewPage();
    } else {
      this.setDefaultStatuses(orderStatusesList, preservedFiltes.dispatch);
    }
    this.cd.detectChanges();
  }

  private prepopulateAgencyFilterFormStructure(): void {
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
    }else if(this.filters.organizationIds){
      this.OrderFilterFormGroup.get('organizationIds')?.setValue([...this.filters.organizationIds]);
    }
    this.generateFilterChips();
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

  private setDefaultStatuses(orderStatusesList: OrderStatusesList, setDefaultFilters: boolean): void {
    if(this.ltaOrder || this.isRedirectedFromDashboard){
      this.clearFilters();
    }
    if(this.Organizations.length > 0){
      this.OrderFilterFormGroup.get('organizationIds')?.setValue((this.Organizations.length > 0) ? this.Organizations : undefined);
      this.filters.organizationIds = (this.Organizations.length > 0) ? this.Organizations : undefined;
    }
    if(this.candidateStatuses != null && this.candidateStatuses.length > 0){
      this.OrderFilterFormGroup.get('candidateStatuses')?.setValue([...this.candidateStatuses]);
      this.filters.candidateStatuses = this.candidateStatuses.length > 0 ? this.candidateStatuses : undefined;
    }
    if (setDefaultFilters) {
      let Status = [FilterOrderStatusText.Open, FilterOrderStatusText['In Progress'], FilterOrderStatusText.Filled];
      const statuse = this.filterColumns.orderStatuses.dataSource.filter((f: FilterOrderStatusText) =>
        Status.includes(f)
      );

      const filteredReorderStatuses = orderStatusesList.reorderStatuses?.filter((status: string) => {
        return [FilterOrderStatusText.Open, FilterOrderStatusText['In Progress'], FilterOrderStatusText.Filled].includes(status as FilterOrderStatusText)
      });

      setTimeout(() => {
        if (this.selectedTab === AgencyOrderManagementTabs.PerDiem) {
          const reorderStatuses = orderStatusesList.reorderStatuses.length ? orderStatusesList.reorderStatuses : filteredReorderStatuses;
          this.OrderFilterFormGroup.get('reorderStatuses')?.setValue(reorderStatuses);
          this.filters.reorderStatuses = reorderStatuses;
        }

        if(!this.ltaOrder) {
            this.OrderFilterFormGroup.get('orderStatuses')?.setValue(this.orderStatus.length > 0 ? this.orderStatus : orderStatusesList.orderStatuses);
            this.filters.orderStatuses = this.orderStatus.length > 0 ? this.orderStatus : statuse;
          }
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
          if (this.orderPerDiemId || this.orderId) {
            this.filters.orderPublicId = this.prefix + '-' + this.orderPerDiemId;
            this.OrderFilterFormGroup.controls['orderPublicId'].setValue(
              (this.prefix + '-' + (this.orderPerDiemId || this.orderId))?.toString()
            );
            this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns);
            this.filteredItems$.next(this.filteredItems.length);
          }
          this.store.dispatch(new GetAgencyFilterOptions());
          this.resetGridHorizontalScroll(this.gridWithChildRow);
        })
      )
      .subscribe();
  }

  public override updatePage(): void {
    this.dispatchNewPage();
  }

  private dispatchNewPage(): void {
    if(this.isRedirectedFromDashboard){
      this.filters = this.applyDashboardFilters();
      if(this.ltaOrder){
        this.filters.ltaOrder = this.ltaOrder;
      }
      if(this.Organizations.length > 0){
        this.filters.organizationIds = (this.Organizations.length > 0) ? this.Organizations : undefined;
      }else{
        this.Organizations = this.filters.organizationIds && this.filters.organizationIds?.length > 0 ? this.filters.organizationIds : this.Organizations;
      }
      this.patchFilterForm();
      this.prepopulateAgencyFilterFormStructure();
    }
    const { selectedOrderAfterRedirect } = this.orderManagementAgencyService;
    this.filters.orderBy = this.orderBy;
    switch (this.selectedTab) {
      case AgencyOrderManagementTabs.MyAgency:
        if(this.ltaOrder){
          this.filters.ltaOrder = this.ltaOrder;
        }
        this.filters.includeReOrders = true;
        let filtersMyAgency = {...this.filters};
          if(this.filters.orderLocked){
            filtersMyAgency.orderLocked = filtersMyAgency.orderLocked == 'false' ? false : filtersMyAgency.orderLocked == 'true' ? true : null
          }
          if(this.filters.clearedToStart){
            filtersMyAgency.clearedToStart = filtersMyAgency.clearedToStart == 'no' ? false : filtersMyAgency.clearedToStart == 'yes' ? true : null
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
    this.cd.detectChanges();
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
    this.cd.detectChanges();
  }

  public onRowClick(event: RowSelectEventArgs): void {
    if ((event.rowIndex !== undefined) && event.rowIndex === event.previousRowIndex) {
      return;
    }

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
      this.getCandidatesList(rowData);

      this.orderPositionSelected$.next(false);
    }

    this.checkSelectedChildrenItem();
    if (!isArray(event.data)) {
      this.selectedRowRef = event;
    }
  }

  public onRowDeselect(event: RowSelectEventArgs, grid: GridComponent) {
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
    this.openPreview.next(true);
  }

  public selectReOrder(): void {
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

  private getCandidatesList(rowData: AgencyOrderManagement): void {
    if (rowData.irpOrderMetadata) {
      this.store.dispatch(new GetIrpOrderCandidates(
        rowData.orderId,
        rowData.organizationId,
        GRID_CONFIG.initialPage,
        GRID_CONFIG.initialRowsPerPage,
        this.orderManagementAgencyService.getIsAvailable(),
        this.orderManagementService.getEmployeeToggleState()?.includeDeployed,
        ""
      ));
    } else {
      this.store.dispatch(new GetAgencyOrderCandidatesList(
        rowData.orderId,
        rowData.organizationId,
        GRID_CONFIG.initialPage,
        GRID_CONFIG.initialRowsPerPage,
        this.orderManagementAgencyService.excludeDeployed,
        ""
      ));
    }
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
      reOrderDate: this.filters.reOrderDate || null,
      jobEndDate: this.filters.jobEndDate || null,
      candidateStatuses: this.filters.candidateStatuses || [],
      candidatesCountFrom: this.filters.candidatesCountFrom || null,
      candidatesCountTo: this.filters.candidatesCountTo || null,
      organizationIds: this.filters.organizationIds || [],
      orderStatuses: this.filters.orderStatuses || [],
      reorderStatuses: this.filters.reorderStatuses || [],
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
      shift:this.filters.shift || null,
      orderLocked:this.filters.orderLocked || null,
      clearedToStart : this.filters.clearedToStart || null,
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
        this.myAgencyChildColumnsToExport = [...myAgencyChildColumnsToExport];
        if(this.isEnableClearedToStart){
          let newCol = { text: 'Cleared to Start', column: 'ClearedToStart' };
          this.myAgencyChildColumnsToExport.splice(2, 0, newCol);
          this.myAgencyChildColumnsToExport.join();
        }
        if (this.selectedItems.length === 0) {
          this.columnsToExport = [...myAgencyColumnsToExport, ...this.myAgencyChildColumnsToExport];
          return;
        }
        this.columnsToExport = hasSelectedItemChildren
          ? [...myAgencyColumnsToExport, ...this.myAgencyChildColumnsToExport]
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
    this.ltaOrder = false;
    this.orderManagementAgencyService.selectedOrderAfterRedirect = null;
    this.store.dispatch(new ClearPageFilters(this.getPageName()));
    this.clearFilters();
    this.dispatchNewPage();
  }

  public onFilterApply(): void {
    this.ltaOrder = false;
    if (this.OrderFilterFormGroup.dirty) {
      this.filters = this.OrderFilterFormGroup.getRawValue();
      this.filters.orderPublicId = this.filters.orderPublicId?.toUpperCase() || null;
      this.filters.billRateFrom = this.filters.billRateFrom || null;
      this.filters.billRateTo = this.filters.billRateTo || null;
      this.filters.annualSalaryRangeFrom = this.filters.annualSalaryRangeFrom || null;
      this.filters.annualSalaryRangeTo = this.filters.annualSalaryRangeTo || null;
      this.filters.reOrderDate = this.filters.reOrderDate || null;
      this.filters.candidatesCountFrom = this.filters.candidatesCountFrom || null;
      this.filters.candidatesCountTo = this.filters.candidatesCountTo || null;
      this.filters.openPositions = this.filters.openPositions || null;
      this.filters.clearedToStart = this.filters.clearedToStart || null;
      this.filters.regionIds = this.filters.regionIds || [];
      this.convertFilteredDates();
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

  private convertFilteredDates(): void {
    this.filters.jobStartDate = this.filters.jobStartDate ?
      DateTimeHelper.setInitHours(DateTimeHelper.setUtcTimeZone(this.filters.jobStartDate)) : null;
    this.filters.jobEndDate = this.filters.jobEndDate ?
      DateTimeHelper.setInitHours(DateTimeHelper.setUtcTimeZone(this.filters.jobEndDate)) : null;
    this.filters.creationDateFrom = this.filters.creationDateFrom ?
      DateTimeHelper.setInitHours(DateTimeHelper.setUtcTimeZone(this.filters.creationDateFrom)) : null;
    this.filters.creationDateTo = this.filters.creationDateTo ?
      DateTimeHelper.setInitHours(DateTimeHelper.setUtcTimeZone(this.filters.creationDateTo)) : null;
    this.filters.distributedOnFrom = this.filters.distributedOnFrom ?
      DateTimeHelper.setInitHours(DateTimeHelper.setUtcTimeZone(this.filters.distributedOnFrom)) : null;
    this.filters.distributedOnTo = this.filters.distributedOnTo ?
      DateTimeHelper.setInitHours(DateTimeHelper.setUtcTimeZone(this.filters.distributedOnTo)) : null;
    this.filters.reOrderDate = this.filters.reOrderDate ?
      DateTimeHelper.setInitHours(DateTimeHelper.setUtcTimeZone(this.filters.reOrderDate)) : null;
  }

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
        this.clearSelection(this.gridWithChildRow);
        this.previousSelectedOrderId = null;
        this.orderManagementPagerState = null;
        this.selectedReOrder = null;
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
      this.alertOrderId = 0;
      this.orderPublicId = '';
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
        const user = this.store.selectSnapshot(UserState.user);
        if(user && this.isAgencyVisibilityFlagEnabled){
          this.store.dispatch(new GetOrganizationsStructureAll(user?.id));
        }
        this.openPreview.next(false);
        this.clearFilters();
        this.getPreservedFiltersByPageName();
        this.store.dispatch(new GetAgencyFilterOptions());
      });
  }

  private onReloadOrderCandidatesLists(): void {
    this.actions$
      .pipe(
        ofActionDispatched(ReloadOrderCandidatesLists),
        takeWhile(() => this.isAlive)
      )
      .subscribe(() => {
        this.store.dispatch(new GetAgencyOrdersPage(this.currentPage, this.pageSize, this.filters));
        this.store.dispatch(new GetOrderById(this.selectedOrder.orderId as number, this.selectedOrder.organizationId));
        this.getCandidatesList(this.selectedOrder);
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
}
