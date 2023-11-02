import { ColDef, FilterChangedEvent, GridOptions, ICellRendererParams } from '@ag-grid-community/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import { DatePipe } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ButtonRendererComponent } from '@shared/components/button/button-renderer/button-renderer.component';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { CustomNoRowsOverlayComponent } from '@shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';
import { GRID_CONFIG } from '@shared/constants';
import { InterfaceLogSummary, InterfaceLogSummaryIRPPage } from '@shared/models/org-interface.model';
import { downloadBlobFile } from '@shared/utils/file.utils';
import { AnyARecord } from 'dns';
import { BehaviorSubject, Observable, Subject, distinctUntilChanged, take, takeUntil, takeWhile, tap } from 'rxjs';
import { OrgInterfaceService } from 'src/app/security/services/org-interface.service';
import { GetInterfaceLogDetails, GetInterfaceLogSummaryPage } from 'src/app/security/store/security.actions';
import { SecurityState } from 'src/app/security/store/security.state';
import { DefaultUserGridColDef, SideBarConfig } from 'src/app/security/user-list/user-grid/user-grid.constant';
import { SetHeaderState } from 'src/app/store/app.actions';
import { AppState } from 'src/app/store/app.state';
import { UserState } from 'src/app/store/user.state';
import { LogStatusEnum } from './interface-log-summary-irp.constants';

@Component({
  selector: 'app-interface-log-summary-irp',
  templateUrl: './interface-log-summary-irp.component.html',
  styleUrls: ['./interface-log-summary-irp.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InterfaceLogSummaryIrpComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {

  @Select(SecurityState.interfaceLogSummaryIRPPage)
  public logInterfacePage$: Observable<InterfaceLogSummaryIRPPage>;

  @Select(AppState.isDarkTheme)
  isDarkTheme$: Observable<boolean>;

  @Select(UserState.lastSelectedOrganizationId)
  private lastSelectedOrganizationId$: Observable<number>;

  private isAlive = true;
  public totalRecordsCount$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
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
  itemList: Array<InterfaceLogSummary> = [];
  selectedLogItem: any;
  openLogDetailsDialogue = new Subject<boolean>();
  private unsubscribe$: Subject<void> = new Subject();
  public organizations: any[] = [];
  public organizationId: number;
  public selectedType: number;

  public readonly gridConfig: typeof GRID_CONFIG = GRID_CONFIG;
  public downloadedFileName: string = '';
  public noRowsOverlayComponent: any = CustomNoRowsOverlayComponent;
  public noRowsOverlayComponentParams: any = {
    noRowsMessageFunc: () => 'No Rows To Show',
  };
  // public rowData: LogInterfacePage[]=[];
  public readonly columnDefs: ColumnDefinitionModel[] = [
    {
      headerName: 'View',
      cellRenderer: ButtonRendererComponent,
      width: 100,
      cellRendererParams: {
        onClick: this.onViewOverallData.bind(this),
        label: 'View',
        suppressMovable: true,
        filter: false,
        sortable: false,
        menuTabs: []
      },
      sortable: true,
      resizable: true
    },
    {
      headerName: 'Id',
      field: 'id',
      minWidth: 250,
      hide: true,
      filter: false,
    },
    {
      headerName: 'Organization ID',
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
      headerName: 'Processed Date & Time',
      field: 'createdAt',
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
        const str = this.datePipe?.transform(params.data.createdAt, 'MM/dd/yyyy h:mm a') as string
        return str?.length > 0 ? str : "";
      },
      sortable: true,
      resizable: true
    },
    {
      headerName: 'Region',
      field: 'region',
      minWidth: 250,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'Location',
      field: 'location',
      minWidth: 250,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'Type',
      field: 'importType',
      minWidth: 250,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'Status',
      field: 'status',
      minWidth: 250,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'Total Count',
      field: 'totalRows',
      minWidth: 175,
      filter: false,
      sortable: false,
      cellRenderer: ButtonRendererComponent,
      cellRendererParams: {
        onClick: this.onViewOverallData.bind(this),
        label: 'Count',
        selectedType: LogStatusEnum.OverAll,
        suppressMovable: true,
        filter: false,
        sortable: false,
        menuTabs: []
      },
    },
    {
      headerName: 'Inserted Record Count',
      field: 'insertedRecord',
      minWidth: 175,
      filter: false,
      cellRenderer: ButtonRendererComponent,
      cellRendererParams: {
        onClick: this.onInsertedLogData.bind(this),
        label: 'Count',
        selectedType: LogStatusEnum.Inserted,
        suppressMovable: true,
        filter: false,
        sortable: false,
        menuTabs: []
      },
    },
    {
      headerName: 'Updated Record Count',
      field: 'updatedRecord',
      minWidth: 175,
      filter: false,
      sortable: false,
      cellRenderer: ButtonRendererComponent,
      cellRendererParams: {
        onClick: this.onUpdatedLogData.bind(this),
        label: 'Count',
        selectedType: LogStatusEnum.Updated,
        suppressMovable: true,
        filter: false,
        sortable: false,
        menuTabs: []
      },
    },
    {
      headerName: 'Error Record Count',
      field: 'failedRecord',
      minWidth: 175,
      filter: false,
      sortable: false,
      cellRenderer: ButtonRendererComponent,
      cellRendererParams: {
        onClick: this.onErrorLogData.bind(this),
        label: 'Count',
        selectedType: LogStatusEnum.Errored,
        suppressMovable: true,
        filter: false,
        sortable: false,
        menuTabs: []
      },
      cellStyle: (params: any) => {
        return { color: 'red' };
      }
    },
  ];

  constructor(private store: Store, private datePipe: DatePipe, private orgInterfaceService: OrgInterfaceService) {
    super();
    this.store.dispatch(new SetHeaderState({ title: 'Interface Log Summary IRP', iconName: 'file-text' }));
  }

  ngOnInit(): void {

    this.subscribeOnBusinessUnitChange();
  
    this.logInterfacePage$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: any) => {
      this.itemList = data?.items?.sort(function (a: any, b: any) {
        return b.createdAt.localeCompare(a.createdAt);
      });
      this.totalRecordsCount$.next(data?.totalCount);
      if (!data || !data?.items.length) {
        this.gridApi?.showNoRowsOverlay();
      }
      else {
        this.gridApi?.hideOverlay();
      }
      this.gridApi?.setRowData(this.itemList);
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

  private subscribeOnBusinessUnitChange(): void {
    this.lastSelectedOrganizationId$
      .pipe(takeWhile(() => this.isAlive))
      .subscribe((data) => {
        if (data != null && data != undefined) {
          this.organizationId = data;
          this.store.dispatch(new GetInterfaceLogSummaryPage(this.organizationId, this.currentPage, this.pageSize));
        }

      });
  }
  public openLogData(data: any): void {
    this.selectedLogItem = data.rowData;
    this.openLogDetailsDialogue.next(true);
    const options = this.getDialogNextPreviousOption(data.rowData);
    this.store.dispatch(new GetInterfaceLogDetails(data.rowData.id, this.selectedType, this.currentPage, this.pageSize,options));
  }
  public onViewOverallData(data: any) {
    this.selectedType = LogStatusEnum.OverAll;
    this.openLogData(data);
  }
  public onInsertedLogData(data: any) {
    if (data.rowData.insertedRecord > 0) {
      this.selectedType =  LogStatusEnum.Inserted;
      this.openLogData(data);
    }
  }
  public onUpdatedLogData(data: any) {
    if (data.rowData.updatedRecord > 0) {
      this.selectedType =LogStatusEnum.Updated;
      this.openLogData(data);
    }
  }
  public onErrorLogData(data: any) {
    if (data.rowData.failedRecord){
      this.selectedType =LogStatusEnum.Errored;
      this.openLogData(data);
    }
  }

  public onFileDownload(data: any): void {
    this.orgInterfaceService.downloadFile(data.rowData.infaceLogSummaryId).pipe(take(1))
      .subscribe((file: Blob) => {
        downloadBlobFile(file, data.rowData.originalFileName);
      });
  }

  private getDialogNextPreviousOption(selectedOrder: InterfaceLogSummary): any {
    const gridData = this.itemList as InterfaceLogSummary[];
    const first = gridData[0];
    const last = gridData[gridData.length - 1];
    return {
      previous: first.id !== selectedOrder.id,
      next: last.id !== selectedOrder.id,
    };
  }

  public onNextPreviousLogEvent(next: any): void {
    if(this.itemList != null && this.itemList?.length > 0){
      const index =  this.itemList.findIndex(ele=> ele.id === this.selectedLogItem.id)
      const nextIndex = next ? index + 1 : index - 1;
      this.selectedLogItem = this.itemList[nextIndex];
      this.openLogDetailsDialogue.next(true);
      const options = this.getDialogNextPreviousOption(this.itemList[nextIndex]);
      this.store.dispatch(new GetInterfaceLogDetails(this.itemList[nextIndex].id,LogStatusEnum.OverAll,this.currentPage,this.pageSize, options));
    }
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridApi.setRowData(this.itemList);
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
