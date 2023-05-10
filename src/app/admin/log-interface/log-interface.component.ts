import { ColDef } from '@ag-grid-community/core';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject, takeUntil, takeWhile } from 'rxjs';
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

  private isAlive = true;
  public totalRecordsCount: number;
  public gridApi: any;
  private gridColumnApi: any;
  columnDefs: ColDef[];
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
  itemList: Array<LogInterface> | undefined;
  selectedLogItem: LogInterface;
  openLogDetailsDialogue = new Subject<boolean>();
  private unsubscribe$: Subject<void> = new Subject();
  public organizations: Organisation[] = [];

  public readonly gridConfig: typeof GRID_CONFIG = GRID_CONFIG;

  public noRowsOverlayComponent: any = CustomNoRowsOverlayComponent;
  public noRowsOverlayComponentParams: any = {
    noRowsMessageFunc: () => 'No Rows To Show',
  };

  constructor(private store: Store,) {
    super();
    this.store.dispatch(new SetHeaderState({ title: 'Interface Log Summary', iconName: 'file-text' }));
    var self = this;
    this.frameworkComponents = {
      buttonRenderer: ButtonRendererComponent,
    };
    this.rowModelType = 'serverSide';
    this.serverSideStoreType = 'partial';
    (this.serverSideInfiniteScroll = true), (this.serverSideFilterOnServer = true), (this.pagination = true);
    (this.paginationPageSize = this.pageSize), (this.cacheBlockSize = this.pageSize);
    this.maxBlocksInCache = 1;

    this.columnDefs = [
      {
        headerName: 'Action',
        cellRenderer: 'buttonRenderer',
        cellRendererParams: {
          onClick: this.onEdit.bind(this),
          label: 'Edit',
        },
        width: 50,
        filter: false,
        sortable: false,
        menuTabs: [],
      },
      {
        field: 'id',
        hide: true,
        filter: false,
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
        headerName: 'Input File Name',
        field: 'originalFileName',
        minWidth: 250,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Processed Date',
        field: 'processDate',
        minWidth: 175,
        filter: 'agTextColumnFilter',
        cellRenderer: (params:any) => {
          return params.data.processDate ? (new Date(params.data.processDate)).toLocaleDateString() : '';
        }
      },
      {
        headerName: 'status',
        field: 'status',
        minWidth: 250,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Total Count',
        field: 'totalRows',
        minWidth: 175,
        filter: false,
        sortable: false,
      },
      {
        headerName: 'Created Records',
        field: 'insertedRecord',
        minWidth: 175,
        filter: false,
      },
      {
        headerName: 'Updated Records',
        field: 'updatedRecord',
        minWidth: 175,
        filter: false,
        sortable: false,
      },
      {
        headerName: 'Error Records',
        field: 'failedRecord',
        minWidth: 175,
        filter: false,
        sortable: false,
        cellStyle: params => {
          return {color: 'red'};
        }
      },
 
    ];
   }

  ngOnInit(): void {
    this.organizationData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.organizations = [];
      if (data != null && data.length > 0) {
        this.organizations = uniqBy(data, 'organizationId');
        this.organizations.sort((a:any,b:any)=> a.name.localeCompare(b.name));
      }
    });
    this.subscribeOnBusinessUnitChange();
  }

  private subscribeOnBusinessUnitChange(): void {
    this.lastSelectedOrganizationId$.pipe(takeWhile(() => this.isAlive))
      .subscribe(() => {
        var datasource = this.createServerSideDatasource();
        this.gridApi?.setServerSideDatasource(datasource);
        this.openLogDetailsDialogue.next(false);
      });
  }


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
    this.gridColumnApi = params.columnApi;
    params.api.showLoadingOverlay();
    var datasource = this.createServerSideDatasource();
     params.api.setServerSideDatasource(datasource);
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
    if(localStorage.getItem('lastSelectedOrganizationId') === null){
      this.store.dispatch(new GetLogInterfacePage(this.organizations[0].organizationId,postData.currentPage,postData.pageSize));
    }else{
      this.store.dispatch(new GetLogInterfacePage(JSON.parse((localStorage.getItem('lastSelectedOrganizationId') || '0'))  as number,postData.currentPage,postData.pageSize));
    }
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
