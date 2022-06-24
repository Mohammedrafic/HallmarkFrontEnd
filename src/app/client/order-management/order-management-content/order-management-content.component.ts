import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, ofActionDispatched, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { DetailRowService, FreezeService, GridComponent } from '@syncfusion/ej2-angular-grids';
import { filter, Observable, Subject, takeUntil, throttleTime } from 'rxjs';
import { SetHeaderState, ShowFilterDialog } from 'src/app/store/app.actions';
import { ORDERS_GRID_CONFIG } from '../../client.config';
import { SelectionSettingsModel, TextWrapSettingsModel } from '@syncfusion/ej2-grids/src/grid/base/grid-model';
import { STATUS_COLOR_GROUP } from 'src/app/shared/enums/status';
import { OrderManagemetTabs } from '@client/order-management/order-management-content/tab-navigation/tab-navigation.component';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import {
  ApproveOrder,
  DeleteOrder,
  DeleteOrderSucceeded,
  GetAgencyOrderCandidatesList,
  GetIncompleteOrders,
  GetOrderById,
  GetOrders,
  ReloadOrganisationOrderCandidatesLists
} from '@client/store/order-managment-content.actions';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { OrderManagementChild, Order, OrderFilter, OrderManagement, OrderManagementPage } from '@shared/models/order-management.model';

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

export const ROW_HEIGHT = {
  SCALE_UP_HEIGHT: 140,
  SCALE_DOWN_HEIGHT: 64
}

export enum MoreMenuType {
  'Edit',
  'Duplicate',
  'Close',
  'Delete'
}

@Component({
  selector: 'app-order-management-content',
  templateUrl: './order-management-content.component.html',
  styleUrls: ['./order-management-content.component.scss'],
  providers: [FreezeService, DetailRowService],
})
export class OrderManagementContentComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('grid') override gridWithChildRow: GridComponent;

  @Select(OrderManagementContentState.ordersPage)
  ordersPage$: Observable<OrderManagementPage>;

  @Select(OrderManagementContentState.selectedOrder)
  selectedOrder$: Observable<Order>;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  @Select(UserState.organizationStructure)
  organizationStructure$: Observable<OrganizationStructure>;

  @Select(OrganizationManagementState.allOrganizationSkills)
  skills$: Observable<Skill[]>;

  public activeTab: OrderManagemetTabs = OrderManagemetTabs.AllOrders;
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
      jobEndDate: new FormControl(null)
    });
  }

  ngOnInit(): void {
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
    }
    this.organizationStructure$.pipe(takeUntil(this.unsubscribe$), filter(Boolean)).subscribe((structure: OrganizationStructure) => {
      this.orgStructure = structure;
      this.regions = structure.regions;
      this.filterColumns.regionIds.dataSource = this.regions;
    });
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionDispatched(DeleteOrderSucceeded)).subscribe(() => {
      this.gridWithChildRow.clearRowSelection();
      this.getOrders();
      this.openDetails.next(false);
    });

    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(ApproveOrder)).subscribe(() => {
      const [index] = this.gridWithChildRow.getSelectedRowIndexes();
      this.selectedIndex = index;
      this.getOrders();
    });

    this.selectedOrder$.pipe(takeUntil(this.unsubscribe$)).subscribe((order: Order) => {
      this.selectedOrder = order;
    });

    const locationState = this.location.getState() as { orderId: number };
    this.previousSelectedOrderId = locationState.orderId;

    this.organizationId$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        if (!this.previousSelectedOrderId) {
          this.getOrders();
        }
        this.store.dispatch(new GetAllOrganizationSkills());
      });

    this.pageSubject.pipe(takeUntil(this.unsubscribe$), throttleTime(100)).subscribe((page) => {
      this.currentPage = page;
      this.getOrders();
    });

    this.ordersPage$.pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
      if (data && data.items) {
        data.items.forEach(item => {
          item.isMoreMenuWithDeleteButton = !this.openInProgressFilledStatuses.includes(item.statusText.toLowerCase());
        });
      }
    });

    this.openDetails.pipe(takeUntil(this.unsubscribe$)).subscribe((isOpen) => {
      if (!isOpen) {
        this.gridWithChildRow.clearRowSelection();
      }
    });

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
    this.skills$.pipe(takeUntil(this.unsubscribe$)).subscribe(skills => {
      if (skills && skills.length > 0) {
        this.filterColumns.skillIds.dataSource = skills;
      }
    });

    this.onReloadOrderCandidatesLists();
    this.onChildDialogChange();
  }

  ngOnDestroy(): void {
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
    this.pageSize = this.pageSize;
    if (this.activeTab === OrderManagemetTabs.AllOrders) {
      this.store.dispatch(new GetOrders(this.filters));
    } else if (this.activeTab === OrderManagemetTabs.Incomplete) {
      this.store.dispatch(new GetIncompleteOrders({ pageNumber: this.currentPage, pageSize: this.pageSize }));
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
    });
    this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns, this.datePipe);
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.OrderFilterFormGroup, this.filterColumns);
  }

  public onFilterClearAll(): void {
    this.OrderFilterFormGroup.reset();
    this.filteredItems = [];
    this.currentPage = 1;
    this.filters = {};
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

  public tabSelected(tabIndex: OrderManagemetTabs): void {
    this.activeTab = tabIndex;
    switch (tabIndex) {
      case OrderManagemetTabs.AllOrders:
        this.currentPage = 1;
        this.isLockMenuButtonsShown = true;
        this.getOrders();
        break;
      case OrderManagemetTabs.OrderTemplates:
        // TODO: pending implementation
        break;
      case OrderManagemetTabs.Incomplete:
        this.currentPage = 1;
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
}

export enum OrderTypeName {
  ContractToPerm = 'ContractToPerm',
  OpenPerDiem = 'OpenPerDiem',
  PermPlacement = 'PermPlacement',
  Traveler = 'Traveler'
}

export enum OrderType {
  ContractToPerm = 0,
  OpenPerDiem = 1,
  PermPlacement = 2,
  Traveler = 3
}
