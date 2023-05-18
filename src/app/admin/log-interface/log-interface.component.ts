import { ColDef, FilterChangedEvent, GridOptions, ICellRendererParams } from '@ag-grid-community/core';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { BehaviorSubject, Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { DefaultUserGridColDef, SideBarConfig } from 'src/app/security/user-list/user-grid/user-grid.constant';
import { AppState } from 'src/app/store/app.state';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ButtonRendererComponent } from '@shared/components/button/button-renderer/button-renderer.component';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { CustomNoRowsOverlayComponent } from '@shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';
import { GRID_CONFIG } from '@shared/constants';
import { GetLogFileDownload, GetLogHistoryById, GetLogInterfacePage } from 'src/app/security/store/security.actions';
import { SecurityState } from 'src/app/security/store/security.state';
import { LogInterface, LogInterfacePage } from '@shared/models/org-interface.model';
import { SetHeaderState } from 'src/app/store/app.actions';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { DatePipe } from '@angular/common';
import { UserState } from 'src/app/store/user.state';
import { Organisation } from '@shared/models/visibility-settings.model';
import { uniqBy } from 'lodash';


@Component({
  selector: 'app-log-interface',
  templateUrl: './log-interface.component.html',
  styleUrls: ['./log-interface.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogInterfaceComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {

  @Select(SecurityState.logInterfaceGridData)
  private _logInterfaceData$: Observable<LogInterface[]>;

  @Select(SecurityState.logInterfacePage)
  public logInterfacePage$: Observable<LogInterfacePage>;

  @Select(AppState.isDarkTheme)
  isDarkTheme$: Observable<boolean>;

  @Select(UserState.lastSelectedOrganizationId)
  private lastSelectedOrganizationId$: Observable<number>;

  @Select(SecurityState.organisations)
  public organizationData$: Observable<Organisation[]>;

  @Select(SecurityState.logFileDownloadDetail)
  logFileDownloadDetail$: Observable<any>;

  private isAlive = true;
  public totalRecordsCount$: BehaviorSubject<number> =new BehaviorSubject<number>(0);
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
  private unsubscribe$: Subject<void> = new Subject();
  public organizations: Organisation[] = [];

  public readonly gridConfig: typeof GRID_CONFIG = GRID_CONFIG;
  public downloadedFileName: string = '';
  public noRowsOverlayComponent: any = CustomNoRowsOverlayComponent;
  public noRowsOverlayComponentParams: any = {
    noRowsMessageFunc: () => 'No Rows To Show',
  };
  // public rowData: LogInterfacePage[]=[];
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
      headerName: 'File Name',
      field: 'originalFileName',
      minWidth: 250,
      filter: 'agTextColumnFilter',
      cellRenderer: ButtonRendererComponent,
      cellRendererParams: {
        onClick: this.onFileDownload.bind(this),
        label: 'NameLink',
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
  ];

  constructor(private store: Store,private datePipe: DatePipe) {
    super();
    this.store.dispatch(new SetHeaderState({ title: 'Interface Log Summary', iconName: 'file-text' }));
   }

  ngOnInit(): void {

          this.organizationData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
            this.organizations = [];
            if (data != null && data.length > 0) {
              this.organizations = uniqBy(data, 'organizationId');
              this.organizations.sort((a:any,b:any)=> a.name.localeCompare(b.name));
            }
          });

          this.logInterfacePage$.pipe().subscribe((data: any) => {
              this.itemList = data?.items;
              this.totalRecordsCount$.next(data?.totalCount);
              if (!data || !data?.items.length) {
                this.gridApi?.showNoRowsOverlay();
              }
              else {
                this.gridApi?.hideOverlay();              
              }
              this.gridApi?.setRowData(this.itemList);   
          });

          this.dispatchNewPage({currentPage:this.currentPage,pageSize:this.pageSize});

          this.lastSelectedOrganizationId$.pipe(takeWhile(() => this.isAlive))
              .subscribe(() => {
                this.dispatchNewPage({currentPage:this.currentPage,pageSize:this.pageSize});
                this.openLogDetailsDialogue.next(false);
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
        this.store.dispatch(new GetLogHistoryById(data.rowData.runId, data.rowData.organizationId,this.currentPage,this.pageSize, options));
      }

      public onFileDownload(data: any): void {
        this.store.dispatch(new GetLogFileDownload(data.rowData.runId, data.rowData.organizationId));
        this.logFileDownloadDetail$.pipe(takeUntil(this.unsubscribe$))
          .subscribe((data: any) => {
            if (data) {
              if (this.downloadedFileName != data.fileName) {
                this.downloadedFileName = data.fileName;
                this.createLinkToDownload(data.fileAsBase64, data.fileName, data.contentType);
              }
            }
          });
    }

    createLinkToDownload(base64String: string, fileName: string, contentType: string) {
      if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
        const byteChar = atob(base64String);
        const byteArray = new Array(byteChar.length);
        for (let i = 0; i < byteChar.length; i++) {
          byteArray[i] = byteChar.charCodeAt(i);
        }
        const uIntArray = new Uint8Array(byteArray);
        const blob = new Blob([uIntArray], { type: contentType });
        (window.navigator as any).msSaveOrOpenBlob(blob, `${fileName}`);
      } else {
        const source = `data:${contentType};base64,${base64String}`;
        const link = document.createElement('a');
        link.href = source;
        link.download = `${fileName}`;
        link.click();
      }
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
      this.store.dispatch(new GetLogHistoryById(this.itemList[nextIndex].runId, this.itemList[nextIndex].organizationId,this.currentPage,this.pageSize, options));
    }
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridApi.setRowData(this.itemList);
  }

 
  public dispatchNewPage(postData:any): void {
    if(localStorage.getItem('lastSelectedOrganizationId') === null){
      this.store.dispatch(new GetLogInterfacePage(this.organizations[0]?.organizationId,postData.currentPage,postData.pageSize));
    }else{
      this.store.dispatch(new GetLogInterfacePage(JSON.parse((localStorage.getItem('lastSelectedOrganizationId') || '0'))  as number,postData.currentPage,postData.pageSize));
    }
  }

  onPageSizeChanged(event: any) {
    this.cacheBlockSize = Number(event.value.toLowerCase().replace('rows', ''));
    this.paginationPageSize = Number(event.value.toLowerCase().replace('rows', ''));
    if (this.gridApi != null) {
       this.gridApi.paginationSetPageSize(Number(event.value.toLowerCase().replace("rows", "")));
      this.gridApi.setRowData(this.itemList);
    }
  }
  
  ngOnDestroy(): void {
    this.isAlive = false;
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
