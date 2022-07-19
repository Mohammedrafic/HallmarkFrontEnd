import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { GridComponent, RowDataBoundEventArgs } from '@syncfusion/ej2-angular-grids';
import { FormGroup } from '@angular/forms';
import { Role } from '@shared/models/roles.model';
import { GRID_CONFIG } from '@shared/constants';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { Select, Store } from '@ngxs/store';
import { SecurityState } from '../../store/security.state';
import { map, Observable, Subject, takeWhile } from 'rxjs';
import { ExportUserList, GetUsersPage } from '../../store/security.actions';
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

enum Visibility {
  Unassigned,
  Assigned,
}

@Component({
  selector: 'app-user-grid',
  templateUrl: './user-grid.component.html',
  styleUrls: ['./user-grid.component.scss'],
})
export class UserGridComponent extends AbstractGridConfigurationComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() filterForm: FormGroup;
  @Input() export$: Subject<ExportedFileType>;
  @Output() editUserEvent = new EventEmitter();

  @ViewChild('usersGrid') grid: GridComponent;

  @Select(SecurityState.userGridData)
  private _userGridData$: Observable<User[]>;

  @Select(SecurityState.usersPage)
  public usersPage$: Observable<UsersPage>;

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
  private gridApi : any;
  private gridColumnApi: any;
  modules: any[] = [ServerSideRowModelModule, RowGroupingModule];
  rowModelType:any;
  serverSideInfiniteScroll:any;
  cacheBlockSize: any;
  pagination: boolean;
  paginationPageSize: number;

  defaultColDef:any;
  autoGroupColumnDef:any;
  columnDefs: any;
  filterText: string | undefined;
  frameworkComponents: any;
  sideBar: any;

  constructor(private store: Store, private datePipe: DatePipe) {
    super();
    this.frameworkComponents = {
      buttonRenderer: ButtonRendererComponent,
    }
    var self = this;
    console.log(this.statusEnum[0]);
    this.rowModelType = 'serverSide';
    this.serverSideInfiniteScroll = true,
    this.pagination = true;
    this.paginationPageSize= 10,
    this.cacheBlockSize = 10;
    this.columnDefs = [
      { 
        field: 'id',
        hide: true 
      },
      {
        field: 'firstName', filter: 'agTextColumnFilter'  
      },
      {
        field: 'lastName',
      },
      {
        headerName: 'Status',
        field: 'isDeleted',
        valueGetter: function(params: { data: { isDeleted: boolean} }){
          return self.statusEnum[+!params.data.isDeleted];
        }   
      },
      {
        field: 'email',
      },
      {
        field: 'roles',
        cellRenderer: function(params:{ data: { roles: any}}) {
          var roleNames = '';
          params.data.roles.forEach((item: any) => {
            roleNames += item.name + ',';
          });
          return roleNames.substring(0, roleNames.length - 1);
        }
      },
      {
        field: 'organisation',
        valueGetter: function(params: { data: { businessUnitName: string }; }) {
          return params.data.businessUnitName || "All";
        }
      },
      {
        headerName: 'Visibility',
        field: 'hasVisibility',
        hide: this.isAgencyUser,
        valueGetter: function(params: { data: { hasVisibility: boolean} }){
          return self.visibilityEnum[params.data.hasVisibility ? 0 : 1]
        }  
      },
      {
        headerName: 'Action',
        cellRenderer: 'buttonRenderer',
        cellRendererParams: {
          onClick: this.onEdit.bind(this),
          label: 'Edit'
        },
        width: 50,
        pinned: 'right'
      }   
    ];

    this.defaultColDef = {
      flex: 2,
      minWidth: 120,
      resizable: true,
      sortable: true,
      filter: true,
      enablePivot: true
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
        ],
        defaultToolPanel: 'columns',
    };
  }

  ngOnInit(): void {
    this.checkAgencyUser();    
    this.subscribeForFilterFormChange();
    this.setFileName();
    this.subscribeOnExportAction();
    this.updateUsers();
  }

  ngAfterViewInit(): void {
    // this.grid.rowHeight = GRID_CONFIG.initialRowHeight;
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
    this.filterForm.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe(() => this.dispatchNewPage());
  }

  private dispatchNewPage(): void {
    const { businessUnit, business } = this.filterForm.getRawValue();
    this.store.dispatch(new GetUsersPage(businessUnit, business || '', this.currentPage, this.pageSize));
  }

  private checkAgencyUser(): void {
    const user = this.store.selectSnapshot(UserState.user);
    this.isAgencyUser = user?.businessUnitType === BusinessUnitType.Agency;
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    var datasource = this.createServerSideDatasource();
    console.log(datasource);
    params.api.setServerSideDatasource(datasource);
  }

  createServerSideDatasource() {
    let self = this;
    this.dispatchNewPage();
    return {
      getRows: function (params: any) {
        setTimeout(()=> {
          // let postData = {
          //   name: "",
          //   pageNumber: params.request.endRow / self.paginationPageSize,
          //   pageSize: self.paginationPageSize,
          //   sortFields: params.request.sortModel
          // };
          self.usersPage$.pipe().subscribe((data: any) => {
            self.itemList = data.items;            
            params.successCallback(self.itemList, data.totalRecords);
          });
        }, 500);
      }
    }
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
