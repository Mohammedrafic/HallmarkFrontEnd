import { Select, Store } from '@ngxs/store';
import { SetHeaderState, ShowFilterDialog } from '../../../store/app.actions';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, Inject, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GRID_CONFIG } from '@shared/constants';
import { BUSINESS_UNITS_VALUES } from '@shared/constants/business-unit-type-list';
import { FilteredItem } from '@shared/models/filter.model';
import { User } from '@shared/models/user.model';
import { User_DATA_FIELDS } from '@admin/alerts/alerts.constants';
import { BUSSINES_DATA_FIELDS } from 'src/app/security/roles-and-permissions/roles-and-permissions.constants';
import { UNIT_FIELDS } from 'src/app/security/user-list/user-list.constants';
import { ColDef, FilterChangedEvent, GridOptions, ExcelStyle, ICellRendererParams } from '@ag-grid-community/core';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { BehaviorSubject, Observable, Subject, map, takeUntil, takeWhile, filter, switchMap } from 'rxjs';
import { ColumnDefinitionModel } from '../../../shared/components/grid/models/column-definition.model';
import { DatePipe } from '@angular/common';
import { ControlTypes, ValueType } from '../../../shared/enums/control-types.enum';
import { CustomNoRowsOverlayComponent } from '../../../shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';
import { OrderStatusSummaryCustomReport, OrderType, OrderStatusSummaryReportFilters } from '../../../modules/custom-reports/store/model/order-status-summary-report.model';
import { OrderStatusSummaryCustomReportState } from '../../../modules/custom-reports/store/state/order-status-summary-report.state';
import * as OrderStatusSummaryReportActions from '../../../modules/custom-reports/store/actions/order-status-summary-report.actions';
import { DateTimeHelper } from '../../../core/helpers';
import { OrderStatusSummaryReportService } from '../../../modules/custom-reports/services/order-status-summary-report.services';
import { SideBarConfig, DefaultOrdersStatusSummaryGridColDef } from './order-status-summary.constants';

@Component({
  selector: 'app-order-status-summary',
  templateUrl: './order-status-summary.component.html',
  styleUrls: ['./order-status-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderStatusSummaryComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {

  public title: string = "Order Status Summary";
  public message: string = ''
  orderStatusSummaryReportForm: FormGroup;
  public businessUnits = BUSINESS_UNITS_VALUES;
  public bussinesDataFields = BUSSINES_DATA_FIELDS;
  public userDataFields = User_DATA_FIELDS;
  public unitFields = UNIT_FIELDS;
  public override filteredItems: FilteredItem[] = [];
  private isAlive = true;
  public userData: User[];
  public baseUrl: string = '';
  public gridApi: any;
  sideBar = SideBarConfig;
  public readonly gridConfig: typeof GRID_CONFIG = GRID_CONFIG;
  paginationPageSize: number;
  defaultColDef: ColDef = DefaultOrdersStatusSummaryGridColDef;
  cacheBlockSize: any;
  itemList: Array<OrderStatusSummaryCustomReport> = [];
  filterList: OrderStatusSummaryReportFilters = new OrderStatusSummaryReportFilters;
  public allOption: string = "All";
  private unsubscribe$: Subject<void> = new Subject();
  public filterColumns: any;
  public totalRecordsCount$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public lastOrgId: number;

  @Select(OrderStatusSummaryCustomReportState.CustomReportPage)
  public data$: Observable<OrderStatusSummaryCustomReport[]>;

  @Select(OrderStatusSummaryCustomReportState.OrderStatusSummaryFilters)
  public filters$: Observable<OrderStatusSummaryReportFilters[]>;

  regions$: { name: string }[] = [];
  regionFields: FieldSettingsModel = { text: 'name', value: 'name' };

  locations$: { name: string }[] = [];
  locationFields: FieldSettingsModel = { text: 'name', value: 'name' };

  departments$: { name: string }[] = [];
  departmentFields: FieldSettingsModel = { text: 'name', value: 'name' };

  skills$: { name: string }[] = [];
  skillFields: FieldSettingsModel = { text: 'name', value: 'name' };

  orderStatus$: { name: string }[] = [];
  orderStatuseFields: FieldSettingsModel = { text: 'name', value: 'name' };
  orderTypeFields: FieldSettingsModel = { text: 'name', value: 'id' };

  private orderFilterColumnsSetup(): void {
    this.filterColumns = {
      orderStatus: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Text,
        dataSource: this.orderStatus$,
        valueField: 'name',
        valueId: 'id',
      },
      region: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Text,
        dataSource: this.regions$,
        valueField: 'name',
        valueId: 'id',
      },
      location: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Text,
        dataSource: this.locations$,
        valueField: 'name',
        valueId: 'id',
      },
      department: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Text,
        dataSource: this.departments$,
        valueField: 'name',
        valueId: 'id',
      },
      skills: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Text,
        dataSource: this.skills$,
        valueField: 'name',
        valueId: 'id',
      },
      orderType: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Text,
        dataSource: Object.keys(OrderType).filter(type => isNaN(+type)),
        valueField: 'name',
        valueId: 'id',
      },
      orderstartdate: { type: ControlTypes.Date, valueType: ValueType.Text },
      orderenddate: { type: ControlTypes.Date, valueType: ValueType.Text },

    }
  }


  public readonly columnDefs: ColumnDefinitionModel[] = [
    {
      headerName: 'Region',
      field: 'region',
      minWidth: 250,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'Location',
      field: 'location',
      minWidth: 250,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'Location Id',
      field: 'locationId',
      minWidth: 250,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'Department',
      field: 'department',
      minWidth: 250,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'Department Id',
      field: 'departmentId',
      minWidth: 250,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'Skill',
      field: 'skill',
      minWidth: 250,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'Total Positions',
      field: 'totalPosition',
      minWidth: 250,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'Open',
      field: 'openPositions',
      minWidth: 250,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'InProgress',
      field: 'inProgress',
      minWidth: 250,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'Offered',
      field: 'offered',
      minWidth: 250,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'Accepted',
      field: 'accepted',
      minWidth: 250,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'Filled',
      field: 'filled',
      minWidth: 250,
      filter: true,
      sortable: true,
      resizable: true
    }
  ]
  constructor(private store: Store, private formBuilder: FormBuilder, private datePipe: DatePipe,
    private changeDetectorRef: ChangeDetectorRef, private dataService: OrderStatusSummaryReportService
  ) {
    super();
    this.store.dispatch(new SetHeaderState({ title: "Analytics", iconName: '' }));
  }

  ngOnInit(): void {
    this.getGridData();
    this.initForm();
    //this.getFilters();
    //this.store.dispatch(new OrderStatusSummaryReportActions.GetOrderStatusSummaryReportPage({}));
    //this.store.dispatch(new OrderStatusSummaryReportActions.GetOrderStatusSummaryFiltersByOrganization());
    this.store.dispatch([new OrderStatusSummaryReportActions.GetOrderStatusSummaryReportPage({}), new OrderStatusSummaryReportActions.GetOrderStatusSummaryFiltersByOrganization()]);
    
    this.setFilters();
    this.orderFilterColumnsSetup();
  }


  private initForm(): void {
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 7);
    this.orderStatusSummaryReportForm = this.formBuilder.group(
      {
        region: new FormControl([], []),
        location: new FormControl([], []),
        department: new FormControl([], []),
        skills: new FormControl([], []),
        orderType: new FormControl([], []),
        orderStatus: new FormControl([], []),
        orderstartdate: new FormControl(startDate),
        orderenddate: new FormControl(new Date(Date.now())),
      }
    );
  }

  public setFilters(): void {
    this.dataService.getFiltersByOrganizationId().pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.regions$ = data.region.map(item => ({ name: item }));
        this.locations$ = data.location.map(item => ({ name: item }));
        this.departments$ = data.department.map(item => ({ name: item }));
        this.skills$ = data.skills.map(item => ({ name: item }));
        this.orderStatus$ = data.orderStatus.map(item => ({ name: item }));
      });
  }

  public onFilterApply(): void {
    if (this.orderStatusSummaryReportForm.invalid) {
      return;
    }
    const payload = {
      ...this.orderStatusSummaryReportForm.value
    };
    payload.orderstartdate = DateTimeHelper.setUtcTimeZone(this.orderStatusSummaryReportForm.value.orderstartdate);
    payload.orderenddate = DateTimeHelper.setUtcTimeZone(this.orderStatusSummaryReportForm.value.orderenddate);
    payload.orderType = this.orderStatusSummaryReportForm.value.orderType.map((type: string) => OrderType[type as keyof typeof OrderType]).toString();
    this.store.dispatch(new OrderStatusSummaryReportActions.GetOrderStatusSummaryReportPage(payload));
    this.resetForm();
    this.store.dispatch(new ShowFilterDialog(false));
  }

  public onFilterClearAll() {
    this.resetForm();
  }

  public onFilterClose() {
    this.resetForm();
  }

  onBtExport() {
    const params = {
      fileName: 'Order Status Summary Report',
      sheetName: 'Order Status Summary Report'
    };
    this.gridApi.exportDataAsExcel(params);
  }

  public resetForm() {
    let region: [] = [];
    let location: [] = [];
    let department: [] = [];
    let skills: [] = [];
    let orderType: [] = [];
    let orderStatus: [] = [];
    let orderstartdate = new Date(Date.now());
    orderstartdate.setDate(orderstartdate.getDate() - 7);
    this.orderStatusSummaryReportForm.controls['region'].setValue(region);
    this.orderStatusSummaryReportForm.controls['location'].setValue(location);
    this.orderStatusSummaryReportForm.controls['department'].setValue(department);
    this.orderStatusSummaryReportForm.controls['skills'].setValue(skills);
    this.orderStatusSummaryReportForm.controls['orderType'].setValue(orderType);
    this.orderStatusSummaryReportForm.controls['orderStatus'].setValue(orderStatus);
    this.orderStatusSummaryReportForm.controls['orderstartdate'].setValue(orderstartdate);
    this.orderStatusSummaryReportForm.controls['orderenddate'].setValue(new Date(Date.now()));
  }

  public showFilters(): void {
    this.orderFilterColumnsSetup();
    this.store.dispatch(new ShowFilterDialog(true));
  }
  
  public noRowsOverlayComponentParams: any = {
    noRowsMessageFunc: () => 'No Rows To Show',
  };

  public getGridData(): void {
    this.data$.pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
      this.itemList = data;
      if (this.gridApi) {
        this.gridApi.setRowData(this.itemList);
      }
    });
  }

  public gridOptions: GridOptions = {
    pagination: true,
    cacheBlockSize: this.pageSize,
    paginationPageSize: this.pageSize,
    columnDefs: this.columnDefs,
    rowData: this.itemList,
    sideBar: this.sideBar,
    detailRowAutoHeight: true,
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

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridApi.setRowData(this.itemList);
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
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
