import { ColDef, FilterChangedEvent, GridOptions, ICellRendererParams } from '@ag-grid-community/core';
import { Component, OnInit, ChangeDetectionStrategy, Input, OnDestroy, ViewChild, Output, EventEmitter } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { LogInterface, LogTimeSheetHistory, LogTimeSheetHistoryPage } from '@shared/models/org-interface.model';
import { disabledBodyOverflow, windowScrollTop } from '@shared/utils/styles.utils';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Observable, Subject, takeWhile } from 'rxjs';
import { SecurityState } from 'src/app/security/store/security.state';
import { DefaultUserGridColDef, SideBarConfig } from 'src/app/security/user-list/user-grid/user-grid.constant';
import { AppState } from 'src/app/store/app.state';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ButtonRendererComponent } from '@shared/components/button/button-renderer/button-renderer.component';
import { CustomNoRowsOverlayComponent } from '@shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';
import { GRID_CONFIG } from '@shared/constants';
import { GetLogHistoryById } from 'src/app/security/store/security.actions';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-log-interface-dialog',
  templateUrl: './log-interface-dialog.component.html',
  styleUrls: ['./log-interface-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogInterfaceDialogComponent extends AbstractGridConfigurationComponent  implements OnInit,  OnDestroy {

  @Input() selectedLog: LogInterface;
  @Input() openDialogue: Subject<boolean>;

  @Output() nextPreviousLogEvent = new EventEmitter<boolean>();

  @ViewChild('sideDialog') sideDialog: DialogComponent;

  
  @Select(SecurityState.logDialogOptions)
  public logDialogOptions$: Observable<DialogNextPreviousOption>;

  @Select(SecurityState.logTimeSheetHistoryGridData)
  private _logTimeSheetHistoryData$: Observable<LogTimeSheetHistory[]>;

  @Select(SecurityState.logTimeSheetHistoryPage)
  public logTimeSheetHistoryPage$: Observable<LogTimeSheetHistoryPage>;

  @Select(AppState.isDarkTheme)
  isDarkTheme$: Observable<boolean>;
  

  private isAlive = true;
  private unsubscribe$: Subject<void> = new Subject();
  public targetElement: HTMLElement | null = document.body.querySelector('#main');
    
  public totalRecordsCount: number;
  public gridApi: any;
  private gridColumnApi: any;
  // columnDefs: ColDef[];
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
  timeSheetHistoryItemList: Array<LogTimeSheetHistory>=[];
  public readonly gridConfig: typeof GRID_CONFIG = GRID_CONFIG;

  public noRowsOverlayComponent: any = CustomNoRowsOverlayComponent;
  public noRowsOverlayComponentParams: any = {
    noRowsMessageFunc: () => 'No Rows To Show',
  };

  public readonly columnDefs: ColumnDefinitionModel[] = [
    {
      field: 'id',
      hide: true,
      filter: false,
    },
    {
      headerName: 'TIMESHEETITEMID',
      field: 'timesheetitemid',
      minWidth: 100,
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
      headerName: 'EMPLOYEEID',
      field: 'employeeid',
      minWidth: 100,
      hide: true,
      filter: false,
    },
    {
      headerName: 'FNAME',
      field: 'fname',
      minWidth: 100,
      filter: 'agTextColumnFilter',
      cellRenderer: (params:any) => {
        return params.data.fname === null ? '' : params.data.fname;
      },
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
    },
    {
      headerName: 'MNAME',
      field: 'mname',
      minWidth: 100,
      filter: 'agTextColumnFilter',
      cellRenderer: (params:any) => {
        return params.data.mname === null ? '' : params.data.mname;
      },
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
    },
    {
      headerName: 'LNAME',
      field: 'lname',
      minWidth: 100,
      filter: 'agTextColumnFilter',
      cellRenderer: (params:any) => {
        return params.data.lname === null ? '' : params.data.lname;
      },
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
    },    
    {
      headerName: 'LOCATION_ID',
      field: 'locationId',
      minWidth: 125,
      sortable: false,
      resizable: true
    },
    {
      headerName: 'COSTCENTER_ID',
      field: 'costcenterId',
      minWidth: 100,
      sortable: false,
      resizable: true
    },
    {
      headerName: 'WORKEDLOCATIONID',
      field: 'workedlocationid',
      minWidth: 125,
      sortable: false,
      resizable: true
    }, 
    {
      headerName: 'WORKEDCCID',
      field: 'workedccid',
      minWidth: 100,
      sortable: false,
      resizable: true
    },  
    {
      headerName: 'SHIFT_TYPE',
      field: 'shiftType',
      minWidth: 100,
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
      headerName: 'PunchINDate',
      field: 'punchIndate',
      minWidth: 100,
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
        const str = this.datePipe?.transform(params.data.punchIndate, 'MM/dd/yyyy') as string
        return str?.length > 0 ? str : "";
      },
      sortable: true,
      resizable: true
    },
    {
      headerName: 'PunchINTime',
      field: 'punchIntime',
      minWidth: 100,
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
      headerName: 'PunchOUTDate',
      field: 'punchOutdate',
      minWidth: 100,
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
        const str = this.datePipe?.transform(params.data.punchOutdate, 'MM/dd/yyyy') as string
        return str?.length > 0 ? str : "";
      },
      sortable: true,
      resizable: true
    },
    {
      headerName: 'PunchOUTTime',
      field: 'punchOuttime',
      minWidth: 100,
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
      headerName: 'Lunch',
      field: 'lunch',
      minWidth: 50,
      sortable: false,
      resizable: true
    },
    {
      headerName: 'TOTAL_HOURS',
      field: 'totalHours',
      minWidth: 50,
      resizable: true
    },
    {
      headerName: 'status',
      field: 'status',
      minWidth: 150,
      filter: false,
      sortable: false,
    },
    {
      headerName: 'jobid',
      field: 'jobId',
      minWidth: 150,
      filter: false,
      sortable: false,
    },
    {
      headerName: 'jobcode',
      field: 'jobcode',
      minWidth: 150,
      filter: false,
      sortable: false,
    },
    {
      headerName: 'Week StartDate',
      field: 'weekStartDate',
      minWidth: 150,
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
        const str = this.datePipe?.transform(params.data.weekStartDate, 'MM/dd/yyyy') as string
        return str?.length > 0 ? str : "";
      },
    },
  ];
  
  constructor(
    private store: Store,private datePipe: DatePipe,
  ) { 
    super();
    var self = this;
    this.frameworkComponents = {
      buttonRenderer: ButtonRendererComponent,
    };
    this.rowModelType = 'serverSide';
    this.serverSideStoreType = 'partial';
    (this.serverSideInfiniteScroll = true), (this.serverSideFilterOnServer = true), (this.pagination = true);
    (this.paginationPageSize = this.pageSize), (this.cacheBlockSize = this.pageSize);
    this.maxBlocksInCache = 1;
    
  }

  ngOnInit(): void {
    this.openDialogue.pipe(takeWhile(() => this.isAlive)).subscribe((isOpen) => {
      if (isOpen) { 
        windowScrollTop();
        this.sideDialog.show();
        disabledBodyOverflow(true);
      } else {
        this.sideDialog.hide();
        disabledBodyOverflow(false);
      }
    });

    console.log('this.selectedLog ---->',this.selectedLog);
    if(this.selectedLog != undefined){
      this.dispatchNewPageRequest({currentPage:this.currentPage,pageSize:this.pageSize});
    }
    this.logTimeSheetHistoryPage$.pipe().subscribe((data: any) => {
      this.timeSheetHistoryItemList = data?.items;
      this.totalRecordsCount = data?.totalCount;
      if (!this.timeSheetHistoryItemList || !this.timeSheetHistoryItemList.length) {
        this.gridApi?.showNoRowsOverlay();
      } else {
        this.gridApi?.hideOverlay();
        this.timeSheetHistoryItemList = data.items;
        this.gridApi?.setRowData(this.timeSheetHistoryItemList);
      }
    });

  }

  public gridOptions: GridOptions = {
    pagination: true,
    cacheBlockSize: this.pageSize,
    paginationPageSize: this.pageSize,
    columnDefs: this.columnDefs,
    rowData: this.timeSheetHistoryItemList,
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

  public onClose(): void {
    this.sideDialog.hide();
    this.openDialogue.next(false);
  }

  public onNextPreviousLog(next: boolean): void {
    this.nextPreviousLogEvent.emit(next);
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    params.api.showLoadingOverlay();
    var datasource = this.createServerSideDatasource();
     params.api.setServerSideDatasource(datasource);
  }

  public dispatchNewPageRequest(postData:any): void {
    console.log('this.selectedLog ===>',this.selectedLog);
   // this.store.dispatch(new GetLogHistoryById("d2874d41-874d-4400-be4d-d2919f366dee",2,postData.currentPage,postData.pageSize));
    this.store.dispatch(new GetLogHistoryById(this.selectedLog.runId,this.selectedLog.organizationId,postData.currentPage,postData.pageSize));
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
          if(postData.pageNumber > 1){
            self.dispatchNewPageRequest(postData);
          }
          self.logTimeSheetHistoryPage$.pipe().subscribe((data: any) => {
            self.timeSheetHistoryItemList = data?.items;
            self.totalRecordsCount = data?.totalCount;
            if (!self.timeSheetHistoryItemList || !self.timeSheetHistoryItemList.length) {
              self.gridApi.showNoRowsOverlay();
            } else {
              self.gridApi.hideOverlay();
            }
            params.successCallback(self.timeSheetHistoryItemList, data?.totalCount || 1);
          });
        }, 500);
      },
    };
  }

  onPageSizeChanged(event: any) {
    this.cacheBlockSize = Number(event.value.toLowerCase().replace('rows', ''));
    this.paginationPageSize = Number(event.value.toLowerCase().replace('rows', ''));
    if (this.gridApi != null) {
      this.gridApi.paginationSetPageSize(Number(event.value.toLowerCase().replace('rows', '')));
      this.gridApi.gridOptionsWrapper.setProperty(
        'cacheBlockSize',
        Number(event.value.toLowerCase().replace('rows', ''))
      );
       var datasource = this.createServerSideDatasource();
       this.gridApi.setServerSideDatasource(datasource);
    }
  }

  ngOnDestroy(): void {
    this.isAlive = false;
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
