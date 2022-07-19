import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, ofActionDispatched, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { DetailRowService, FreezeService } from '@syncfusion/ej2-angular-grids';
import { filter, Observable, Subject, takeUntil, throttleTime, of } from 'rxjs';
import { SetHeaderState, ShowFilterDialog } from 'src/app/store/app.actions';
import { ORDERS_GRID_CONFIG } from '../../client.config';
import { SelectionSettingsModel, TextWrapSettingsModel } from '@syncfusion/ej2-grids/src/grid/base/grid-model';
import { STATUS_COLOR_GROUP } from 'src/app/shared/enums/status';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { CellClickedEvent, ColDef, GridReadyEvent } from '@ag-grid-community/core';
import {
  ApproveOrder,
  ClearSelectedOrder,
  DeleteOrder,
  DeleteOrderSucceeded,
  GetAgencyOrderCandidatesList,
  GetIncompleteOrders,
  GetOrderById,
  GetOrderFIlterDataSources,
  GetOrders,
  GetReOrders,
  ReloadOrganisationOrderCandidatesLists
} from '@client/store/order-managment-content.actions';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { OrderManagementChild, Order, OrderFilter, OrderManagement, OrderManagementPage, OrderFilterDataSource } from '@shared/models/order-management.model';
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
import { GetAllOrganizationSkills } from '@organization-management/store/organization-management.actions';
import { OrderTypeOptions } from '@shared/enums/order-type';
import { DatePipe, Location } from '@angular/common';
import { OrganizationOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';
import { MoreMenuType, OrderType, OrderTypeName, ROW_HEIGHT } from './order-management-content.constants';
import { AgGridAngular } from '@ag-grid-community/angular';

@Component({
  selector: 'app-order-management-content',
  templateUrl: './order-management-content.component.html',
  styleUrls: ['./order-management-content.component.scss'],
  providers: [FreezeService, DetailRowService],
})
export class OrderManagementContentComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  // @ViewChild('grid') override gridWithChildRow: GridComponent;
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;
  
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

  public activeTab: OrganizationOrderManagementTabs = OrganizationOrderManagementTabs.AllOrders;
  public allowWrap = ORDERS_GRID_CONFIG.isWordWrappingEnabled;
  public wrapSettings: TextWrapSettingsModel = ORDERS_GRID_CONFIG.wordWrapSettings;
  public isLockMenuButtonsShown = true;
  public moreMenuWithDeleteButton: ItemModel[] = [
    { text: MoreMenuType[0], id: '0' },
    { text: MoreMenuType[1], id: '1' },
    { text: MoreMenuType[3], id: '3' }
  ];
  public moreMenuWithCloseButton: ItemModel[] = [
    { text: MoreMenuType[0], id: '0' },
    { text: MoreMenuType[1], id: '1' },
    { text: MoreMenuType[2], id: '2' }
  ];

  private openInProgressFilledStatuses = [
    'open',
    'in progress',
    'filled',
    'custom step'
  ];
  public optionFields = {
    text: 'name',
    value: 'id',
  };
  public skillsFields = {
    text: 'skillDescription',
    value: 'id'
  };
  public statusFields = {
    text: 'statusText',
    value: 'status'
  };
  private unsubscribe$: Subject<void> = new Subject();
  private pageSubject = new Subject<number>();
  private selectedDataRow: Order;
  public selectedOrder: Order;
  public openDetails = new Subject<boolean>();
  public selectionOptions: SelectionSettingsModel = { type: 'Single', mode: 'Row', checkboxMode: 'ResetOnRowClick' };
  public OrderFilterFormGroup: FormGroup;
  public filters: OrderFilter = {};
  public filterColumns: any;
  public orgStructure: OrganizationStructure;
  public regions: OrganizationRegion[] = [];
  public previousSelectedOrderId: number | null;
  public selectedCandidat: any | null;
  public openChildDialog = new Subject<any>();
  private selectedIndex: number | null;
  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
  };
  public columnDefs: ColDef[] = [
    { field: 'id' },
    { field: 'statusText' },
    { field: 'jobTitle' },
    { field: 'skillName' },
    { field: 'openPositions' },
    { field: 'locationName' },
    { field: 'departmentName' },
    { field: 'orderType' },
    { field: 'billRate' },
    { field: 'candidates' },
    { field: 'startDate' },
  ];
  public data: any[] = [];
  constructor(private store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private actions$: Actions,
    private confirmService: ConfirmService,
    private filterService: FilterService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private location: Location) {
    super();
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
      candidateStatuses: new FormControl([]),
      candidatesCountFrom: new FormControl(null),
      candidatesCountTo: new FormControl(null),
      agencyIds: new FormControl([]),
      agencyType: new FormControl('0'),
    });    
  }

  ngOnInit(): void {
    this.orderFilterColumnsSetup();
    this.onOrderFilterDataSourcesLoadHandler();

    this.onOrganizationStructureDataLoadHandler();
    this.onDeleteOrderSucceededHandler();
    this.onApproveOrderHandler();

    this.onSelectedOrderDataLoadHandler();

    const locationState = this.location.getState() as { orderId: number };
    this.previousSelectedOrderId = locationState.orderId;

    this.onOrganizationChangedHandler();
    this.onGridPageChangedHandler();
    this.onOrdersDataLoadHandler();

    this.onOrderDetailsDialogOpenEventHandler();
    this.onOrderFilterControlValueChangedHandler();
    this.onSkillDataLoadHandler();
    this.onReloadOrderCandidatesLists();
    this.onChildDialogChange();
  }

  ngOnDestroy(): void {
    this.store.dispatch(new ClearSelectedOrder());
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public override updatePage(): void {
    this.getOrders();
  }

  private getOrders(): void {
    //this.filters.orderBy = this.orderBy; TODO: pending ordering fix on BE
    this.filters.orderId ? this.filters.orderId : null;
    this.filters.jobStartDate ? this.filters.jobStartDate : null;
    this.filters.jobEndDate ? this.filters.jobEndDate : null;
    this.filters.billRateFrom ? this.filters.billRateFrom : null;
    this.filters.billRateTo ? this.filters.billRateTo : null;
    this.filters.pageNumber = this.currentPage;
    this.filters.agencyType = this.filters.agencyType !== '0' ? parseInt(this.filters.agencyType as string, 10) : null;
    this.pageSize = this.pageSize;

    switch (this.activeTab) {
      case OrganizationOrderManagementTabs.AllOrders:
        this.store.dispatch([new GetOrders(this.filters), new GetOrderFIlterDataSources()]);
        break;
      case OrganizationOrderManagementTabs.ReOrders:
        // TODO: possible modifications later
        // TODO: modify filters for ReOrders
        this.store.dispatch(new GetReOrders(this.filters));
        break;
      case OrganizationOrderManagementTabs.Incomplete:
        this.store.dispatch(new GetIncompleteOrders({ pageNumber: this.currentPage, pageSize: this.pageSize }));
        break;
    }
  }

  public onFilterClose() {
    this.OrderFilterFormGroup.setValue({
      orderId: this.filters.orderId || null,
      regionIds: this.filters.regionIds || [],
      locationIds: this.filters.locationIds || [],
      departmentsIds: this.filters.departmentsIds || [],
      skillIds: this.filters.skillIds || [],
      orderTypes: this.filters.orderTypes || [],
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
    this.filteredItems = [];
    this.currentPage = 1;
    this.filters = {};
  }

  public onFilterClearAll(): void {
    this.clearFilters();
    this.getOrders();
  }

  public onFilterApply(): void {
    this.filters = this.OrderFilterFormGroup.getRawValue();
    this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns, this.datePipe);
    this.getOrders();
    this.store.dispatch(new ShowFilterDialog(false));
  }

  public onDataBound(): void {
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

    if (this.selectedIndex) {
      this.gridWithChildRow.selectRow(this.selectedIndex);
    }

    if (this.selectedCandidat) {
      const [data, index] = this.store.selectSnapshot(OrderManagementContentState.lastSelectedOrder)(
        this.selectedDataRow.id
      );
      const updatedCandidat = data?.children.find((child) => child.candidateId === this.selectedCandidat.candidateId);
      this.selectedCandidat = updatedCandidat;
    }
  }

  public onNextPreviousOrderEvent(next: boolean): void {
    const [index] = this.gridWithChildRow.getSelectedRowIndexes();
    const nextIndex = next ? index + 1 : index - 1;
    this.gridWithChildRow.selectRow(nextIndex);
  }

  public onRowClick(event: any): void {
    if (!event.isInteracted) {
      this.selectedDataRow = event.data;
      const data = event.data;
      const options = this.getDialogNextPreviousOption(data);
      this.store.dispatch(new GetOrderById(data.id, data.organizationId, options));
      this.store.dispatch(new GetAgencyOrderCandidatesList(data.id, data.organizationId, this.currentPage, this.pageSize));
      this.selectedCandidat = null;
      this.openChildDialog.next(false);
      this.openDetails.next(true);
    }
  }

  private onChildDialogChange(): void {
    this.openChildDialog.pipe(takeUntil(this.unsubscribe$)).subscribe((isOpen) => {
      if (!isOpen) {
        this.selectedCandidat = null;
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
    this.rowHeight = ROW_HEIGHT.SCALE_UP_HEIGHT;
  }

  public onRowScaleDownClick(): void {
    this.rowHeight = ROW_HEIGHT.SCALE_DOWN_HEIGHT;
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
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
    this.currentPage = 1;

    switch (tabIndex) {
      case OrganizationOrderManagementTabs.AllOrders:
        this.isLockMenuButtonsShown = true;
        this.getOrders();
        break;
      case OrganizationOrderManagementTabs.ReOrders:
        // TODO: pending implementation
        // this.getOrders();
        break;
      case OrganizationOrderManagementTabs.OrderTemplates:
        // TODO: pending implementation
        break;
      case OrganizationOrderManagementTabs.Incomplete:
        this.isLockMenuButtonsShown = false;
        this.store.dispatch(new GetIncompleteOrders({}));
        break;
    }
  }

  public getOrderTypeName(orderType: number): string {
    return OrderTypeName[OrderType[orderType] as OrderTypeName];
  }

  public onOpenCandidateDialog(candidat: OrderManagementChild, order: OrderManagement): void {
    this.selectedCandidat = candidat;
    this.selectedCandidat.selected = {
      order: order.id,
      positionId: candidat.positionId
    };
    const options = this.getDialogNextPreviousOption(order);
    this.store.dispatch(new GetOrderById(order.id, order.organizationId, options));
    this.selectedDataRow = order as any;
    this.openChildDialog.next([order, candidat]);
  }

  private deleteOrder(id: number): void {
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button'
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
        this.router.navigate(['./edit', data.id], { relativeTo: this.route });
        break;
      case MoreMenuType['Duplicate']:
        // TODO: pending implementation
        break;
      case MoreMenuType['Close']:
        // TODO: pending implementation
        break;
      case MoreMenuType['Delete']:
        this.deleteOrder(data.id);
        break;
    }
  }

  private onReloadOrderCandidatesLists(): void {
    this.actions$.pipe(
      ofActionSuccessful(ReloadOrganisationOrderCandidatesLists),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.store.dispatch(new GetAgencyOrderCandidatesList(this.selectedDataRow.id, this.selectedDataRow.organizationId as number, this.currentPage, this.pageSize));
      this.getOrders();
      this.store.dispatch(new GetOrderById(this.selectedDataRow.id, this.selectedDataRow.organizationId as number, this.getDialogNextPreviousOption(this.selectedDataRow as any)));
    });
  }

  private onOrganizationChangedHandler(): void {
    this.organizationId$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.clearFilters();
        if (!this.previousSelectedOrderId) {
          this.getOrders();
        }
        this.store.dispatch(new GetAllOrganizationSkills());
      });
  }

  private onOrdersDataLoadHandler(): void {
    debugger;
    this.ordersPage$.pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
      if (data && data.items) {            
        this.data = data.items;      
        if (this.agGrid.api) {
          this.agGrid.api.setFilterModel(null);
        }
        data.items.forEach(item => {
          // item.isMoreMenuWithDeleteButton = !this.openInProgressFilledStatuses.includes(item.statusText.toLowerCase());
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
      regionIds: { type: ControlTypes.Multiselect, valueType: ValueType.Id, dataSource: [], valueField: 'name', valueId: 'id' },
      locationIds: { type: ControlTypes.Multiselect, valueType: ValueType.Id, dataSource: [], valueField: 'name', valueId: 'id' },
      departmentsIds: { type: ControlTypes.Multiselect, valueType: ValueType.Id, dataSource: [], valueField: 'name', valueId: 'id' },
      skillIds: { type: ControlTypes.Multiselect, valueType: ValueType.Id, dataSource: [], valueField: 'skillDescription', valueId: 'id' },
      orderTypes: { type: ControlTypes.Multiselect, valueType: ValueType.Id, dataSource: OrderTypeOptions, valueField: 'name', valueId: 'id' },
      jobTitle: { type: ControlTypes.Text, valueType: ValueType.Text },
      billRateFrom: { type: ControlTypes.Text, valueType: ValueType.Text },
      billRateTo: { type: ControlTypes.Text, valueType: ValueType.Text },
      openPositions: { type: ControlTypes.Text, valueType: ValueType.Text },
      jobStartDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      jobEndDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      orderStatuses: { type: ControlTypes.Multiselect, valueType: ValueType.Id, dataSource: [], valueField: 'statusText', valueId: 'status' },
      candidateStatuses: { type: ControlTypes.Multiselect, valueType: ValueType.Id, dataSource: [], valueField: 'statusText', valueId: 'status' },
      candidatesCountFrom: { type: ControlTypes.Text, valueType: ValueType.Text },
      candidatesCountTo: { type: ControlTypes.Text, valueType: ValueType.Text },
      agencyIds: { type: ControlTypes.Multiselect, valueType: ValueType.Id, dataSource: [], valueField: 'name', valueId: 'id' },
      agencyType: { type: ControlTypes.Radio, dataSource: { 1: 'Yes', 2: 'No' }, default: '0' },
    }
  }

  private onOrderFilterDataSourcesLoadHandler(): void {
    this.orderFilterDataSources$.pipe(takeUntil(this.unsubscribe$), filter(Boolean)).subscribe((data: OrderFilterDataSource) => {
      this.filterColumns.orderStatuses.dataSource = data.orderStatuses;
      this.filterColumns.agencyIds.dataSource = data.partneredAgencies;
      this.filterColumns.candidateStatuses.dataSource = data.candidateStatuses;
    });
  }

  private onOrderFilterControlValueChangedHandler(): void {
    this.OrderFilterFormGroup.get('regionIds')?.valueChanges.subscribe((val: number[]) => {
      if (val?.length) {
        const selectedRegions: OrganizationRegion[] = [];
        val.forEach(id => selectedRegions.push(this.regions.find(region => region.id === id) as OrganizationRegion));
        this.filterColumns.locationIds.dataSource = [];
        selectedRegions.forEach(region => {
          region.locations?.forEach(location => location.regionName = region.name);
          this.filterColumns.locationIds.dataSource.push(...region.locations as [])
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
        val.forEach(id => selectedLocations.push(this.filterColumns.locationIds.dataSource.find((location: OrganizationLocation) => location.id === id)));
        this.filterColumns.departmentsIds.dataSource = [];
        selectedLocations.forEach(location => {
          this.filterColumns.departmentsIds.dataSource.push(...location.departments as [])
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
        this.gridWithChildRow.clearRowSelection();
      }
    });
  }

  private onSelectedOrderDataLoadHandler(): void {
    this.selectedOrder$.pipe(takeUntil(this.unsubscribe$)).subscribe((order: Order) => {
      this.selectedOrder = order;
    });
  }

  private onSkillDataLoadHandler(): void {
    this.skills$.pipe(takeUntil(this.unsubscribe$)).subscribe(skills => {
      if (skills && skills.length > 0) {
        this.filterColumns.skillIds.dataSource = skills;
      }
    });
  }

  private onOrganizationStructureDataLoadHandler(): void {
    this.organizationStructure$.pipe(takeUntil(this.unsubscribe$), filter(Boolean)).subscribe((structure: OrganizationStructure) => {
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

  private onDeleteOrderSucceededHandler(): void {
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionDispatched(DeleteOrderSucceeded)).subscribe(() => {
      this.gridWithChildRow.clearRowSelection();
      this.getOrders();
      this.openDetails.next(false);
    });
  }
}
