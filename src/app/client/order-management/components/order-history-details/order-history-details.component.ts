import { ColDef, FilterChangedEvent, GridOptions } from '@ag-grid-community/core';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GetOrderBillRatesAuditHistory, GetOrderClassificationAuditHistory, GetOrderContactAuditHistory, GetOrderCredentialAuditHistory, GetOrderJobDistributionAuditHistory, GetOrderWorkLocationAuditHistory } from '@client/store/order-managment-content.actions';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { GlobalWindow } from '@core/tokens';
import { Actions, Select, Store } from '@ngxs/store';
import { OPTION_FIELDS } from '@shared/components/associate-list/constant';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { CustomNoRowsOverlayComponent } from '@shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';
import { GRID_CONFIG } from '@shared/constants';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import { ExportColumn } from '@shared/models/export.model';
import { AuditLogPayload, OrderAuditHistory, OrderBillRateAuditHistory, OrderClassificationAuditHistory, OrderContactAuditHistory, OrderCredentialAuditHistory, OrderJobDistributionAuditHistory, OrderManagement, OrderWorkLocationAuditHistory } from '@shared/models/order-management.model';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { DefaultUserGridColDef, SideBarConfig } from 'src/app/security/user-list/user-grid/user-grid.constant';
import { OrderAuditHistoryTableColumnsDefinition, OrderBillRatesAuditHistoryTableColumnsDefinition, OrderClassificationAuditHistoryTableColumnsDefinition, OrderContactAuditHistoryTableColumnsDefinition, OrderCredentialAuditHistoryTableColumnsDefinition, OrderJobDistributionAuditHistoryTableColumnsDefinition, OrderWorkLocationAuditHistoryTableColumnsDefinition } from './order-history-details.constant';
import { orderMatchColorClasses } from '@shared/components/credentials-grid/order-match-column/order-match-column.constants';

@Component({
  selector: 'app-order-history-details',
  templateUrl: './order-history-details.component.html',
  styleUrls: ['./order-history-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
  export class OrderHistoryDetailsComponent extends AbstractPermissionGrid implements OnInit,OnDestroy {
  @ViewChild('sideDialog') sideDialog: DialogComponent; 
  @Input() order: Subject<OrderManagement>;
  private unsubscribe$: Subject<void> = new Subject();
  public gridApi: any;
  public CredentialAuditGridApi:any;
  public BillRatesAuditGridApi:any;
  public OrderContactAuditHistoryApi:any;
  public OrderWorkLocationAuditHistoryApi:any;
  public OrderJobDistributionAuditHistoryApi:any;
  public OrderClassificationAuditHistoryApi:any;
  private isAlive: boolean = true;
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

  public readonly targetElement$: Observable<HTMLElement | null>;
  public targetElement: HTMLElement = document.body;
  public optionFields = OPTION_FIELDS;
  public orderDetail:any;
  OrderAuditHistoryDetails: Array<OrderAuditHistory> = [];
  OrderCredentialAuditHistoryDetails:Array<OrderCredentialAuditHistory>=[];
  OrderBillRatesAuditHistoryDetails:Array<OrderBillRateAuditHistory>=[];
  OrderContactAuditHistoryDetails:Array<OrderContactAuditHistory>=[];
  OrderWorkLocationAuditHistoryDetails:Array<OrderWorkLocationAuditHistory>=[];
  OrderJobDistributionAuditHistoryDetails:Array<OrderJobDistributionAuditHistory>=[];
  OrderClassificationAuditHistoryDetails:Array<OrderClassificationAuditHistory>=[];
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
  public readonly JobDistributioncolumnDefinitions:ColumnDefinitionModel[]=OrderJobDistributionAuditHistoryTableColumnsDefinition();
  public readonly ClassificationcolumnDefinitions:ColumnDefinitionModel[]=OrderClassificationAuditHistoryTableColumnsDefinition();
  
  defaultColDef: ColDef = DefaultUserGridColDef; 

  constructor(
    private actions$: Actions,
    private datePipe: DatePipe,
    protected override store: Store,
    private _detector: ChangeDetectorRef ,
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
      if(data?.id>0){       
        this.orderDetail=data;     
        this.sideDialog.refresh();
        this.orderHistoryDetails$.pipe(takeUntil(this.unsubscribe$)).subscribe((state) => {   
          this.OrderAuditHistoryDetails=state;             
          this.gridApi.setRowData(this.OrderAuditHistoryDetails);           
          
          this.store.dispatch([
            new GetOrderCredentialAuditHistory({           
            entityType: "OrderCredential",
            searchValue:data.id.toString()
          }),
          new GetOrderBillRatesAuditHistory({           
            entityType: "BillRate",
            searchValue:data.id.toString()
          }),
          new GetOrderContactAuditHistory({           
            entityType: "OrderContactDetails",
            searchValue:data.id.toString()
          }),
          new GetOrderWorkLocationAuditHistory({           
            entityType: "OrderWorkLocation",
            searchValue:data.toString()
          }),
          new GetOrderJobDistributionAuditHistory({           
            entityType: "OrderJobDistribution",
            searchValue:data.id.toString()
          }),
          new GetOrderClassificationAuditHistory({           
            entityType: "OrderClassification",
            searchValue:data.id.toString()
          })        
        ]);

          this.OrderCredentialAuditHistory$.pipe(takeUntil(this.unsubscribe$)).subscribe((order) => {            
            this.OrderCredentialAuditHistoryDetails=order;   
            console.log(this.OrderCredentialAuditHistoryDetails)    
            if(this.OrderCredentialAuditHistoryDetails.length>0)      
                this.CredentialAuditGridApi.setRowData(this.OrderCredentialAuditHistoryDetails);             
          });         
          
          this.OrderBillRateAuditHistory$.pipe(takeUntil(this.unsubscribe$)).subscribe((order) => {
            this.OrderBillRatesAuditHistoryDetails=order;  
            if(this.OrderBillRatesAuditHistoryDetails.length>0)             
            this.BillRatesAuditGridApi.setRowData(this.OrderBillRatesAuditHistoryDetails);  
          });
          
          this.OrderContactAuditHistory$.pipe(takeUntil(this.unsubscribe$)).subscribe((order) => {
            this.OrderContactAuditHistoryDetails=order;  
            if(this.OrderContactAuditHistoryDetails.length>0)             
            this.OrderContactAuditHistoryApi.setRowData(this.OrderContactAuditHistoryDetails);  
          });

          this.OrderWorkLocationAuditHistory$.pipe(takeUntil(this.unsubscribe$)).subscribe((order) => {
            this.OrderWorkLocationAuditHistoryDetails=order;  
            if(this.OrderWorkLocationAuditHistoryDetails.length>0)             
            this.OrderWorkLocationAuditHistoryApi.setRowData(this.OrderWorkLocationAuditHistoryDetails);  
          });

          this.OrderJobDistributionAuditHistory$.pipe(takeUntil(this.unsubscribe$)).subscribe((order) => {
            this.OrderJobDistributionAuditHistoryDetails=order;  
            if(this.OrderWorkLocationAuditHistoryDetails.length>0)             
            this.OrderJobDistributionAuditHistoryApi.setRowData(this.OrderJobDistributionAuditHistoryDetails);  
          });

          this.OrderClassificationAuditHistory$.pipe(takeUntil(this.unsubscribe$)).subscribe((order) => {
            this.OrderClassificationAuditHistoryDetails=order;  
            if(this.OrderClassificationAuditHistoryDetails.length>0)             
            this.OrderJobDistributionAuditHistoryApi.setRowData(this.OrderClassificationAuditHistoryDetails);  
          });
          this.sideDialog.show();  
        });  
      }    
      else{
        this.orderDetail=new OrderManagement;
        this.gridApi.setRowData([]); 
        this.sideDialog.hide(); 
      }
      this._detector.detectChanges(); 
    });
    this.actions$.pipe(takeWhile(() => this.isAlive));
  }

  ngOnDestroy(): void {
    this.sideDialog.hide();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.isAlive=false;
  }   
 
  public onClose(): void {     
    this.orderDetail=new OrderManagement; 
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
}