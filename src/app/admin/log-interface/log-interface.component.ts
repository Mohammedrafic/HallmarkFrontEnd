import { ColDef, FilterChangedEvent, GridOptions, ICellRendererParams } from '@ag-grid-community/core';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { DefaultUserGridColDef, SideBarConfig } from 'src/app/security/user-list/user-grid/user-grid.constant';
import { AppState } from 'src/app/store/app.state';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ButtonRendererComponent } from '@shared/components/button/button-renderer/button-renderer.component';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { CustomNoRowsOverlayComponent } from '@shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';
import { GRID_CONFIG } from '@shared/constants';
import { GetLogHistoryById, GetLogInterfacePage } from 'src/app/security/store/security.actions';
import { SecurityState } from 'src/app/security/store/security.state';
import { LogInterface, LogInterfacePage } from '@shared/models/org-interface.model';
import { SetHeaderState } from 'src/app/store/app.actions';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-log-interface',
  templateUrl: './log-interface.component.html',
  styleUrls: ['./log-interface.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogInterfaceComponent extends AbstractGridConfigurationComponent implements OnInit {

  @Select(SecurityState.logInterfaceGridData)
  private _logInterfaceData$: Observable<LogInterface[]>;

  @Select(SecurityState.logInterfacePage)
  public logInterfacePage$: Observable<LogInterfacePage>;

  @Select(AppState.isDarkTheme)
  isDarkTheme$: Observable<boolean>;


  public totalRecordsCount: number;
  public gridApi: any;
  private gridColumnApi: any;
  defaultColDef: ColDef = DefaultUserGridColDef;
  modules: any[] = [ServerSideRowModelModule, RowGroupingModule];
  cacheBlockSize: any;
  rowModelType: any;
  frameworkComponents: any;
  serverSideStoreType: any;
  serverSideInfiniteScroll: any;
  serverSideFilterOnServer: any;
  pagination: boolean;
  paginationPageSize: number;
  maxBlocksInCache: any;
  sideBar = SideBarConfig;
  itemList: Array<LogInterface>= [];
  selectedLogItem: LogInterface;
  openLogDetailsDialogue = new Subject<boolean>();

  public readonly gridConfig: typeof GRID_CONFIG = GRID_CONFIG;

  public noRowsOverlayComponent: any = CustomNoRowsOverlayComponent;
  public noRowsOverlayComponentParams: any = {
    noRowsMessageFunc: () => 'No Rows To Show',
  };
  public rowData: LogInterfacePage[]=[];
  public readonly columnDefs: ColumnDefinitionModel[] = [
    {
      field: 'id',
      hide: true,
      filter: false,
    },
    {
      headerName: 'View',
      cellRenderer: ButtonRendererComponent,
      minWidth: 50,
      cellRendererParams: {
        onClick: this.onEdit.bind(this),
        label: 'View Errors',
        suppressMovable: true,
        filter: false,
        sortable: false,
        menuTabs: []
      }, 
      sortable: true,
      resizable: true    
    },   
    {
      headerName: 'configurationId',
      field: 'configurationId',
      minWidth: 250,
      hide: true,
      filter: false,
    },
    {
      headerName: 'organizationId',
      field: 'organizationId',
      minWidth: 100,
      hide: true,
      filter: false,
    },
    {
      headerName: 'runId',
      field: 'runId',
      minWidth: 350,
      hide: true,
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'File Name',
      field: 'originalFileName',
      minWidth: 250,
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
    },
    {
      headerName: 'Processed Date',
      field: 'processDate',
      minWidth: 175,
      filter: 'agDateColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
        comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
          if (cellValue == null) {
            return 0;
          }
          const dateAsString = this.datePipe?.transform(cellValue, 'MM/dd/yyyy') as string
          const dateParts = dateAsString.split('/');
          const year = Number(dateParts[2]);
          const month = Number(dateParts[0]) - 1;
          const day = Number(dateParts[1]);

          const cellDate = new Date(year, month, day);
          if (cellDate < filterLocalDateAtMidnight) {
            return -1;
          } else if (cellDate > filterLocalDateAtMidnight) {
            return 1;
          }
          return 0;
        },
        inRangeFloatingFilterDateFormat: 'DD MMM YYYY'
      },
      cellRenderer: (params: ICellRendererParams) => {
        const str = this.datePipe?.transform(params.data.processDate, 'MM/dd/yyyy') as string
        return str?.length > 0 ? str : "";
      },
      sortable: true,
      resizable: true
    },
    {
      headerName: 'Status',
      field: 'status',
      minWidth: 250,
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
    },
    {
      headerName: 'Total Count',
      field: 'totalRows',
      minWidth: 175,
      filter: false,
      sortable: false,
    },
    {
      headerName: 'Inserted Record Count',
      field: 'insertedRecord',
      minWidth: 175,
      filter: false,
    },
    {
      headerName: 'Updated Record Count',
      field: 'updatedRecord',
      minWidth: 175,
      filter: false,
      sortable: false,
    },
    {
      headerName: 'Error Record Count',
      field: 'failedRecord',
      minWidth: 175,
      filter: false,
      sortable: false,
      cellStyle: (params:any) => {
        return {color: 'red'};
      }
    },
    {
      headerName: 'Skipped Records',
      field: 'skippedRecord',
      minWidth: 175,
      filter: false,
      sortable: false,
    },    
  ];

  constructor(private store: Store,private datePipe: DatePipe) {
    super();
    this.store.dispatch(new SetHeaderState({ title: 'Interface Log Summary', iconName: 'file-text' }));
  
   }

  ngOnInit(): void {
          this.store.dispatch(new GetLogInterfacePage(JSON.parse((localStorage.getItem('lastSelectedOrganizationId') || '0'))  as number,this.currentPage,this.pageSize));
          this.logInterfacePage$.pipe().subscribe((data: any) => {
            if (!data || !data?.items.length) {
              this.gridApi?.showNoRowsOverlay();
            }
            else {
              this.gridApi?.hideOverlay();
              this.rowData = data.items;
              this.gridApi?.setRowData(this.rowData);
            }
            this.itemList = data?.items;
            this.totalRecordsCount = data?.totalCount;          

          });
  }

  public gridOptions: GridOptions = {
    pagination: true,
    cacheBlockSize: this.pageSize,
    paginationPageSize: this.pageSize,
    columnDefs: this.columnDefs,
    rowData: this.itemList,
    sideBar: this.sideBar,
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
  
  public onEdit(data: any): void {
    this.selectedLogItem = data.rowData;
    this.openLogDetailsDialogue.next(true);
    const options = this.getDialogNextPreviousOption(data.rowData);
    // this.store.dispatch(new GetLogHistoryById("d2874d41-874d-4400-be4d-d2919f366dee",2,this.currentPage,this.pageSize, options));
     this.store.dispatch(new GetLogHistoryById(data.rowData.runId, data.rowData.organizationId,this.currentPage,this.pageSize, options));
  }

  private getDialogNextPreviousOption(selectedOrder: LogInterface): DialogNextPreviousOption {
    const gridData = this.itemList as LogInterface[];
    const first = gridData[0];
    const last = gridData[gridData.length - 1];
    return {
      previous: first.runId !== selectedOrder.runId,
      next: last.runId !== selectedOrder.runId,
    };
  }

  public onNextPreviousLogEvent(next: any): void {
    if(this.itemList != null && this.itemList?.length > 0){
      const index =  this.itemList.findIndex(ele=> ele.runId === this.selectedLogItem.runId) 
      const nextIndex = next ? index + 1 : index - 1;
      this.selectedLogItem = this.itemList[nextIndex];
      this.openLogDetailsDialogue.next(true);
      const options = this.getDialogNextPreviousOption(this.itemList[nextIndex]);
      // this.store.dispatch(new GetLogHistoryById("d2874d41-874d-4400-be4d-d2919f366dee",2,this.currentPage,this.pageSize, options));
      this.store.dispatch(new GetLogHistoryById(this.itemList[nextIndex].runId, this.itemList[nextIndex].organizationId,this.currentPage,this.pageSize, options));
    }
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridApi.setRowData(this.rowData);
  }

  createServerSideDatasource() {
    let self = this;
    return {
      getRows: function (params: any) {
        setTimeout(() => {
          self.gridApi.hideOverlay();
          let postData = {
            pageNumber: params.request.endRow / self.paginationPageSize,
            pageSize: self.paginationPageSize,
          };
          self.dispatchNewPage(postData);
          self.logInterfacePage$.pipe().subscribe((data: any) => {
            self.itemList = data?.items;
            self.totalRecordsCount = data?.totalCount;
            
            if (!self.itemList || !self.itemList.length) {
              self.gridApi.showNoRowsOverlay();
            } else {
              self.gridApi.hideOverlay();
            }
            params.successCallback(self.itemList, data?.totalCount || 1);
          });
        }, 500);
      },
    };
  }
  
  public dispatchNewPage(postData:any): void {
    this.store.dispatch(new GetLogInterfacePage(JSON.parse((localStorage.getItem('lastSelectedOrganizationId') || '0'))  as number,postData.currentPage,postData.pageSize));
  }

  onPageSizeChanged(event: any) {
    this.cacheBlockSize = Number(event.value.toLowerCase().replace('rows', ''));
    this.paginationPageSize = Number(event.value.toLowerCase().replace('rows', ''));
    if (this.gridApi != null) {
       this.gridApi.paginationSetPageSize(Number(event.value.toLowerCase().replace("rows", "")));
      this.gridApi.setRowData(this.rowData);
    }
  }


}
