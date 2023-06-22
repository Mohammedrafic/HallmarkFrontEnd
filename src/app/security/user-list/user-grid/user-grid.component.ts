import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { DatePipe, formatDate } from '@angular/common';
import { FormGroup } from '@angular/forms';

import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import { GridComponent, RowDataBoundEventArgs } from '@syncfusion/ej2-angular-grids';
import { filter, map, Observable, Subject, take, takeWhile } from 'rxjs';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';

import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ButtonRendererComponent } from '@shared/components/button/button-renderer/button-renderer.component';
import { CustomNoRowsOverlayComponent } from '@shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';
import { GRID_CONFIG, RESEND_EMAIL_TEXT, RESEND_EMAIL_TITLE } from '@shared/constants';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { CreateUserStatus, STATUS_COLOR_GROUP } from '@shared/enums/status';
import { ButtonRenderedEvent } from '@shared/models/button.model';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { Role, RolesFilters, RolesPage } from '@shared/models/roles.model';
import { User, UsersPage } from '@shared/models/user-managment-page.model';
import { ShowExportDialog } from '../../../store/app.actions';
import { AppState } from '../../../store/app.state';
import { UserState } from '../../../store/user.state';
import { ExportUserList, GetRolesPage, GetUsersPage, ImportUsers, ResendWelcomeEmail } from '../../store/security.actions';
import { SecurityState } from '../../store/security.state';
import { Visibility } from './user-grid.enum';
import { ColDef } from '@ag-grid-community/core';
import { AutoGroupColDef, DefaultUserGridColDef, SideBarConfig, UserListExportOptions } from './user-grid.constant';
import { TypedValueGetterParams } from '@core/interface';
import { ConfirmService } from '@shared/services/confirm.service';

@Component({
  selector: 'app-user-grid',
  templateUrl: './user-grid.component.html',
  styleUrls: ['./user-grid.component.scss'],
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

  @Select(AppState.isDarkTheme)
  isDarkTheme$: Observable<boolean>;

  public userGridData$: Observable<User[]>;
  public hasVisibility = (_: string, { assigned }: User) => {
    return Visibility[Number(assigned)];
  };

  public columnsToExport = UserListExportOptions;
  public fileName: string;
  public defaultFileName: string;
  public readonly statusEnum = CreateUserStatus;
  public readonly visibilityEnum = Visibility;
  public isAgencyUser = false;
  public totalRecordsCount: number;
  private isAlive = true;
  itemList: Array<User> | undefined;
  public gridApi: any;
  private gridColumnApi: any;
  modules: any[] = [ServerSideRowModelModule, RowGroupingModule];
  rowModelType: any;
  serverSideInfiniteScroll: any;
  serverSideFilterOnServer: any;
  cacheBlockSize: any;
  pagination: boolean;
  paginationPageSize: number;

  defaultColDef: ColDef = DefaultUserGridColDef;
  autoGroupColumnDef: ColDef = AutoGroupColDef;
  columnDefs: ColDef[];
  filterText: string | undefined;
  frameworkComponents: any;
  sideBar = SideBarConfig;
  serverSideStoreType: any;
  maxBlocksInCache: any;
  filters: RolesFilters;
  public readonly gridConfig: typeof GRID_CONFIG = GRID_CONFIG;

  /**
   * TODO: remove datepipe with formatDate function.
   */
  constructor(
    private store: Store,
    private datePipe: DatePipe,
    private confirmService: ConfirmService,
    private actions$: Actions,
  ) {
    super();
    this.frameworkComponents = {
      buttonRenderer: ButtonRendererComponent,
    };
    /**
     * TODO: this is not needed. var codesmell.
     */
    var self = this;
    this.rowModelType = 'serverSide';
    this.serverSideStoreType = 'partial';
    (this.serverSideInfiniteScroll = true), (this.serverSideFilterOnServer = true), (this.pagination = true);
    (this.paginationPageSize = this.pageSize), (this.cacheBlockSize = this.pageSize);
    this.maxBlocksInCache = 1;
    /**
     * TODO: move to constant file.
     */
    this.columnDefs = [
      {
        headerName: 'Action',
        cellRenderer: 'buttonRenderer',
        cellRendererParams: {
          onClick: this.handleUserGridAction.bind(this),
          label: 'Edit Mail',
        },
        width: 50,
        pinned: 'left',
        suppressMovable: true,
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
        pinned: 'left',
        suppressMovable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          buttons: ['reset'],
          debounceMs: 1000,
          suppressAndOrCondition: true,
        },
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
        },
      },
      {
        headerName: 'Status',
        field: 'isDeleted',
        width: 50,
        /**
         * TODO: rework with arrow fn, remove self.
         */
        valueGetter: function (params: { data: { isDeleted: boolean } }) {
          return self.statusEnum[+!params.data.isDeleted];
        },
        pinned: 'left',
        suppressMovable: true,
        filter: false,
        sortable: false,
      },
      {
        field: 'email',
        filter: 'agTextColumnFilter',
        filterParams: {
          buttons: ['reset'],
          debounceMs: 1000,
          suppressAndOrCondition: true,
        },
      },
      {
        headerName: 'Roles',
        field: 'roleNames',
        sortable: false,
        filter: 'agSetColumnFilter',
        filterParams: {
          values: (params: { success: (arg0: any) => void }) => {
            /**
             * TODO: remove setTimeout.
             */
            setTimeout(() => {
              this.rolesPage$.pipe(takeWhile(() => this.isAlive)).subscribe((data) => {
                params.success(
                  data.items.map(function (item) {
                    return item.name;
                  })
                );
              });
            }, 3000);
          },
          buttons: ['reset'],
          refreshValuesOnOpen: true,
        },
      },
      {
        field: 'organization',
        /**
         * TODO: rework with arrow fn.
         */
        valueGetter: function (params: { data: { businessUnitName: string } }) {
          return params.data.businessUnitName || 'All';
        },
        filter: false,
      },
      {
        headerName: 'Visibility',
        field: 'hasVisibility',
        hide: this.isAgencyUser,
        /**
         * TODO: rework with arrow fn.
         */
        valueGetter: function (params: { data: { hasVisibility: boolean } }) {
          return self.visibilityEnum[params.data.hasVisibility ? 0 : 1];
        },
        filter: false,
        sortable: false,
      },
      {
        headerName: 'Last Login Date',
        field: 'lastLoginDate',
        filter: false,
        valueGetter: (params: TypedValueGetterParams<User>) => {
          if (params.data.lastLoginDate) {
            return formatDate(params.data.lastLoginDate, 'MM/dd/YYYY', 'en-US');
          }
          return '';
        },
      },
    ];
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
    this.watchForImport();
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  public handleUserGridAction(data: ButtonRenderedEvent): void {
    if (data.btnName === 'edit') {
      this.editUser(data);
    } else {
      this.resendWelcomeEmail(data);
    }
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
            businessUnitIds: business ? [business] : null,
            ids: this.selectedItems.length ? this.selectedItems.map((val) => val[this.idFieldName]) : null,
            ...this.filters,
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

  private editUser(data: ButtonRenderedEvent): void {
    this.editUserEvent.emit(data?.rowData);
  }

  private resendWelcomeEmail(data: ButtonRenderedEvent): void {
    this.confirmService
      .confirm(RESEND_EMAIL_TEXT, {
        title: RESEND_EMAIL_TITLE,
        okButtonLabel: 'Send',
        okButtonClass: 'send-button',
      })
      .pipe(
        filter(Boolean),
        take(1)
      ).subscribe(() => {
        this.store.dispatch(new ResendWelcomeEmail(data.rowData.id!));
      });
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
    this.filterForm.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe(() => {
      this.dispatchNewPage(), this.loadRoles();
    });
  }

  private dispatchNewPage(): void {
    const { businessUnit, business } = this.filterForm.getRawValue();
    this.store.dispatch(
      new GetUsersPage(businessUnit, business != 0 ? [business] : null, this.currentPage, this.pageSize, null, null)
    );
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
            filterModels: params.request.filterModel,
          };
          var filter: any;
          let jsonString = JSON.stringify(params.request.filterModel);
          if (jsonString != '{}') {
            var updatedJson = jsonString.replace('operator', 'logicalOperator');
            filter = JSON.parse(updatedJson);
          } else filter = null;

          var sort = postData.sortFields.length > 0 ? postData.sortFields : null;
          const { businessUnit, business } = self.filterForm.getRawValue();
          self.store.dispatch(
            new GetUsersPage(
              businessUnit,
              business != 0 ? [business] : null,
              isNaN(postData.pageNumber) ? self.currentPage : postData.pageNumber,
              postData.pageSize,
              sort,
              filter
            )
          );
          self.usersPage$.pipe(takeWhile(() => self.isAlive)).subscribe((data: any) => {
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

  loadRoles() {
    const { businessUnit, business } = this.filterForm.getRawValue();
    let businessUnitIds = [];
    if (business != null) {
      businessUnitIds.push(business);
    }
    this.store.dispatch(new GetRolesPage(businessUnit, businessUnitIds, 1, 1000, null, null, this.filters));
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

  private watchForImport(): void {
    this.actions$
    .pipe(
      ofActionSuccessful(ImportUsers),
      takeWhile(() => this.isAlive)
    )
    .subscribe(() => {
      this.dispatchNewPage();
    });
  }
}
