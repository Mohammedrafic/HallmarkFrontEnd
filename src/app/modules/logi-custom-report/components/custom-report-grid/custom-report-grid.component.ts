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
import { SecurityState } from 'src/app/security/store/security.state';

import { SetHeaderState } from 'src/app/store/app.actions';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { DatePipe } from '@angular/common';
import { UserState } from 'src/app/store/user.state';
import { Organisation } from '@shared/models/visibility-settings.model';
import { uniqBy } from 'lodash';
import { LogiCustomReportState } from '../../store/state/logi-custom-report.state';
import { LogiCustomReport, LogiCustomReportPage } from '../../store/model/logi-custom-report.model';
import { GetCustomReportPage } from '../../store/actions/logi-custom-report.actions';

@Component({
  selector: 'app-custom-report-grid',
  templateUrl: './custom-report-grid.component.html',
  styleUrls: ['./custom-report-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomReportGridComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {

  @Select(LogiCustomReportState.CustomReportGridData)
  private _logInterfaceData$: Observable<LogiCustomReport[]>;

  @Select(LogiCustomReportState.CustomReportPage)
  public logInterfacePage$: Observable<LogiCustomReportPage>;

  @Select(AppState.isDarkTheme)
  isDarkTheme$: Observable<boolean>;

  @Select(UserState.lastSelectedOrganizationId)
  private lastSelectedOrganizationId$: Observable<number>;

  @Select(SecurityState.organisations)
  public organizationData$: Observable<Organisation[]>;

  @Select(SecurityState.logFileDownloadDetail)
  logFileDownloadDetail$: Observable<any>;

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
  itemList: Array<LogiCustomReport> = [];
  selectedCustomReportItem: LogiCustomReport;
  openCustomReportDialogue = new Subject<boolean>();
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
      width: 100,
      cellRendererParams: {
        onClick: this.onEdit.bind(this),
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
      headerName: 'Name',
      field: 'customReportName',
      minWidth: 250,
      filter: true,
      sortable: true,
      resizable: true
    },
   
    {
      headerName: 'Created Date',
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
        const str = this.datePipe?.transform(params.data.createdAt, 'MM/dd/yyyy') as string
        return str?.length > 0 ? str : "";
      },
      sortable: true,
      resizable: true
    },
 
  ];

  constructor(private store: Store, private datePipe: DatePipe) {
    super();
    this.store.dispatch(new SetHeaderState({ title: 'Custom Reports', iconName: 'trending-up' }));
  }

  ngOnInit(): void {

    this.organizationData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.organizations = [];
      if (data != null && data.length > 0) {
        this.organizations = uniqBy(data, 'organizationId');
        this.organizations.sort((a: any, b: any) => a.name.localeCompare(b.name));
      }
    });

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

    this.dispatchNewPage({ currentPage: this.currentPage, pageSize: this.pageSize });

    this.lastSelectedOrganizationId$.pipe(takeWhile(() => this.isAlive))
      .subscribe(() => {
        this.dispatchNewPage({ currentPage: this.currentPage, pageSize: this.pageSize });
        this.openCustomReportDialogue.next(false);
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
    this.selectedCustomReportItem = data.rowData;
    this.openCustomReportDialogue.next(true);
  }



 

 

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridApi.setRowData(this.itemList);
  }

  public refreshParentComponent() {
    this.dispatchNewPage({ currentPage: this.currentPage, pageSize: this.pageSize });
  }
  public dispatchNewPage(postData: any): void {
   
    if (localStorage.getItem('lastSelectedOrganizationId') === null) {
      this.store.dispatch(new GetCustomReportPage(this.organizations[0]?.organizationId, postData.currentPage, postData.pageSize));
    } else {
      this.store.dispatch(new GetCustomReportPage(JSON.parse((localStorage.getItem('lastSelectedOrganizationId') || '0')) , postData.currentPage, postData.pageSize));
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

