import { ColDef, FilterChangedEvent, GridOptions, ICellRendererParams } from '@ag-grid-community/core';
import { Component, OnInit, ChangeDetectionStrategy, Input, OnDestroy, ViewChild, Output, EventEmitter } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { LogInterface, LogTimeSheetHistory, LogTimeSheetHistoryPage } from '@shared/models/org-interface.model';
import { disabledBodyOverflow, windowScrollTop } from '@shared/utils/styles.utils';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { BehaviorSubject, Observable, Subject, takeWhile } from 'rxjs';
import { SecurityState } from 'src/app/security/store/security.state';
import { DefaultUserGridColDef, SideBarConfig } from 'src/app/security/user-list/user-grid/user-grid.constant';
import { AppState } from 'src/app/store/app.state';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ButtonRendererComponent } from '@shared/components/button/button-renderer/button-renderer.component';
import { CustomNoRowsOverlayComponent } from '@shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';
import { GRID_CONFIG } from '@shared/constants';
import { ExportTimeSheetList, GetLogHistoryById } from 'src/app/security/store/security.actions';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { DatePipe } from '@angular/common';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { ShowExportDialog } from 'src/app/store/app.actions';

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

  public totalRecordsCount$: BehaviorSubject<number> =new BehaviorSubject<number>(0);
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
      headerName: 'Timesheet Id',
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
      headerName: 'Employee Id',
      field: 'employeeid',
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
      headerName: 'First Name',
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
      headerName: 'Middle Name',
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
      headerName: 'Last Name',
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
      headerName: 'Location Id',
      field: 'locationId',
      minWidth: 125,
      sortable: false,
      resizable: true
    },
    {
      headerName: 'Worked LocationId',
      field: 'workedlocationid',
      minWidth: 125,
      sortable: false,
      resizable: true
    },
    {
      headerName: 'Worked DeptId',
      field: 'workedccid',
      minWidth: 100,
      sortable: false,
      resizable: true
    },
    {
      headerName: 'Shift Type',
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
      headerName: 'PunchIn Date',
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
        if(!Number.isNaN(Date.parse(params.data?.punchIndate)))
        {
          const str = this.datePipe?.transform(params.data.punchIndate, 'MM/dd/yyyy') as string
          return str?.length > 0 ? str : "";
        }else{
          return params.data.punchIndate;
        }
      },
      sortable: true,
      resizable: true
    },
    {
      headerName: 'PunchIn Time',
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
      headerName: 'PunchOut Date',
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
        if (!Number.isNaN(Date.parse(params.data?.punchOutdate))){
          const str = this.datePipe?.transform(params.data.punchOutdate, 'MM/dd/yyyy') as string
          return str?.length > 0 ? str : "";
        }else{
          return params.data.punchOutdate;
        }
      },
      sortable: true,
      resizable: true
    },
    {
      headerName: 'PunchOut Time',
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
      headerName: 'Total Hours',
      field: 'totalHours',
      minWidth: 50,
      resizable: true
    },
    {
      headerName: 'Deleted',
      field: 'deleted',
      minWidth: 150,
      resizable: true,
      cellRenderer: (params:any) => {
        return params.data.deleted == "0" ? 'No' :  params.data.deleted == "1" ? 'Yes' : params.data.deleted;
      },
    },
    {
      headerName: 'Error Description',
      field: 'failureReason',
      minWidth: 150,
      resizable: true,
      cellRenderer: (params:any) => {
        return params.data.status == 4 ? 'Record failed to process due to some internal error' :  params.data.failureReason;
      },
    },
  ];
  public defaultFileName: string;
  public fileName: string;
  public columnsToExport: ExportColumn[] = [
    { text: 'Timesheet ID', column: 'TimesheetId' },
    { text: 'Employee ID', column: 'EmployeeId' },
    { text: 'First Name', column: 'FirstName' },
    { text: 'Middle Name', column: 'MiddleName' },
    { text: 'Last Name', column: 'LastName' },
    { text: 'Location Id', column: 'LocationId' },
    { text: 'Worked LocationId', column: 'WorkedLocationId' },
    { text: 'Worked DeptId', column: 'WorkedDeptId'},
    { text: 'Shift Type', column: 'ShiftType' },
    { text: 'PunchIn Date', column: 'PunchInDate' },
    { text: 'PunchIn Time', column: 'PunchInTime' },
    { text: 'PunchOut Date', column: 'PunchOutDate' },
    { text: 'PunchOut Time', column: 'PunchOutTime' },
    { text: 'Lunch', column: 'Lunch' },
    { text: 'Total Hours', column: 'TotalHours' },
    { text: 'Deleted', column: 'Deleted' },
    { text: 'Error Description', column: 'ErrorDescription' },
  ];

  constructor(
    private store: Store,private datePipe: DatePipe,
  ) {
    super();
    var self = this;
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

    if(this.selectedLog != undefined){
      this.dispatchNewPageRequest({currentPage:this.currentPage,pageSize:this.pageSize});
    }
    this.logTimeSheetHistoryPage$.pipe(takeWhile(() => this.isAlive)).subscribe((data: any) => {
      this.timeSheetHistoryItemList = data?.items;
      this.totalRecordsCount$.next(data?.totalCount);
      if (!this.timeSheetHistoryItemList || !this.timeSheetHistoryItemList.length) {
        this.gridApi?.showNoRowsOverlay();
      } else {
        this.gridApi?.hideOverlay();
      }
      this.gridApi?.setRowData(this.timeSheetHistoryItemList);
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

  public override customExport(): void {
    const currentDateTime = this.generateDateTime(this.datePipe);
    this.fileName = `TimesheetDetails ${currentDateTime}`;
    this.store.dispatch(new ShowExportDialog(true));
  }

  public closeExport(): void {
    this.fileName = '';
    this.store.dispatch(new ShowExportDialog(false));
  }

  public export(event: ExportOptions): void {
    this.closeExport();
    this.defaultExport(event.fileType, event);
  }

  public override defaultExport(fileType: ExportedFileType, options?: ExportOptions): void {
    this.defaultFileName = `TimesheetDetails ${this.generateDateTime(this.datePipe)}`;
    this.store.dispatch(
      new ExportTimeSheetList(
        new ExportPayload(
          fileType,
          {
            OrganizationId: this.selectedLog.organizationId,
            RunId: this.selectedLog.runId,
          },
          options
            ? options.columns.map((val: ExportColumn) => val.column)
            : this.columnsToExport.map((val: ExportColumn) => val.column),
          null,
          options?.fileName || this.defaultFileName
        )
      )
    );
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridApi.setRowData(this.timeSheetHistoryItemList);
  }

  public dispatchNewPageRequest(postData:any): void {
   // this.store.dispatch(new GetLogHistoryById("d2874d41-874d-4400-be4d-d2919f366dee",2,postData.currentPage,postData.pageSize));
    this.store.dispatch(new GetLogHistoryById(this.selectedLog.runId,this.selectedLog.organizationId,postData.currentPage,postData.pageSize));
  }

  onPageSizeChanged(event: any) {
    this.cacheBlockSize = Number(event.value.toLowerCase().replace('rows', ''));
    this.paginationPageSize = Number(event.value.toLowerCase().replace('rows', ''));
    if (this.gridApi != null) {
      this.gridApi.paginationSetPageSize(Number(event.value.toLowerCase().replace('rows', '')));
      this.gridApi.setRowData(this.timeSheetHistoryItemList);
    }
  }

  ngOnDestroy(): void {
    this.isAlive = false;
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
