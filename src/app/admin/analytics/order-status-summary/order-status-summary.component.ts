import { Select, Store } from '@ngxs/store';
import { SetHeaderState, ShowFilterDialog } from '../../../store/app.actions';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, Inject, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GRID_CONFIG } from '@shared/constants';
import { ColDef, FilterChangedEvent, GridOptions, IAggFuncParams, ICellRendererParams } from '@ag-grid-community/core';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { BehaviorSubject, Observable, Subject, map, takeUntil, takeWhile, filter, switchMap } from 'rxjs';
import { ColumnDefinitionModel } from '../../../shared/components/grid/models/column-definition.model';
import { DatePipe } from '@angular/common';
import { ControlTypes, ValueType } from '../../../shared/enums/control-types.enum';
import { CustomNoRowsOverlayComponent } from '../../../shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';
import { OrderStatusSummaryCustomReport, OrderType, OrderStatusSummaryReportFilters, Region, Department, Skills, Location } from '../../../modules/custom-reports/store/model/order-status-summary-report.model';
import { OrderStatusSummaryCustomReportState } from '../../../modules/custom-reports/store/state/order-status-summary-report.state';
import * as OrderStatusSummaryReportActions from '../../../modules/custom-reports/store/actions/order-status-summary-report.actions';
import { OrderStatusSummaryReportService } from '../../../modules/custom-reports/services/order-status-summary-report.services';
import { SideBarConfig, DefaultOrdersStatusSummaryGridColDef } from './order-status-summary.constants';
import { UserState } from '../../../store/user.state';

@Component({
  selector: 'app-order-status-summary',
  templateUrl: './order-status-summary.component.html',
  styleUrls: ['./order-status-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderStatusSummaryComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {

  public title: string = "Order/Position Status Summary";
  public message: string = ''
  orderStatusSummaryReportForm: FormGroup;
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

  @Select(OrderStatusSummaryCustomReportState.CustomReportPage)
  public data$: Observable<OrderStatusSummaryCustomReport[]>;

  @Select(OrderStatusSummaryCustomReportState.OrderStatusSummaryFilters)
  public filters$: Observable<OrderStatusSummaryReportFilters>;

  @Select(UserState.lastSelectedOrganizationId)
  public organizationId$: Observable<string | null>;

  regions$: Region[] = [];
  regionFields: FieldSettingsModel = { text: 'region', value: 'regionId' };

  locations$: Location[] = [];
  filteredLocations$: Location[] = [];
  locationFields: FieldSettingsModel = { text: 'location', value: 'locationId' };

  departments$: Department[] = [];
  filteredDepartments$: Department[] = [];
  departmentFields: FieldSettingsModel = { text: 'department', value: 'departmentId' };

  skills$: Skills[] = [];
  skillFields: FieldSettingsModel = { text: 'skill', value: 'skillId' };

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
        valueId: 'name',
      },
      region: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Text,
        dataSource: this.regions$,
        valueField: 'region',
        valueId: 'regionId',
      },
      location: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Text,
        dataSource: this.filteredLocations$,
        valueField: 'location',
        valueId: 'locationId',
      },
      department: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Text,
        dataSource: this.filteredDepartments$,
        valueField: 'department',
        valueId: 'departmentId',
      },
      skills: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Text,
        dataSource: this.skills$,
        valueField: 'skill',
        valueId: 'skillId',
      },
      orderType: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Text,
        dataSource: Object.keys(OrderType).filter(type => isNaN(+type)),
        valueField: 'name',
        valueId: 'id',
      },
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
      headerName: 'Location ID',
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
      headerName: 'Department ID',
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
      headerName: 'Order ID',
      field: 'orderID',
      minWidth: 250,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'Total Positions',
      headerTooltip: 'Total Positions created',
      field: 'totalPositions',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true,
      aggFunc: this.customAggregate,
      valueFormatter: (params) => {
        if (params.node && params.node.footer) {
          return 'Total:' + params.value;
        }
        return params.value;
      },
    },
    {
      headerName: 'Open',
      headerTooltip: 'Positions not yet in progress',
      field: 'openPositions',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true,
      aggFunc: this.customAggregate,
      valueFormatter: (params) => {
        if (params.node && params.node.footer) {
          return 'Total:' + params.value;
        }
        return params.value;
      },
    },
    {
      headerName: 'InProgress',
      headerTooltip: 'Positions with applied or Offered Candidates',
      field: 'inProgress',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true,
      aggFunc: this.customAggregate,
      valueFormatter: (params) => {
        if (params.node && params.node.footer) {
          return 'Total:' + params.value;
        }
        return params.value;
      },
    },
    {
      headerName: 'Offered',
      headerTooltip: 'Positions with offers made to candidates',
      field: 'offered',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true,
      aggFunc: this.customAggregate,
      valueFormatter: (params) => {
        if (params.node && params.node.footer) {
          return 'Total:' + params.value;
        }
        return params.value;
      },
    },
    {
      headerName: 'Accepted',
      headerTooltip: 'Positions with offers accepted by Candidates',
      field: 'accepted',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true,
      aggFunc: this.customAggregate,
      valueFormatter: (params) => {
        if (params.node && params.node.footer) {
          return 'Total:' + params.value;
        }
        return params.value;
      },
    },
    {
      headerName: 'Filled',
      headerTooltip: 'Positions with confirmed selections',
      field: 'filled',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true,
      aggFunc: this.customAggregate,
      valueFormatter: (params) => {
        if (params.node && params.node.footer) {
          return 'Total:' + params.value;
        }
        return params.value;
      },
    },
    {
      headerName: 'Closed',
      headerTooltip: 'Closed and Cancelled Positions',
      field: 'closed',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true,
      aggFunc: this.customAggregate,
      valueFormatter: (params) => {
        if (params.node && params.node.footer) {
          return 'Total:' + params.value;
        }
        return params.value;
      },
    }
  ]
  constructor(private store: Store, private formBuilder: FormBuilder, private datePipe: DatePipe,
    private changeDetectorRef: ChangeDetectorRef, private dataService: OrderStatusSummaryReportService
  ) {
    super();
    this.store.dispatch(new SetHeaderState({ title: "Analytics", iconName: '' }));
  }

  ngOnInit(): void {
    this.organizationId$.pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.store.dispatch([new OrderStatusSummaryReportActions.GetOrderStatusSummaryReportPage({}),
          new OrderStatusSummaryReportActions.GetOrderStatusSummaryFiltersByOrganization()]);
        this.onFilterClearAll();
        this.setFilters();
      });
    this.getGridData();
    this.initForm();
    this.setFilters();
    this.orderFilterColumnsSetup();
    this.watchForReason();
    this.watchForLocation();
  }

  customAggregate(params: IAggFuncParams): any {
    return params.values.reduce((sum, value) => sum + value, 0);
  }

  private initForm(): void {
    this.orderStatusSummaryReportForm = this.formBuilder.group(
      {
        region: new FormControl([], []),
        location: new FormControl([], []),
        department: new FormControl([], []),
        skills: new FormControl([], []),
        orderType: new FormControl([], []),
        orderStatus: new FormControl([], []),
      }
    );
  }

  public setFilters(): void {
    this.dataService.getFiltersByOrganizationId().pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.regions$ = data.region.map(item => ({ region: item.region, regionId: item.regionId }));
        this.locations$ = data.location.map(item => ({ locationId: item.locationId, location: item.location, regionId: item.regionId }));
        this.departments$ = data.department.map(item => ({ departmentId: item.departmentId, department: item.department, locationId: item.locationId }));
        this.skills$ = data.skills.map(item => ({ skillId: item.skillId, skill: item.skill }));
        this.orderStatus$ = data.orderStatus.map(item => ({ name: item }));
      });
  }

  private watchForReason(): void {
    this.orderStatusSummaryReportForm?.controls['region'].valueChanges
      .subscribe((regionid: number[]) => {
        this.filterLocations(regionid);
      });
  }

  public filterLocations(regionid: number[]): void {
    this.filteredLocations$ = this.locations$.filter(items => regionid.includes(items.regionId));
    this.orderStatusSummaryReportForm.controls['location'].setValue([]);
    this.filterColumns.location.dataSource = this.filteredLocations$;
    this.changeDetectorRef.detectChanges();
  }

  private watchForLocation(): void {
    this.orderStatusSummaryReportForm?.controls['location'].valueChanges
      .subscribe((locationid: number[]) => {
        this.filterDepartments(locationid);
      });
  }

  public filterDepartments(locationid: number[]): void {
    this.filteredDepartments$ = this.departments$.filter(items => locationid.includes(items.locationId));
    this.orderStatusSummaryReportForm.controls['department'].setValue([]);
    this.filterColumns.department.dataSource = this.filteredDepartments$;
    this.changeDetectorRef.detectChanges();
  }

  public onFilterApply(): void {
    if (this.orderStatusSummaryReportForm.invalid) {
      return;
    }
    const payload = {
      ...this.orderStatusSummaryReportForm.value
    };
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
      fileName: 'Order/Position Status Summary Report',
      sheetName: 'Order/Position Status Summary Report'
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
    this.orderStatusSummaryReportForm.controls['region'].setValue(region);
    this.orderStatusSummaryReportForm.controls['location'].setValue(location);
    this.orderStatusSummaryReportForm.controls['department'].setValue(department);
    this.orderStatusSummaryReportForm.controls['skills'].setValue(skills);
    this.orderStatusSummaryReportForm.controls['orderType'].setValue(orderType);
    this.orderStatusSummaryReportForm.controls['orderStatus'].setValue(orderStatus);
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
    groupIncludeTotalFooter: true,
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
