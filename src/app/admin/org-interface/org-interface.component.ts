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
import { GetUsersPage } from 'src/app/security/store/security.actions';
import { SecurityState } from 'src/app/security/store/security.state';
import { User, UsersPage } from '@shared/models/user.model';

@Component({
  selector: 'app-org-interface',
  templateUrl: './org-interface.component.html',
  styleUrls: ['./org-interface.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgInterfaceComponent  extends AbstractGridConfigurationComponent implements OnInit {

  @Select(SecurityState.userGridData)
  private _userGridData$: Observable<User[]>;

  @Select(SecurityState.usersPage)
  public usersPage$: Observable<UsersPage>;



  @Select(AppState.isDarkTheme)
  isDarkTheme$: Observable<boolean>;

  public userGridData$: Observable<User[]>;

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
  itemList: Array<User> | undefined;

  public readonly gridConfig: typeof GRID_CONFIG = GRID_CONFIG;

  public noRowsOverlayComponent: any = CustomNoRowsOverlayComponent;
  public noRowsOverlayComponentParams: any = {
    noRowsMessageFunc: () => 'No Rows To Show',
  };

  constructor(private store: Store,) {
    super();
    var self = this;
    this.rowModelType = 'serverSide';
    this.serverSideStoreType = 'partial';
    (this.serverSideInfiniteScroll = true), (this.serverSideFilterOnServer = true), (this.pagination = true);
    (this.paginationPageSize = this.pageSize), (this.cacheBlockSize = this.pageSize);
    this.maxBlocksInCache = 1;

    this.columnDefs = [
      {
        headerName: 'Action',
        cellRenderer: 'buttonRenderer',
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
        field: 'firstName',
        filter: 'agTextColumnFilter',
      },
      {
        field: 'lastName',
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Status',
        field: 'isDeleted',
        width: 50,
        filter: false,
        sortable: false,
      },
      {
        field: 'email',
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Roles',
        field: 'roleNames',
        sortable: false,
        filter: 'agSetColumnFilter',
      },
      {
        field: 'organization',
        filter: false,
      },
      {
        headerName: 'Visibility',
        field: 'hasVisibility',
        filter: false,
        sortable: false,
      },
      {
        headerName: 'Last Login Date',
        field: 'lastLoginDate',
        filter: false,
      },
    ];
   }

  ngOnInit(): void {
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
            sortFields: params.request.sortModel,
            filterModels: params.request.filterModel,
          };
          var filter: any;
          let jsonString = JSON.stringify(params.request.filterModel);
          if (jsonString != '{}') {
            var updatedJson = jsonString.replace('operator', 'logicalOperator');
            filter = JSON.parse(updatedJson);
          } else filter = null;

          var sort = postData.sortFields.length > 0 ? postData.sortFields : null;
          self.dispatchNewPage(sort, filter);
          self.usersPage$.pipe().subscribe((data: any) => {
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
  
  public dispatchNewPage(sortModel: any = null, filterModel: any = null): void {
    const { businessUnit, business }  = {businessUnit:1,'business':null};
    this.store.dispatch(
      new GetUsersPage(
        businessUnit || 1,
        business || null,
        this.currentPage,
        this.pageSize,
        sortModel,
        filterModel,
      )
    );
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
