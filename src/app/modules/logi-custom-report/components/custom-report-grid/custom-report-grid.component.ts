import { ColDef, FilterChangedEvent, GridOptions, ICellRendererParams, SelectionChangedEvent } from '@ag-grid-community/core';
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

import { SetHeaderState, ShowSideDialog, ShowToast } from 'src/app/store/app.actions';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { DatePipe } from '@angular/common';
import { UserState } from 'src/app/store/user.state';
import { Organisation } from '@shared/models/visibility-settings.model';
import { uniqBy } from 'lodash';
import { LogiCustomReportState } from '../../store/state/logi-custom-report.state';
import { LogiCustomReport, LogiCustomReportPage } from '../../store/model/logi-custom-report.model';
import { GetCustomReportPage, sharedDocs } from '../../store/actions/logi-custom-report.actions';
import { User } from '@shared/models/user.model';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { AssociateAgencyDto } from '@shared/models/logi-report-file';
import { MessageTypes } from '@shared/enums/message-types';
import { ShareOrganizationsData } from 'src/app/modules/document-library/store/model/document-library.model';
import { GetOrganizationsStructureAll } from 'src/app/security/store/security.actions';
import { ORGANIZATION_DATA_FIELDS } from '@admin/analytics/analytics.constant';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

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
  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;

  public organizationFields = ORGANIZATION_DATA_FIELDS;

  private isAlive = true;
  public totalRecordsCount$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public gridApi: any;
  private gridColumnApi: any;
  public isCRPopup: boolean = false;
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
  selectedCustomReportItem$: BehaviorSubject<LogiCustomReport> = new BehaviorSubject<LogiCustomReport>(null!);
  openCustomReportDialogue = new Subject<boolean>();
  private unsubscribe$: Subject<void> = new Subject();
  public organizations: Organisation[] = [];
  public isHalmarkSelected: boolean = false;

  public readonly gridConfig: typeof GRID_CONFIG = GRID_CONFIG;
  public downloadedFileName: string = '';
  public noRowsOverlayComponent: any = CustomNoRowsOverlayComponent;
  public user: any;
  public AssociateAgencyData: AssociateAgencyDto[] = [];
  organizationSwitch = true;

  public noRowsOverlayComponentParams: any = {
    noRowsMessageFunc: () => 'No Rows To Show',
  };
  public rowSelection: 'single' | 'multiple' = 'multiple';
  selectedOrgid: any

  public readonly columnDefs: ColumnDefinitionModel[] = [

    {
      field: 'id',
      hide: true,
      filter: false,
    },

    {
      headerName: 'View',
      cellRenderer: ButtonRendererComponent,
      width: 150,
      cellRendererParams: {
        onClick: this.onEdit.bind(this),
        label: 'View',
        suppressMovable: true,
        filter: false,
        sortable: false,
        menuTabs: []
      },
      headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true,
      checkboxSelection: true,
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
  formDailogTitle: string;
  isShare: boolean;
  dialogWidth: string;
  shareDocumentIds: any;
  rowvalues: number[];

  constructor(private store: Store, private datePipe: DatePipe, private formBuilder: FormBuilder) {
    super();
    this.store.dispatch(new SetHeaderState({ title: 'Custom Reports', iconName: 'trending-up' }));
    this.user = this.store.selectSnapshot(UserState.user) as User;
    if (this.user?.businessUnitType == BusinessUnitType.Hallmark) {
      this.isHalmarkSelected = true;
    }
    this.user = this.store.selectSnapshot(UserState.user);
    if (this.user?.id != null) {
      this.store.dispatch(new GetOrganizationsStructureAll(this.user?.id));
    }
  }
  shareForm: FormGroup;

  ngOnInit(): void {
    this.shareForm = this.formBuilder.group(
      {
        organizationid: new FormControl([], [Validators.required]),

      }
    )

    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: number) => {
      this.organizationData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
        if (data != null && data.length > 0) {
          this.organizations = uniqBy(data, 'organizationId');
        }
      });

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
    this.selectedCustomReportItem$.next(data.rowData);
    this.isCRPopup = true;
  }


  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridApi.setRowData(this.itemList);
  }

  public refreshParentComponent() {
    this.isCRPopup = false;
    this.dispatchNewPage({ currentPage: this.currentPage, pageSize: this.pageSize });
  }
  public dispatchNewPage(postData: any): void {

    if (localStorage.getItem('lastSelectedOrganizationId') === null) {
      this.store.dispatch(new GetCustomReportPage(this.organizations[0]?.organizationId, postData.currentPage, postData.pageSize));
    } else {
      this.store.dispatch(new GetCustomReportPage(JSON.parse((localStorage.getItem('lastSelectedOrganizationId') || '0')), postData.currentPage, postData.pageSize));
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
  onSelectionChanged(event: SelectionChangedEvent) {
    const selectedData = this.gridApi.getSelectedRows();
    this.rowvalues = selectedData.map((list: { id: any; }) => list.id)
  }

  public shareSelectedDocuments(event: any) {
    this.formDailogTitle = "";
    let selectedRows: any;
    selectedRows = this.gridApi.getSelectedRows();
    if (selectedRows.length > 0) {
      let selectedIds = selectedRows.map((item: any) => {
        return item.id;
      })

      this.isShare = true;
      this.dialogWidth = '600px'
      this.shareDocumentIds = selectedIds;

      this.store.dispatch(new ShowSideDialog(true));
    }
    else {
      this.store.dispatch([
        new ShowToast(MessageTypes.Warning, "Please select atleast one data."),
      ]);
    }
  }


  allOrgnizationsChange(value: any) {
    if (value.checked == true) {
      this.organizationSwitch = false;
      const orgId = this.organizations.map((list) => list.organizationId)
      this.shareForm.controls['organizationid'].setValue(orgId);
    }
    else if (value.checked == false) {
      this.organizationSwitch = true;
      this.shareForm.controls['organizationid'].setValue([]);

    }

  }
  public closeDialog() {

    this.store.dispatch(new ShowSideDialog(false));
  }

  handleOnSave() {

    this.shareForm.markAllAsTouched();
    if (this.shareForm.invalid) {
      return;
    }
    let paramsdata = {

      documentId: this.shareForm.value.organizationid,
      sharedDocumentIds: this.rowvalues
    }
    this.store.dispatch(new sharedDocs(paramsdata));
    this.closeDialog()
    this.shareForm.reset()
    this.rowvalues = []
  }

}

