import { ColDef, FilterChangedEvent, GridOptions } from '@ag-grid-community/core';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GetOrderAuditHistory, GetOrderBillRateDetailSucceeded, GetOrderBillRatesAuditHistory, GetOrderClassificationAuditHistory, GetOrderClassificationDetailSucceeded, GetOrderContactAuditHistory, GetOrderContactDetailSucceeded, GetOrderCredentialAuditHistory, GetOrderCredentialDetailSucceeded, GetOrderHistoryDetailSucceeded, GetOrderJobDistributionAuditHistory, GetOrderJobDistributionDetailSucceeded, GetOrderWorkLocationAuditHistory, GetOrderWorkLocationDetailSucceeded } from '@client/store/order-managment-content.actions';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { GlobalWindow } from '@core/tokens';
import { Actions, Select, Store, ofActionDispatched } from '@ngxs/store';
import { OPTION_FIELDS } from '@shared/components/associate-list/constant';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { CustomNoRowsOverlayComponent } from '@shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';
import { GRID_CONFIG } from '@shared/constants';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import { ExportColumn } from '@shared/models/export.model';
import { AuditLogPayload, OrderAuditHistory, OrderBillRateAuditHistory, OrderClassificationAuditHistory, OrderContactAuditHistory, OrderCredentialAuditHistory, OrderJobDistributionAuditHistory, OrderManagement, OrderWorkLocationAuditHistory } from '@shared/models/order-management.model';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Observable, Subject, take, takeUntil, takeWhile } from 'rxjs';
import { DefaultUserGridColDef, SideBarConfig } from 'src/app/security/user-list/user-grid/user-grid.constant';
import { OrderAuditHistoryTableColumnsDefinition, OrderBillRatesAuditHistoryTableColumnsDefinition, OrderClassificationAuditHistoryTableColumnsDefinition, OrderContactAuditHistoryTableColumnsDefinition, OrderCredentialAuditHistoryTableColumnsDefinition, OrderJobDistributionAuditHistoryTableColumnsDefinition, OrderWorkLocationAuditHistoryTableColumnsDefinition } from './order-history-details.constant';
import { orderMatchColorClasses } from '@shared/components/credentials-grid/order-match-column/order-match-column.constants';
import { AppState } from 'src/app/store/app.state';
import { ExpandEventArgs } from '@syncfusion/ej2-angular-navigations';

@Component({
  selector: 'app-order-history-details',
  templateUrl: './order-history-details.component.html',
  styleUrls: ['./order-history-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderHistoryDetailsComponent extends AbstractPermissionGrid implements OnInit, OnDestroy {
  @ViewChild('sideDialog') sideDialog: DialogComponent;
  @Input() order: Subject<OrderManagement>;
  private unsubscribe$: Subject<void> = new Subject();
  public gridApi: any;
  public CredentialAuditGridApi: any;
  public BillRatesAuditGridApi: any;
  public OrderContactAuditHistoryApi: any;
  public OrderWorkLocationAuditHistoryApi: any;
  public OrderJobDistributionAuditHistoryApi: any;
  public OrderClassificationAuditHistoryApi: any;
  private isAlive: boolean = true;
  viewedTab: number[] = [];
  @Select(OrderManagementContentState.getOrderAuditHistoryDetails)
  orderHistoryDetails$: Observable<OrderAuditHistory[]>;

  @Select(OrderManagementContentState.getOrderCredentialAuditHistory)
  OrderCredentialAuditHistory$: Observable<OrderCredentialAuditHistory[]>;

  @Select(OrderManagementContentState.getOrderBillRatesAuditHistory)
  OrderBillRateAuditHistory$: Observable<OrderBillRateAuditHistory[]>;

  @Select(OrderManagementContentState.getOrderContactAuditHistory)
  OrderContactAuditHistory$: Observable<OrderContactAuditHistory[]>;

  @Select(OrderManagementContentState.getOrderWorkLocationAuditHistory)
  OrderWorkLocationAuditHistory$: Observable<OrderWorkLocationAuditHistory[]>;

  @Select(OrderManagementContentState.getOrderJobDistributionAuditHistory)
  OrderJobDistributionAuditHistory$: Observable<OrderJobDistributionAuditHistory[]>;

  @Select(OrderManagementContentState.getOrderClassificationAuditHistory)
  OrderClassificationAuditHistory$: Observable<OrderClassificationAuditHistory[]>;

  @Select(AppState.getMainContentElement)
  public readonly targetElement$: Observable<HTMLElement | null>;
  public targetElement: HTMLElement = document.body;
  public optionFields = OPTION_FIELDS;
  public orderDetail: any;
  OrderAuditHistoryDetails: Array<OrderAuditHistory> = [];
  OrderCredentialAuditHistoryDetails: Array<OrderCredentialAuditHistory> = [];
  OrderBillRatesAuditHistoryDetails: Array<OrderBillRateAuditHistory> = [];
  OrderContactAuditHistoryDetails: Array<OrderContactAuditHistory> = [];
  OrderWorkLocationAuditHistoryDetails: Array<OrderWorkLocationAuditHistory> = [];
  OrderJobDistributionAuditHistoryDetails: Array<OrderJobDistributionAuditHistory> = [];
  OrderClassificationAuditHistoryDetails: Array<OrderClassificationAuditHistory> = [];
  public columnsToExport: ExportColumn[];
  sideBar = SideBarConfig;
  public readonly gridConfig: typeof GRID_CONFIG = GRID_CONFIG;
  public noRowsOverlayComponent: any = CustomNoRowsOverlayComponent;
  public noRowsOverlayComponentParams: any = {
    noRowsMessageFunc: () => 'No Rows To Show',
  };

  public readonly OrdercolumnDefinitions: ColumnDefinitionModel[] = OrderAuditHistoryTableColumnsDefinition();
  public readonly CredentialcolumnDefinitions: ColumnDefinitionModel[] = OrderCredentialAuditHistoryTableColumnsDefinition();
  public readonly BillRatecolumnDefinitions: ColumnDefinitionModel[] = OrderBillRatesAuditHistoryTableColumnsDefinition();
  public readonly ContactcolumnDefinitions: ColumnDefinitionModel[] = OrderContactAuditHistoryTableColumnsDefinition();
  public readonly WorkLocationcolumnDefinitions: ColumnDefinitionModel[] = OrderWorkLocationAuditHistoryTableColumnsDefinition();
  public readonly JobDistributioncolumnDefinitions: ColumnDefinitionModel[] = OrderJobDistributionAuditHistoryTableColumnsDefinition();
  public readonly ClassificationcolumnDefinitions: ColumnDefinitionModel[] = OrderClassificationAuditHistoryTableColumnsDefinition();

  defaultColDef: ColDef = DefaultUserGridColDef;

  constructor(
    private actions$: Actions,
    private datePipe: DatePipe,
    protected override store: Store,
    private _detector: ChangeDetectorRef,
    @Inject(GlobalWindow) protected readonly globalWindow: WindowProxy & typeof globalThis,
  ) {
    super(store);
  }

  public override ngOnInit(): void {
    super.ngOnInit();
    this.onOpenEvent();
  }

  private onOpenEvent(): void {
    this.order.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data?.id > 0) {
        this.gridApi?.setRowData([]);
        this.orderDetail = data;
        this.sideDialog.refresh();
        this.sideDialog.show();
      }
      else {
        this.orderDetail = new OrderManagement;
        this.gridApi.setRowData([]);
        this.sideDialog.hide();
      }
      this._detector.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.sideDialog.hide();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.isAlive = false;
  }

  public onClose(): void {
    this.viewedTab = [];
    this.gridApi?.setRowData([]);
    this.orderDetail = new OrderManagement;
    this.OrderAuditHistoryDetails = [];
    this.OrderCredentialAuditHistoryDetails=[];
    this.OrderBillRatesAuditHistoryDetails=[];
    this.OrderContactAuditHistoryDetails=[];
    this.OrderWorkLocationAuditHistoryDetails=[];
    this.OrderJobDistributionAuditHistoryDetails=[];
    this.OrderClassificationAuditHistoryDetails=[];
    this.sideDialog.hide();
    this.order.next(new OrderManagement);
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridApi.setRowData(this.OrderAuditHistoryDetails);
  }

  public gridOptions: GridOptions = {
    pagination: true,
    cacheBlockSize: this.pageSize,
    paginationPageSize: this.pageSize,
    columnDefs: this.OrdercolumnDefinitions,
    rowData: this.OrderAuditHistoryDetails,
    noRowsOverlayComponent: CustomNoRowsOverlayComponent,
    noRowsOverlayComponentParams: this.noRowsOverlayComponentParams,
    onFilterChanged: (event: FilterChangedEvent) => {
      if (!event.api.getDisplayedRowCount()) {
        this.gridApi?.showNoRowsOverlay();
      }
      else {
        this.gridApi?.hideOverlay();
      }
    }
  };

  public OrderCredentialAuditHistoryGridOptions: GridOptions = {
    pagination: true,
    cacheBlockSize: this.pageSize,
    paginationPageSize: this.pageSize,
    columnDefs: this.CredentialcolumnDefinitions,
    rowData: this.OrderCredentialAuditHistoryDetails,
    noRowsOverlayComponent: CustomNoRowsOverlayComponent,
    noRowsOverlayComponentParams: this.noRowsOverlayComponentParams,
    onFilterChanged: (event: FilterChangedEvent) => {
      if (!event.api.getDisplayedRowCount()) {
        this.OrderContactAuditHistoryApi?.showNoRowsOverlay();
      }
      else {
        this.OrderContactAuditHistoryApi?.hideOverlay();
      }
    }
  };

  onCredentialAuditGridReady(params: any) {
    this.CredentialAuditGridApi = params.api;
    this.CredentialAuditGridApi.setRowData(this.OrderCredentialAuditHistoryDetails);
  }

  public OrderBillRatesAuditHistoryGridOptions: GridOptions = {
    pagination: true,
    cacheBlockSize: this.pageSize,
    paginationPageSize: this.pageSize,
    columnDefs: this.BillRatecolumnDefinitions,
    rowData: this.OrderBillRatesAuditHistoryDetails,
    noRowsOverlayComponent: CustomNoRowsOverlayComponent,
    noRowsOverlayComponentParams: this.noRowsOverlayComponentParams,
    onFilterChanged: (event: FilterChangedEvent) => {
      if (!event.api.getDisplayedRowCount()) {
        this.BillRatesAuditGridApi?.showNoRowsOverlay();
      }
      else {
        this.BillRatesAuditGridApi?.hideOverlay();
      }
    }
  };

  onBillRatesAuditGridReady(params: any) {
    this.BillRatesAuditGridApi = params.api;
    this.BillRatesAuditGridApi.setRowData(this.OrderBillRatesAuditHistoryDetails);
  }

  public OrderContactAuditHistoryDetailsGridOptions: GridOptions = {
    pagination: true,
    cacheBlockSize: this.pageSize,
    paginationPageSize: this.pageSize,
    columnDefs: this.ContactcolumnDefinitions,
    rowData: this.OrderContactAuditHistoryDetails,
    noRowsOverlayComponent: CustomNoRowsOverlayComponent,
    noRowsOverlayComponentParams: this.noRowsOverlayComponentParams,
    onFilterChanged: (event: FilterChangedEvent) => {
      if (!event.api.getDisplayedRowCount()) {
        this.gridApi?.showNoRowsOverlay();
      }
      else {
        this.gridApi?.hideOverlay();
      }
    }
  };

  onOrderContactAuditGridReady(params: any) {
    this.OrderContactAuditHistoryApi = params.api;
    this.OrderContactAuditHistoryApi.setRowData(this.OrderContactAuditHistoryDetails);
  }

  public OrderWorkLocationDetailsGridOptions: GridOptions = {
    pagination: true,
    cacheBlockSize: this.pageSize,
    paginationPageSize: this.pageSize,
    columnDefs: this.WorkLocationcolumnDefinitions,
    rowData: this.OrderWorkLocationAuditHistoryDetails,
    noRowsOverlayComponent: CustomNoRowsOverlayComponent,
    noRowsOverlayComponentParams: this.noRowsOverlayComponentParams,
    onFilterChanged: (event: FilterChangedEvent) => {
      if (!event.api.getDisplayedRowCount()) {
        this.gridApi?.showNoRowsOverlay();
      }
      else {
        this.gridApi?.hideOverlay();
      }
    }
  };

  onOrderWorkLocationAuditGridReady(params: any) {
    this.OrderWorkLocationAuditHistoryApi = params.api;
    this.OrderWorkLocationAuditHistoryApi.setRowData(this.OrderWorkLocationAuditHistoryDetails);
  }


  public OrderJobDistributionDetailsGridOptions: GridOptions = {
    pagination: true,
    cacheBlockSize: this.pageSize,
    paginationPageSize: this.pageSize,
    columnDefs: this.JobDistributioncolumnDefinitions,
    rowData: this.OrderJobDistributionAuditHistoryDetails,
    noRowsOverlayComponent: CustomNoRowsOverlayComponent,
    noRowsOverlayComponentParams: this.noRowsOverlayComponentParams,
    onFilterChanged: (event: FilterChangedEvent) => {
      if (!event.api.getDisplayedRowCount()) {
        this.OrderJobDistributionAuditHistoryApi?.showNoRowsOverlay();
      }
      else {
        this.OrderJobDistributionAuditHistoryApi?.hideOverlay();
      }
    }
  };

  onOrderJobDistributionAuditGridReady(params: any) {
    this.OrderJobDistributionAuditHistoryApi = params.api;
    this.OrderJobDistributionAuditHistoryApi.setRowData(this.OrderJobDistributionAuditHistoryDetails);
  }

  public OrderClassificationDetailsGridOptions: GridOptions = {
    pagination: true,
    cacheBlockSize: this.pageSize,
    paginationPageSize: this.pageSize,
    columnDefs: this.ClassificationcolumnDefinitions,
    rowData: this.OrderClassificationAuditHistoryDetails,
    noRowsOverlayComponent: CustomNoRowsOverlayComponent,
    noRowsOverlayComponentParams: this.noRowsOverlayComponentParams,
    onFilterChanged: (event: FilterChangedEvent) => {
      if (!event.api.getDisplayedRowCount()) {
        this.OrderClassificationAuditHistoryApi?.showNoRowsOverlay();
      }
      else {
        this.OrderClassificationAuditHistoryApi?.hideOverlay();
      }
    }
  };

  onOrderClassificationAuditGridReady(params: any) {
    this.OrderClassificationAuditHistoryApi = params.api;
    this.OrderClassificationAuditHistoryApi.setRowData(this.OrderClassificationAuditHistoryDetails);
  }

  public expanding(e: ExpandEventArgs) {
    const expandData: ExpandEventArgs = e;
    switch (e.index) {
      case 0:
        if (e.isExpanded && this.orderDetail?.id > 0) {
          if (!this.viewedTab.some(a => a == e.index)) {
            this.store.dispatch(new GetOrderAuditHistory({ entityType: "Einstein.CoreApplication.Domain.Entities.Order.Order", searchValue: this.orderDetail.id.toString() }));
            this.actions$.pipe(ofActionDispatched(GetOrderHistoryDetailSucceeded), take(1))
              .subscribe(() => {
                this.viewedTab.push(expandData?.index!);
                this.orderHistoryDetails$.pipe(takeUntil(this.unsubscribe$)).subscribe((order) => {
                  this.OrderAuditHistoryDetails = order;
                  this.gridApi?.setRowData(this.OrderAuditHistoryDetails);
                });
              });
          } else {
            this.orderHistoryDetails$.pipe(takeUntil(this.unsubscribe$)).subscribe((order) => {
              this.OrderAuditHistoryDetails = order;
              this.gridApi?.setRowData(this.OrderAuditHistoryDetails);
            });
          }
        }
        break;
      case 1:
        if (e.isExpanded) {
          if (!this.viewedTab.some(a => a == e.index)) {
            this.store.dispatch(new GetOrderCredentialAuditHistory({ entityType: "Einstein.CoreApplication.Domain.Entities.Order.OrderCredential", searchValue: this.orderDetail.id.toString() }));
            this.actions$.pipe(ofActionDispatched(GetOrderCredentialDetailSucceeded), take(1))
              .subscribe(() => {
                this.viewedTab.push(expandData?.index!);
                this.OrderCredentialAuditHistory$.pipe(takeUntil(this.unsubscribe$)).subscribe((order) => {
                  this.OrderCredentialAuditHistoryDetails = order;
                  if (this.OrderCredentialAuditHistoryDetails?.length > 0)
                    this.CredentialAuditGridApi?.setRowData(this.OrderCredentialAuditHistoryDetails);
                });
              });
          }
          else {
            this.OrderCredentialAuditHistory$.pipe(takeUntil(this.unsubscribe$)).subscribe((order) => {
              this.OrderCredentialAuditHistoryDetails = order;
              if (this.OrderCredentialAuditHistoryDetails?.length > 0)
                this.CredentialAuditGridApi?.setRowData(this.OrderCredentialAuditHistoryDetails);
            });
          }
        }
        break;
      case 2:
        if (e.isExpanded) {
          if (!this.viewedTab.some(a => a == e.index)) {
            this.store.dispatch(new GetOrderBillRatesAuditHistory({ entityType: "Einstein.CoreApplication.Domain.Entities.BillRates.BillRate", searchValue: this.orderDetail.id.toString() }));
            this.actions$.pipe(ofActionDispatched(GetOrderBillRateDetailSucceeded), take(1))
              .subscribe(() => {
                this.viewedTab.push(expandData?.index!);
                this.OrderBillRateAuditHistory$.pipe(takeUntil(this.unsubscribe$)).subscribe((order) => {
                  this.OrderBillRatesAuditHistoryDetails = order;
                  if (this.OrderBillRatesAuditHistoryDetails?.length > 0)
                    this.BillRatesAuditGridApi?.setRowData(this.OrderBillRatesAuditHistoryDetails);
                });
              });
          }
          else {
            this.OrderBillRateAuditHistory$.pipe(takeUntil(this.unsubscribe$)).subscribe((order) => {
              this.OrderBillRatesAuditHistoryDetails = order;
              if (this.OrderBillRatesAuditHistoryDetails?.length > 0)
                this.BillRatesAuditGridApi?.setRowData(this.OrderBillRatesAuditHistoryDetails);
            });
          }
        }
        break;
      case 3:
        if (e.isExpanded) {
          if (!this.viewedTab.some(a => a == e.index)) {
            this.store.dispatch(new GetOrderContactAuditHistory({ entityType: "Einstein.CoreApplication.Domain.Entities.Order.OrderContactDetails", searchValue: this.orderDetail.id.toString() }));
            this.actions$.pipe(ofActionDispatched(GetOrderContactDetailSucceeded), take(1))
              .subscribe(() => {
                this.viewedTab.push(expandData?.index!);
                this.OrderContactAuditHistory$.pipe(takeUntil(this.unsubscribe$)).subscribe((order) => {
                  this.OrderContactAuditHistoryDetails = order;
                  if (this.OrderContactAuditHistoryDetails?.length > 0)
                    this.OrderContactAuditHistoryApi?.setRowData(this.OrderContactAuditHistoryDetails);
                });
              });
          }
          else {
            this.OrderContactAuditHistory$.pipe(takeUntil(this.unsubscribe$)).subscribe((order) => {
              this.OrderContactAuditHistoryDetails = order;
              if (this.OrderContactAuditHistoryDetails?.length > 0)
                this.OrderContactAuditHistoryApi?.setRowData(this.OrderContactAuditHistoryDetails);
            });
          }
        }
        break;
      case 4:
        if (e.isExpanded) {
          if (!this.viewedTab.some(a => a == e.index)) {
            this.store.dispatch(new GetOrderWorkLocationAuditHistory({ entityType: "Einstein.CoreApplication.Domain.Entities.Order.OrderWorkLocation", searchValue: this.orderDetail.id.toString() }));
            this.actions$.pipe(ofActionDispatched(GetOrderWorkLocationDetailSucceeded), take(1))
              .subscribe(() => {
                this.viewedTab.push(expandData?.index!);
                this.OrderWorkLocationAuditHistory$.pipe(takeUntil(this.unsubscribe$)).subscribe((order) => {
                  this.OrderWorkLocationAuditHistoryDetails = order;
                  if (this.OrderWorkLocationAuditHistoryDetails?.length > 0)
                    this.OrderWorkLocationAuditHistoryApi?.setRowData(this.OrderWorkLocationAuditHistoryDetails);
                });
              });
          }
          else {
            this.OrderWorkLocationAuditHistory$.pipe(takeUntil(this.unsubscribe$)).subscribe((order) => {
              this.OrderWorkLocationAuditHistoryDetails = order;
              if (this.OrderWorkLocationAuditHistoryDetails?.length > 0)
                this.OrderWorkLocationAuditHistoryApi?.setRowData(this.OrderWorkLocationAuditHistoryDetails);
            });
          }
        }
        break;
      case 5:
        if (e.isExpanded) {
          if (!this.viewedTab.some(a => a == e.index)) {
            this.store.dispatch(new GetOrderJobDistributionAuditHistory({ entityType: "Einstein.CoreApplication.Domain.Entities.Order.OrderJobDistribution", searchValue: this.orderDetail.id.toString() }));
            this.actions$.pipe(ofActionDispatched(GetOrderJobDistributionDetailSucceeded), take(1))
              .subscribe(() => {
                this.viewedTab.push(expandData?.index!);
                this.OrderJobDistributionAuditHistory$.pipe(takeUntil(this.unsubscribe$)).subscribe((order) => {
                  this.OrderJobDistributionAuditHistoryDetails = order;
                  if (this.OrderWorkLocationAuditHistoryDetails?.length > 0)
                    this.OrderJobDistributionAuditHistoryApi?.setRowData(this.OrderJobDistributionAuditHistoryDetails);
                });
              });
          } else {
            this.OrderJobDistributionAuditHistory$.pipe(takeUntil(this.unsubscribe$)).subscribe((order) => {
              this.OrderJobDistributionAuditHistoryDetails = order;
              if (this.OrderWorkLocationAuditHistoryDetails?.length > 0)
                this.OrderJobDistributionAuditHistoryApi?.setRowData(this.OrderJobDistributionAuditHistoryDetails);
            });
          }
        }
        break;
      case 6:
        if (e.isExpanded) {
          if (!this.viewedTab.some(a => a == e.index)) {
            this.store.dispatch(new GetOrderClassificationAuditHistory({ entityType: "Einstein.CoreApplication.Domain.Entities.Order.OrderClassification", searchValue: this.orderDetail.id.toString() }));
            this.actions$.pipe(ofActionDispatched(GetOrderClassificationDetailSucceeded), take(1))
              .subscribe(() => {
                this.viewedTab.push(expandData?.index!);
                this.OrderClassificationAuditHistory$.pipe(takeUntil(this.unsubscribe$)).subscribe((order) => {
                  this.OrderClassificationAuditHistoryDetails = order;
                  if (this.OrderClassificationAuditHistoryDetails?.length > 0)
                    this.OrderClassificationAuditHistoryApi?.setRowData(this.OrderClassificationAuditHistoryDetails);
                });
              });
          } else {
            this.OrderClassificationAuditHistory$.pipe(takeUntil(this.unsubscribe$)).subscribe((order) => {
              this.OrderClassificationAuditHistoryDetails = order;
              if (this.OrderClassificationAuditHistoryDetails?.length > 0)
                this.OrderClassificationAuditHistoryApi?.setRowData(this.OrderClassificationAuditHistoryDetails);
            });
          }
        }
        break;
    }
  }
}