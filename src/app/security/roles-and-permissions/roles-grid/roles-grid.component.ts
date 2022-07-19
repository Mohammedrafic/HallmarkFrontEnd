import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { filter, Observable, takeWhile, takeUntil } from 'rxjs';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';

import { GridComponent, RowDataBoundEventArgs } from '@syncfusion/ej2-angular-grids';

import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { GRID_CONFIG } from '@shared/constants/grid-config';
import { ConfirmService } from '@shared/services/confirm.service';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from '@shared/constants/messages';
import { Role, RolesPage } from '@shared/models/roles.model';

import { ShowSideDialog } from 'src/app/store/app.actions';
import { GetRolesPage, RemoveRole } from '../../store/security.actions';
import { SecurityState } from '../../store/security.state';

import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import { ButtonRendererComponent } from '@shared/components/button/button-renderer/button-renderer.component';


enum Active {
  No,
  Yes,
}

@Component({
  selector: 'app-roles-grid',
  templateUrl: './roles-grid.component.html',
  styleUrls: ['./roles-grid.component.scss'],
})
export class RolesGridComponent extends AbstractGridConfigurationComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() filterForm: FormGroup;
  @Output() editRoleEvent = new EventEmitter();

  // @ViewChild('rolesGrid') grid: GridComponent;

  @Select(SecurityState.roleGirdData)
  public roleGirdData$: Observable<Role[]>;

  @Select(SecurityState.rolesPage)
  public rolesPage$: Observable<RolesPage>;

  public activeValueAccess = (_: string, { isActive }: Role) => {
    return Active[Number(isActive)];
  };
  public businessValueAccess = (_: string, { businessUnitName }: Role) => {
    return businessUnitName || "All";
  };
  public selIndex: number[] = [];
  public sortOptions = { columns: [{ field: 'businessUnitName', direction: 'Descending' }] };

  private isAlive = true;


  itemList: Array<Role> | undefined;
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
  constructor(private actions$: Actions, private store: Store, private confirmService: ConfirmService) {
    super();
    this.frameworkComponents = {
      buttonRenderer: ButtonRendererComponent,
    }
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
        field: 'businessUnitName',
        valueGetter: function(params: { data: { businessUnitName: string }; }) {
          return params.data.businessUnitName || "All";
        }
      },
      {
        field: 'name',
      },
      {
        field: 'isActive',
        valueGetter : (params: { data: { isActive: boolean}}) => { return Active[Number(params.data.isActive)] }
      },
      {
        headerName: '',
        cellRenderer: 'buttonRenderer',
        cellRendererParams: {
          onClick: this.onEdit.bind(this),
          label: 'Edit'
        },
        width: 100
      },
      {
        headerName: '',
        cellRenderer: 'buttonRenderer',
        cellRendererParams: {
          onClick: this.onRemove.bind(this),
          label: 'Delete'
        },
        width: 100
      }      
    ];

    this.defaultColDef = {
      flex: 1,
      minWidth: 120,
      resizable: true,
      sortable: true,
      filter: false
    };

    this.autoGroupColumnDef = {
      flex: 1,
      minWidth: 280,
      field: 'name',
    };
  }

  ngOnInit(): void {
    this.onDialogClose();
    this.dispatchNewPage();

    this.filterForm.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe(() => this.dispatchNewPage());
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
   
    return {
      getRows: function (params: any) {
        setTimeout(()=> {
          // let postData = {
          //   name: "",
          //   pageNumber: params.request.endRow / self.paginationPageSize,
          //   pageSize: self.paginationPageSize,
          //   sortFields: params.request.sortModel
          // };
          self.rolesPage$.pipe().subscribe((data: any) => {
            self.itemList = data.items;
            console.log(data.items);
            params.successCallback(self.itemList, data.totalRecords);
          });
        }, 500);
      }
    }
  }

  ngAfterViewInit(): void {
    // this.grid.rowHeight = GRID_CONFIG.initialRowHeight;
  }

  public rowDataBound(args: RowDataBoundEventArgs): void {
    const data = args.data as Role;
    if (data.isDefault) {
      args.row?.classList.add('default-role');
    }
  }

  dataBound() {
    // const a = this.grid.getRows();
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  public onEdit(data: unknown): void {
    this.editRoleEvent.emit(data);
  }

  public onRemove(data: Role): void {
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      })
      .subscribe((confirm) => {
        // this.grid.clearRowSelection();
        if (confirm && data.id) {
         this.store.dispatch(new RemoveRole(data.id))
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

  private dispatchNewPage(): void {
    const { businessUnit, business } = this.filterForm.getRawValue();
    this.store.dispatch(new GetRolesPage(businessUnit, business || '', this.currentPage, this.pageSize));
  }

  private onDialogClose(): void {
    this.actions$
      .pipe(
        ofActionSuccessful(ShowSideDialog),
        takeWhile(() => this.isAlive),
        filter(({ isDialogShown }) => !!!isDialogShown)
      )
      .subscribe(() => {
        // this.grid.clearRowSelection();
      });
  }
}
