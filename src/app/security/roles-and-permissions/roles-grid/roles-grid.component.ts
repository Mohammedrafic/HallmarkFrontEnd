import { ExportRoleList, GetBusinessByUnitType, GetRolesPage, RemoveRole } from '../../store/security.actions';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { filter, Observable, Subject, take, takeWhile } from 'rxjs';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';

import { RowDataBoundEventArgs } from '@syncfusion/ej2-angular-grids';

import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { GRID_CONFIG } from '@shared/constants/grid-config';
import { ConfirmService } from '@shared/services/confirm.service';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from '@shared/constants/messages';
import { Role, RolesFilters, RolesPage } from '@shared/models/roles.model';
import { FilterService } from '@shared/services/filter.service';
import { PermissionsTree } from '@shared/models/permission.model';
import { rolesFilterColumns } from 'src/app/security/roles-and-permissions/roles-and-permissions.constants';

import { ShowExportDialog, ShowSideDialog } from 'src/app/store/app.actions';
import { SecurityState } from '../../store/security.state';

import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import { ButtonRendererComponent } from '@shared/components/button/button-renderer/button-renderer.component';
import { BusinessUnit } from '@shared/models/business-unit.model';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { DatePipe } from '@angular/common';
import { CustomNoRowsOverlayComponent } from '@shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';
import { AppState } from '../../../store/app.state';

enum Active {
  No,
  Yes,
}

@Component({
  selector: 'app-roles-grid',
  templateUrl: './roles-grid.component.html',
  styleUrls: ['./roles-grid.component.scss'],
})
export class RolesGridComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @Input() filterForm: FormGroup;
  @Input() filteredItems$: Subject<number>;

  @Output() editRoleEvent = new EventEmitter();
  @Input() export$: Subject<ExportedFileType>;

  @Select(SecurityState.roleGirdData)
  public roleGirdData$: Observable<Role[]>;

  @Select(SecurityState.rolesPage)
  public rolesPage$: Observable<RolesPage>;

  @Select(SecurityState.bussinesData)
  public bussinesData$: Observable<BusinessUnit[]>;
  @Select(SecurityState.permissionsTree)
  public permissionsTree$: Observable<PermissionsTree>;

  @Select(AppState.isDarkTheme)
  isDarkTheme$: Observable<boolean>;

  public activeValueAccess = (_: string, { isActive }: Role) => {
    return Active[Number(isActive)];
  };
  public businessValueAccess = (_: string, { businessUnitName }: Role) => {
    return businessUnitName || 'All';
  };
  public selIndex: number[] = [];
  public sortOptions = { columns: [{ field: 'businessUnitName', direction: 'Descending' }] };
  public filterColumns = rolesFilterColumns;
  public readonly gridConfig: typeof GRID_CONFIG = GRID_CONFIG;

  private filters: RolesFilters = {};
  private isAlive = true;
  public totalRecordsCount: number;

  itemList: Array<Role> | undefined;
  public gridApi: any;
  private gridColumnApi: any;
  modules: any[] = [ServerSideRowModelModule, RowGroupingModule];
  rowModelType: any;
  serverSideInfiniteScroll: any;
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

  public columnsToExport: ExportColumn[] = [
    { text: 'Business Unit Name', column: 'BusinessUnitName' },
    { text: 'Role Name', column: 'Name' },
    { text: 'Active', column: 'Active' },
  ];

  public fileName: string;
  public defaultFileName: string;

  constructor(
    private actions$: Actions,
    private store: Store,
    private confirmService: ConfirmService,
    private datePipe: DatePipe,
    private filterService: FilterService
  ) {
    super();
    this.frameworkComponents = {
      buttonRenderer: ButtonRendererComponent,
    };
    this.rowModelType = 'serverSide';
    (this.serverSideInfiniteScroll = true), (this.pagination = true);
    (this.paginationPageSize = this.pageSize), (this.cacheBlockSize = this.pageSize);
    this.serverSideStoreType = 'partial';
    this.maxBlocksInCache = 1;
    this.columnDefs = [
      {
        headerName: 'Action',
        cellRenderer: 'buttonRenderer',
        cellRendererParams: {
          onClick: this.onEdit.bind(this),
          label: 'Edit',
        },
        pinned: 'left',
        suppressMovable: true,
        filter: false,
        sortable: false,
        menuTabs: [],
      },
      {
        headerName: '',
        cellRenderer: 'buttonRenderer',
        cellRendererParams: {
          onClick: this.onRemove.bind(this),
          label: 'Delete',
        },
        valueGetter: (params: { data: { canDelete: string } }) => {
         return params.data.canDelete = 'CanEditRolesPermissions'
        },
        pinned: 'left',
        suppressMovable: true,
        filter: false,
        sortable: false,
        menuTabs: [],
      },
      {
        field: 'id',
        hide: true,
      },
      {
        field: 'businessUnitName',
        filter: 'agSetColumnFilter',
        filterParams: {
          values: (params: { success: (arg0: any) => void }) => {
            setTimeout(() => {
              this.bussinesData$.pipe(takeWhile(() => this.isAlive)).subscribe((data) => {
                params.success(
                  data.map(function (item) {
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
        field: 'name',
        filter: 'agTextColumnFilter',
        filterParams: {
          buttons: ['reset'],
          debounceMs: 1000,
          suppressAndOrCondition: true,
        },
      },
      {
        header: 'Active',
        field: 'isActive',
        valueGetter: (params: { data: { isActive: boolean } }) => {
          return Active[Number(params.data.isActive)];
        },
        suppressMovable: true,
        filter: false,
        sortable: false,
        menuTabs: [],
      },
    ];

    this.defaultColDef = {
      flex: 1,
      minWidth: 120,
      resizable: true,
      sortable: true,
      filter: false,
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
    this.onDialogClose();
    this.filterForm.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe(() => {
      this.dispatchNewPage();
      this.getBusinessByUnitType();
    });
    this.subscribeOnExportAction();
    this.onPermissionsTreeChanged();
  }

  getBusinessByUnitType() {
    const { businessUnit } = this.filterForm.getRawValue();
    this.store.dispatch(new GetBusinessByUnitType(businessUnit));
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
          self.rolesPage$.pipe(takeWhile(() => self.isAlive)).subscribe((data: any) => {
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

  public rowDataBound(args: RowDataBoundEventArgs): void {
    const data = args.data as Role;
    if (data.isDefault) {
      args.row?.classList.add('default-role');
    }
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  public onEdit(data: any): void {
    this.editRoleEvent.emit(data.rowData);
  }

  public onRemove(data: any): void {
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      }).pipe(
        take(1)
      ).subscribe((confirm) => {
        if (confirm && data.rowData.id) {
          this.store.dispatch(new RemoveRole(data.rowData.id));
          var datasource = this.createServerSideDatasource();
          this.gridApi.setServerSideDatasource(datasource);
        }
      });
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.dispatchNewPage();
    }
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

  public dispatchNewPage(sortModel: any = null, filterModel: any = null): void {
    const { businessUnit, business } = this.filterForm.getRawValue();
    this.store.dispatch(
      new GetRolesPage(
        businessUnit,
        business || null,
        this.currentPage,
        this.pageSize,
        sortModel,
        filterModel,
        this.filters
      )
    );
  }

  private onDialogClose(): void {
    this.actions$
      .pipe(
        ofActionSuccessful(ShowSideDialog),
        takeWhile(() => this.isAlive),
        filter(({ isDialogShown }) => !!!isDialogShown)
      )
      .subscribe(() => {});
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
      new ExportRoleList(
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
  }

  private subscribeOnExportAction(): void {
    this.export$.pipe(takeWhile(() => this.isAlive)).subscribe((event: ExportedFileType) => {
      this.defaultFileName = `Security/Role List ${this.generateDateTime(this.datePipe)}`;
      this.defaultExport(event);
    });
  }

  private onPermissionsTreeChanged(): void {
    this.permissionsTree$.pipe(takeWhile(() => this.isAlive)).subscribe((permissions: PermissionsTree) => {
      this.filterColumns['permissionsIds'].dataSource = permissions;
    });
  }
}
