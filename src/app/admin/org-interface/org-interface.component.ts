import { ColDef } from '@ag-grid-community/core';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { DefaultUserGridColDef, SideBarConfig } from 'src/app/security/user-list/user-grid/user-grid.constant';
import { AppState } from 'src/app/store/app.state';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ButtonRendererComponent } from '@shared/components/button/button-renderer/button-renderer.component';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { CustomNoRowsOverlayComponent } from '@shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';
import { GRID_CONFIG } from '@shared/constants';
import { GetOrgInterfacePage } from 'src/app/security/store/security.actions';
import { SecurityState } from 'src/app/security/store/security.state';
import { OrgInterface, OrgInterfacePage } from '@shared/models/org-interface.model';
import { ToggleSwitchComponent } from '@admin/alerts/toggle-switch/toggle-switch.component';
import { SetHeaderState } from 'src/app/store/app.actions';

@Component({
  selector: 'app-org-interface',
  templateUrl: './org-interface.component.html',
  styleUrls: ['./org-interface.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgInterfaceComponent  extends AbstractGridConfigurationComponent implements OnInit {


  @Select(SecurityState.orgInterfaceGridData)
  private _orgInterfaceData$: Observable<OrgInterface[]>;

  @Select(SecurityState.orgInterfacePage)
  public orgInterfacePage$: Observable<OrgInterfacePage>;

  @Select(AppState.isDarkTheme)
  isDarkTheme$: Observable<boolean>;


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
  itemList: Array<OrgInterface> | undefined;

  public readonly gridConfig: typeof GRID_CONFIG = GRID_CONFIG;

  public noRowsOverlayComponent: any = CustomNoRowsOverlayComponent;
  public noRowsOverlayComponentParams: any = {
    noRowsMessageFunc: () => 'No Rows To Show',
  };

  constructor(private store: Store,) {
    super();
    this.store.dispatch(new SetHeaderState({ title: 'Organization Interfaces', iconName: 'file-text' }));
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
        headerName: 'Organization Name',
        field: 'organizationId',
        hide: true,
        filter: false,
      },
      {
        headerName: 'Name',
        field: 'etlprocessName',
        minWidth: 250,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Description',
        field: 'description',
        minWidth: 250,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'File Name Pattern',
        field: 'fileNamePattern',
        minWidth: 200,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'File Type',
        field: 'fileExtension',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Has Header',
        field: 'hasHeader',
        cellRenderer: ToggleSwitchComponent,
        cellRendererParams: {
          label: 'hasHeader'
        },
        valueGetter: (params: { data: { hasHeader: boolean } }) => { 
          return params.data.hasHeader 
        },
        suppressMovable: true,
        minWidth: 150,
        filter: 'agSetColumnFilter',
        sortable: false,
      },
      {
        headerName: 'Column Delimiter',
        field: 'ColumnDelimiter',
        width: 50,
        filter: false,
        sortable: false,
      },
      {
        headerName: 'Import All Files In the Folder',
        field: 'importAllFilesIntheFolder',
        cellRenderer: ToggleSwitchComponent,
        cellRendererParams: {
          label: 'importAllFilesIntheFolder'
        },
        valueGetter: (params: { data: { importAllFilesIntheFolder: boolean } }) => { 
          return params.data.importAllFilesIntheFolder 
        },
        suppressMovable: true,
        minWidth: 250,
        filter: false,
        sortable: false,
      },
      {
        headerName: 'Process Same File Again',
        field: 'processSameFileAgain',
        cellRenderer: ToggleSwitchComponent,
        cellRendererParams: {
          label: 'processSameFileAgain'
        },
        valueGetter: (params: { data: { processSameFileAgain: boolean } }) => { 
          return params.data.processSameFileAgain 
        },
        suppressMovable: true,
        minWidth: 200,
        filter: false,
        sortable: false,
      },
      {
        headerName: 'Folder',
        field: 'inputFileFolder',
        minWidth: 100,
        filter: false,
      },
      {
        headerName: 'Email Notification',
        field: 'emailNotification',
        cellRenderer: ToggleSwitchComponent,
        cellRendererParams: {
          label: 'emailNotification'
        },
        valueGetter: (params: { data: { emailNotification: boolean } }) => { 
          return params.data.emailNotification 
        },
        suppressMovable: true,
        minWidth: 200,
        filter: false,
        sortable: false,
      },
      {
        headerName: 'Subject',
        field: 'sendMailSubject',
        minWidth: 300,
        filter: false,
        sortable: false,
      },
      {
        headerName: 'Success To',
        field: 'emailRecipientsSuccess',
        minWidth: 300,
        filter: false,
        sortable: false,
      },
      {
        headerName: 'Success CC',
        field: 'emailRecipientsCc',
        minWidth: 300,
        filter: false,
        sortable: false,
      },
      {
        headerName: 'Success BCC',
        field: 'emailRecipientsBcc',
        minWidth: 300,
        filter: false,
        sortable: false,
      }, {
        headerName: 'Failure To',
        field: 'emailRecipientsError',
        minWidth: 300,
        filter: false,
        sortable: false,
      },
     /* {
        headerName: 'Technical To',
        field: 'NotifyTo',
        width: 100,
        filter: false,
        sortable: false,
      },
      {
        headerName: 'Technical Cc',
        field: 'EmailRecipientsCc',
        width: 100,
        filter: false,
        sortable: false,
      },
      {
        headerName: 'Technical Bcc',
        field: 'EmailRecipientsBcc',
        width: 100,
        filter: false,
        sortable: false,
      },*/
      {
        headerName: 'Region Specific',
        field: 'RegionSpecific',
        minWidth: 250,
        filter: false,
        sortable: false,
      },
      {
        headerName: 'Clean Import',
        field: 'CleanImport',
        minWidth: 250,
        filter: false,
        sortable: false,
      },
      {
        headerName: 'Retention Period In Days',
        field: 'RetentionPeriodInDays',
        minWidth: 250,
        filter: false,
        sortable: false,
      },
    ];
   }

  ngOnInit(): void {
  }

  public onEdit(data: any): void {
    // this.editRoleEvent.emit(data.rowData);
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
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
          self.orgInterfacePage$.pipe().subscribe((data: any) => {
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
    this.store.dispatch(new GetOrgInterfacePage(JSON.parse((localStorage.getItem('lastSelectedOrganizationId') || '0'))  as number,postData.currentPage,postData.pageSize));
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

}
