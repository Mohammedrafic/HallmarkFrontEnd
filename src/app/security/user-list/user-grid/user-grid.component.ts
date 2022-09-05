import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { GridComponent, RowDataBoundEventArgs } from '@syncfusion/ej2-angular-grids';
import { FormGroup } from '@angular/forms';
import { Role, RolesFilters, RolesPage } from '@shared/models/roles.model';
import { GRID_CONFIG } from '@shared/constants';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { Select, Store } from '@ngxs/store';
import { SecurityState } from '../../store/security.state';
import { map, Observable, Subject, takeWhile } from 'rxjs';
import { ExportUserList, GetRolesPage, GetUsersPage } from '../../store/security.actions';
import { CreateUserStatus, STATUS_COLOR_GROUP } from '@shared/enums/status';
import { User, UsersPage } from '@shared/models/user-managment-page.model';
import { UserState } from '../../../store/user.state';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { ShowExportDialog } from '../../../store/app.actions';
import { DatePipe } from '@angular/common';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ButtonRendererComponent } from '@shared/components/button/button-renderer/button-renderer.component';
import {
  ColDef,
  GridReadyEvent,
  IServerSideDatasource,
  IServerSideGetRowsRequest,
  PaginationChangedEvent,
} from '@ag-grid-enterprise/all-modules';
import { CustomNoRowsOverlayComponent } from '@shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';

enum Visibility {
  Unassigned,
  Assigned,
}

@Component({
  selector: 'app-user-grid',
  templateUrl: './user-grid.component.html',
  styleUrls: ['./user-grid.component.scss']
})
export class UserGridComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @Input() filterForm: FormGroup;
  @Input() export$: Subject<ExportedFileType>;
  @Output() editUserEvent = new EventEmitter();

  @ViewChild('usersGrid') grid: GridComponent;

  @Select(SecurityState.userGridData)
  private _userGridData$: Observable<User[]>;

  @Select(SecurityState.usersPage)
  public usersPage$: Observable<UsersPage>;

  @Select(SecurityState.rolesPage)
  public rolesPage$: Observable<RolesPage>;

  public userGridData$: Observable<User[]>;
  public hasVisibility = (_: string, { assigned }: User) => {
    return Visibility[Number(assigned)];
  };

  public columnsToExport: ExportColumn[] = [
    { text: 'First Name', column: 'FirstName' },
    { text: 'Last Name', column: 'LastName' },
    { text: 'Status', column: 'Status' },
    { text: 'Email', column: 'Email' },
    { text: 'Role', column: 'Role' },
    { text: 'Business', column: 'Business' },
    { text: 'Visibility', column: 'Visibility' },
  ];
  public fileName: string;
  public defaultFileName: string;
  public readonly statusEnum = CreateUserStatus;
  public readonly visibilityEnum = Visibility;
  public isAgencyUser = false;
  private isAlive = true;
  itemList: Array<User> | undefined;
  private gridApi: any;
  private gridColumnApi: any;
  modules: any[] = [ServerSideRowModelModule, RowGroupingModule];
  rowModelType: any;
  serverSideInfiniteScroll: any;
  serverSideFilterOnServer: any;
  cacheBlockSize: any;
  pagination: boolean;
  paginationPageSize: number;

  defaultColDef: any;
  autoGroupColumnDef: any;
  columnDefs: any;
  filterText: string | undefined;
  frameworkComponents: any;
  sideBar: any;
  serverSideStoreType: any;
  maxBlocksInCache: any;
  filters: RolesFilters;
  public readonly gridConfig: typeof GRID_CONFIG = GRID_CONFIG;

  constructor(private store: Store, private datePipe: DatePipe) {
    super();
    this.frameworkComponents = {
      buttonRenderer: ButtonRendererComponent,
    }
    var self = this;
    this.rowModelType = 'serverSide';
    this.serverSideStoreType = 'partial';
    this.serverSideInfiniteScroll = true,
      this.serverSideFilterOnServer = true,
      this.pagination = true;
    this.paginationPageSize = 2,
      this.cacheBlockSize = 2;
    this.maxBlocksInCache = 1;
    this.columnDefs = [
      {
        headerName: 'Action',
        cellRenderer: 'buttonRenderer',
        cellRendererParams: {
          onClick: this.onEdit.bind(this),
          label: 'Edit'
        },
        width: 50,
        pinned: 'left',
        suppressMovable: true,
        filter: false,
        sortable: false,
        menuTabs: []
      },
      {
        field: 'id',
        hide: true,
        filter: false
      },
      {
        field: 'firstName',
        pinned: 'left',
        suppressMovable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          buttons: ['reset'],
          debounceMs: 1000,
          suppressAndOrCondition: true,
        }
      },
      {
        field: 'lastName',
        pinned: 'left',
        suppressMovable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          buttons: ['reset'],
          debounceMs: 1000,
          suppressAndOrCondition: true,
        }
      },
      {
        headerName: 'Status',
        field: 'isDeleted',
        width: 50,
        valueGetter: function (params: { data: { isDeleted: boolean } }) {
          return self.statusEnum[+!params.data.isDeleted];
        },
        pinned: 'left',
        suppressMovable: true,
        filter: false,
        sortable: false
      },
      {
        field: 'email',
        filter: 'agTextColumnFilter',
        filterParams: {
          buttons: ['reset'],
          debounceMs: 1000,
          suppressAndOrCondition: true,
        }
      },
      {
        headerName: 'Roles',
        field: 'roleNames',
        sortable: false,
        filter: 'agSetColumnFilter',
        filterParams: {
          values: (params: { success: (arg0: any) => void; }) => {
            setTimeout(() => {                
                this.rolesPage$.subscribe((data)=>{                  
                  params.success(data.items.map(function(item){return item.name}));
                });
            }, 3000)
          },
          buttons: ['reset'],
          refreshValuesOnOpen: true,
        }
      },
      {
        field: 'organization',
        valueGetter: function (params: { data: { businessUnitName: string }; }) {
          return params.data.businessUnitName || "All";
        },
        filter: false,
      },
      {
        headerName: 'Visibility',
        field: 'hasVisibility',
        hide: this.isAgencyUser,
        valueGetter: function (params: { data: { hasVisibility: boolean } }) {
          return self.visibilityEnum[params.data.hasVisibility ? 0 : 1]
        },
        filter: false,
        sortable: false
      }
    ];

    this.defaultColDef = {
      flex: 2,
      minWidth: 120,
      resizable: true,
      sortable: true,
      filter: true
    };

    this.autoGroupColumnDef = {
      flex: 1,
      minWidth: 280,
      field: 'name',
    };

    this.sideBar = {
      toolPanels: [
        {
          id: 'columns',
          labelDefault: 'Columns',
          labelKey: 'columns',
          iconKey: 'columns',
          toolPanel: 'agColumnsToolPanel',
          toolPanelParams: {
            suppressRowGroups: true,
            suppressValues: true,
            suppressPivots: true,
            suppressPivotMode: true,
            suppressColumnFilter: true,
            suppressColumnSelectAll: true,
            suppressColumnExpandAll: true,
          },
        },
        {
          id: 'filters',
          labelDefault: 'Filters',
          labelKey: 'filters',
          iconKey: 'filters',
          toolPanel: 'agFiltersToolPanel',
          toolPanelParams: {
            suppressRowGroups: true,
            suppressValues: true,
            suppressPivots: true,
            suppressPivotMode: true,
            suppressColumnFilter: true,
            suppressColumnSelectAll: true,
            suppressColumnExpandAll: true,
          },
        },
      ],
      
    };
  }

  public noRowsOverlayComponent: any = CustomNoRowsOverlayComponent;
  public noRowsOverlayComponentParams: any = {
    noRowsMessageFunc: () => 'No Rows To Show',
  };

  ngOnInit(): void {
    this.checkAgencyUser();
    this.subscribeForFilterFormChange();
    this.setFileName();
    this.subscribeOnExportAction();
    this.updateUsers();
    this.loadRoles();
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  public onEdit(data: any): void {
    this.editUserEvent.emit(data?.rowData);
  }

  public rowDataBound(args: RowDataBoundEventArgs): void {
    const data = args.data as Role;
    if (data.isDefault) {
      args.row?.classList.add('default-role');
    }
  }

  public getChipCssClass(status: string): string {
    const found = Object.entries(STATUS_COLOR_GROUP).find((item) => item[1].includes(status));
    return found ? found[0] : 'e-default';
  }

  public onGoToClick(event: any): void {
    this.currentPage = event.currentPage || event.value;
    if (event.currentPage || event.value) {
      this.dispatchNewPage();
    }
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
    const { businessUnit, business } = this.filterForm.value;
    this.store.dispatch(
      new ExportUserList(
        new ExportPayload(
          fileType,
          {
            businessUnitType: businessUnit,
            businessUnitId: business ? business : null,
            ids: this.selectedItems.length ? this.selectedItems.map((val) => val[this.idFieldName]) : null,
            ...this.filters
          },
          options
            ? options.columns.map((val: ExportColumn) => val.column)
            : this.columnsToExport.map((val: ExportColumn) => val.column),
          null,
          options?.fileName || this.defaultFileName
        )
      )
    );
    this.clearSelection(this.grid);
  }

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.pageSettings = { ...this.pageSettings, pageSize: this.pageSize };
    this.dispatchNewPage();
  }

  onPageSizeChanged(event: any) {
    this.cacheBlockSize=Number(event.value.toLowerCase().replace("rows",""));
    this.paginationPageSize=Number(event.value.toLowerCase().replace("rows",""));
    if(this.gridApi!=null)
    {
      this.gridApi.paginationSetPageSize(Number(event.value.toLowerCase().replace("rows","")));
      this.gridApi.gridOptionsWrapper.setProperty('cacheBlockSize', Number(event.value.toLowerCase().replace("rows","")));
      var datasource = this.createServerSideDatasource();
      this.gridApi.setServerSideDatasource(datasource);
    }
  }

  private updateUsers(): void {
    this.userGridData$ = this._userGridData$.pipe(map((value: User[]) => [...this.addRoleEllipsis(value)]));
  }

  private addRoleEllipsis(roles: User[]): any {
    return (
      roles &&
      roles.map((role: User) => {
        if (role.roles.length > 2) {
          const [first, second] = role.roles;
          return {
            ...role,
            roles: [first, second, { name: '...' }],
          };
        } else {
          return role;
        }
      })
    );
  }

  private subscribeForFilterFormChange(): void {
    this.filterForm.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe(() => {this.dispatchNewPage(), this.loadRoles()});
  }

  private dispatchNewPage(): void {
    const { businessUnit, business } = this.filterForm.getRawValue();
    this.store.dispatch(new GetUsersPage(businessUnit, business != 0 ? [business] : null, this.currentPage, this.pageSize, null, null));
  }

  private checkAgencyUser(): void {
    const user = this.store.selectSnapshot(UserState.user);
    this.isAgencyUser = user?.businessUnitType === BusinessUnitType.Agency;
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
            filterModels: params.request.filterModel
          };
          var filter: any;
          let jsonString = JSON.stringify(params.request.filterModel);
          if (jsonString != "{}") {
            var updatedJson = jsonString.replace("operator", "logicalOperator");
            filter = JSON.parse(updatedJson);
          }
          else filter = null;

          var sort = postData.sortFields.length > 0 ? postData.sortFields : null;
          const { businessUnit, business } = self.filterForm.getRawValue();
          self.store.dispatch(new GetUsersPage(businessUnit, business != 0 ? [business] : null, isNaN(postData.pageNumber) ? self.currentPage : postData.pageNumber, postData.pageSize, sort, filter));
          self.usersPage$.pipe().subscribe((data: any) => {
            self.itemList = data?.items;
            if (!self.itemList || !self.itemList.length) {
              self.gridApi.showNoRowsOverlay();
            }
            else {
              self.gridApi.hideOverlay();
            }
            params.successCallback(self.itemList, data?.totalCount || 1);
          });
        }, 500);
      }
    }
  }

  loadRoles() {
    const { businessUnit, business } = this.filterForm.getRawValue();
    this.store.dispatch(new GetRolesPage(businessUnit, business || null, 1, 1000, null, null, this.filters));
  }

  private setFileName(): void {
    const currentDateTime = this.generateDateTime(this.datePipe);
    this.fileName = `Security/User List ${currentDateTime}`;
  }

  private subscribeOnExportAction(): void {
    this.export$.pipe(takeWhile(() => this.isAlive)).subscribe((event: ExportedFileType) => {
      this.defaultFileName = `Security/User List ${this.generateDateTime(this.datePipe)}`;
      this.defaultExport(event);
    });
  }
}
