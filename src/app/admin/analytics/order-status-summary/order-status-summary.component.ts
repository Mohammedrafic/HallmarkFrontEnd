import { Select, Store } from '@ngxs/store';
import { SetHeaderState, ShowFilterDialog } from '../../../store/app.actions';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { GRID_CONFIG } from '@shared/constants';
import { ColDef, FilterChangedEvent, GridOptions, IAggFuncParams } from '@ag-grid-community/core';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { BehaviorSubject, Observable, Subject, takeUntil, delay } from 'rxjs';
import { ColumnDefinitionModel } from '../../../shared/components/grid/models/column-definition.model';
import { ControlTypes, ValueType } from '../../../shared/enums/control-types.enum';
import { CustomNoRowsOverlayComponent } from '../../../shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';
import { OrderStatusSummaryCustomReport, OrderStatusSummaryReportFilters, Region, Department, Skills, Location, OrderTypeDto } from '../../../modules/custom-reports/store/model/order-status-summary-report.model';
import { OrderStatusSummaryCustomReportState } from '../../../modules/custom-reports/store/state/order-status-summary-report.state';
import * as OrderStatusSummaryReportActions from '../../../modules/custom-reports/store/actions/order-status-summary-report.actions';
import { OrderStatusSummaryReportService } from '../../../modules/custom-reports/services/order-status-summary-report.services';
import { SideBarConfig, DefaultOrdersStatusSummaryGridColDef } from './order-status-summary.constants';
import { UserState } from '../../../store/user.state';
import { sortByField } from '../../../shared/helpers/sort-by-field.helper';

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

  @Select(UserState.lastSelectedOrganizationId)
  public organizationId$: Observable<number>;

  @Select(OrderStatusSummaryCustomReportState.regions)
  public regionsData$: Observable<Region[] | void>;

  @Select(OrderStatusSummaryCustomReportState.locations)
  public locationsData$: Observable<Location[] | void>;

  @Select(OrderStatusSummaryCustomReportState.departments)
  public departmentsData$: Observable<Department[] | void>;

  @Select(OrderStatusSummaryCustomReportState.skills)
  public skillsData$: Observable<Skills[] | void>;

  @Select(OrderStatusSummaryCustomReportState.orderType)
  public orderTypeData$: Observable<OrderTypeDto[] | void>;

  regionFields: FieldSettingsModel = { text: 'region', value: 'regionId' };
  locationFields: FieldSettingsModel = { text: 'location', value: 'locationId' };
  departmentFields: FieldSettingsModel = { text: 'department', value: 'departmentId' };
  skillFields: FieldSettingsModel = { text: 'skill', value: 'skillId' };
  orderTypeFields: FieldSettingsModel = { text: 'orderTypeName', value: 'orderTypeId' };

  private organizationId: (number)[] = [];

  private orderFilterColumnsSetup(): void {
    this.filterColumns = {
      region: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Text,
        dataSource: [],
        valueField: 'region',
        valueId: 'regionId',
      },
      location: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Text,
        dataSource: [],
        valueField: 'location',
        valueId: 'locationId',
      },
      department: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Text,
        dataSource: [],
        valueField: 'department',
        valueId: 'departmentId',
      },
      skills: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Text,
        dataSource: [],
        valueField: 'skill',
        valueId: 'skillId',
      },
      orderType: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Text,
        dataSource: [],
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
      field: 'locationExtId',
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
      field: 'departmentExtId',
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
      resizable: true,
    },
    {
      headerName: 'Order Type',
      field: 'orderType',
      minWidth: 250,
      filter: true,
      sortable: true,
      resizable: true,
      cellRenderer: (params: any) => {
        if (params.node && params.node.rowPinned) {
          return `<strong> GrandTotal: </strong>`;
        }
        return params.value;
      },
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
      cellRenderer: (params: any) => {
        if (params.node && params.node.rowPinned) {
          return `<strong> ${params.value} </strong>`;
        }
        return params.value ?? 0;
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
      cellRenderer: (params: any) => {
        if (params.node && params.node.rowPinned) {
          return `<strong> ${params.value} </strong>`;
        }
        return params.value ?? 0;
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
      cellRenderer: (params: any) => {
        if (params.node && params.node.rowPinned) {
          return `<strong> ${params.value} </strong>`;
        }
        return params.value ?? 0;
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
      cellRenderer: (params: any) => {
        if (params.node && params.node.rowPinned) {
          return `<strong> ${params.value} </strong>`;
        }
        return params.value ?? 0;
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
      cellRenderer: (params: any) => {
        if (params.node && params.node.rowPinned) {
          return `<strong> ${params.value} </strong>`;
        }
        return params.value ?? 0;
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
      cellRenderer: (params: any) => {
        if (params.node && params.node.rowPinned) {
          return `<strong> ${params.value} </strong>`;
        }
        return params.value ?? 0;
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
      cellRenderer: (params: any) => {
        if (params.node && params.node.rowPinned) {
          return `<strong> ${params.value} </strong>`;
        }
        return params.value ?? 0;
      },
    }
  ]

  constructor(private store: Store,
    private formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super();
    this.store.dispatch(new SetHeaderState({ title: "Analytics", iconName: '' }));
  }

  ngOnInit(): void {
    this.initForm();
    this.organizationId$.pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
        if (data) {
          this.onFilterClearAll();
          this.organizationId = [];
          this.organizationId.push(data);
          this.store.dispatch(new OrderStatusSummaryReportActions.GetRegionsByOrganizations(this.organizationId));
          this.store.dispatch(new OrderStatusSummaryReportActions.GetSkillsByOrganizations());
          this.store.dispatch(new OrderStatusSummaryReportActions.GetOrderStatusSummaryFiltersByOrganization());
          this.store.dispatch(new OrderStatusSummaryReportActions.GetOrderStatusSummaryReportPage(this.orderStatusSummaryReportForm.value));
          this.setFilters();
          delay(500);
          this.orderFilterColumnsSetup();
          this.setFilterDefaultValues();
        }
      });
    this.getGridData();
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
      }
    );
  }

  public setFilters(): void {
    this.orderStatusSummaryReportForm.controls['location'].disable();
    this.orderStatusSummaryReportForm.controls['department'].disable();
  }

  public setDefaultValues(): void {
    const orderTypeExists = this.orderStatusSummaryReportForm.controls['orderType'].value.length;
    if (orderTypeExists === 0) {
      this.orderStatusSummaryReportForm.get('orderType')?.setValue([0, 3]);
    }
  }

  public setFilterDefaultValues(): void {
    this.orderStatusSummaryReportForm.get('region')?.setValue([]);
    this.orderStatusSummaryReportForm.get('location')?.setValue([]);
    this.orderStatusSummaryReportForm.get('department')?.setValue([]);
    this.orderStatusSummaryReportForm.get('skills')?.setValue([]);
    this.orderStatusSummaryReportForm.get('orderType')?.setValue([0, 3]);
  }

  private watchForReason(): void {
    this.orderStatusSummaryReportForm?.controls['region'].valueChanges
      .subscribe((regionid: number[]) => {
        this.filterLocations(regionid);
      });
  }

  public filterLocations(regionid: number[]): void {
    if (regionid.length > 0) {
      this.store.dispatch(new OrderStatusSummaryReportActions.GetLocationsByRegions(regionid.join(','), this.organizationId));
      this.orderStatusSummaryReportForm.controls['location'].enable();
    }
    else {
      this.orderStatusSummaryReportForm.controls['location'].disable();
      this.orderStatusSummaryReportForm.controls['location'].setValue([]);
    }
    this.changeDetectorRef.detectChanges();
  }

  private watchForLocation(): void {
    this.orderStatusSummaryReportForm?.controls['location'].valueChanges
      .subscribe((locationid: number[]) => {
        this.filterDepartments(locationid);
      });
  }

  public filterDepartments(locationid: number[]): void {
    if (locationid.length > 0) {
      this.store.dispatch(new OrderStatusSummaryReportActions.GetDepartmentsByLocations(locationid.join(','), this.organizationId));
      this.orderStatusSummaryReportForm.controls['department'].enable();
    }
    else {
      this.orderStatusSummaryReportForm.controls['department'].setValue([]);
      this.orderStatusSummaryReportForm.controls['department'].disable();
    }
    this.changeDetectorRef.detectChanges();
  }

  public onFilterApply(): void {
    if (this.orderStatusSummaryReportForm.invalid) {
      return;
    }
    var regionsData = this.orderStatusSummaryReportForm.controls['region'].value;
    var locationsData = this.orderStatusSummaryReportForm.controls['location'].value;
    var departmentsData = this.orderStatusSummaryReportForm.controls['department'].value;
    var skillsData = this.orderStatusSummaryReportForm.controls['skills'].value;
    if (this.orderStatusSummaryReportForm.controls['region'].value.length > 300) {     
      this.orderStatusSummaryReportForm.controls['region'].setValue([]);
    }
    if (this.orderStatusSummaryReportForm.controls['location'].value.length > 300) {
      this.orderStatusSummaryReportForm.controls['location'].setValue([]);
    }
    if (this.orderStatusSummaryReportForm.controls['department'].value.length > 300) {      
      this.orderStatusSummaryReportForm.controls['department'].setValue([]);
    }
    if (this.orderStatusSummaryReportForm.controls['skills'].value.length > 300) {
      this.orderStatusSummaryReportForm.controls['skills'].setValue([]);
    }
    const payload = {
      ...this.orderStatusSummaryReportForm.value
    };
    this.store.dispatch(new OrderStatusSummaryReportActions.GetOrderStatusSummaryReportPage(payload));
    this.orderStatusSummaryReportForm.controls['region'].setValue(regionsData);
    this.orderStatusSummaryReportForm.controls['location'].setValue(locationsData);
    this.orderStatusSummaryReportForm.controls['department'].setValue(departmentsData);
    this.orderStatusSummaryReportForm.controls['skills'].setValue(skillsData);
    this.store.dispatch(new ShowFilterDialog(false));
  }

  public onFilterClearAll() {
    this.resetForm();
  }

  public onFilterClose() {
  }
  
  onBtExport() {
    const params = {
      fileName: 'Order-Position Status Summary Report',
      sheetName: 'Order-Position Status Summary Report'
    };
    this.gridApi.exportDataAsExcel(params);
  }

  public resetForm() {
    let region: [] = [];
    let location: [] = [];
    let department: [] = [];
    let skills: [] = [];
    let orderType: [] = [];
    this.orderStatusSummaryReportForm.controls['region'].setValue(region);
    this.orderStatusSummaryReportForm.controls['location'].setValue(location);
    this.orderStatusSummaryReportForm.controls['department'].setValue(department);
    this.orderStatusSummaryReportForm.controls['skills'].setValue(skills);
    this.orderStatusSummaryReportForm.controls['orderType'].setValue(orderType);
  }

  public showFilters(): void {
    this.orderFilterColumnsSetup();
    this.store.dispatch(new ShowFilterDialog(true));
    this.setDefaultValues();
  }

  public noRowsOverlayComponentParams: any = {
    noRowsMessageFunc: () => 'No Rows To Show',
  };

  pinnedBottomRowData: any[] = [];

  public getGridData(): void {
    this.data$.pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
      this.itemList = data.map(item => {
        return {
          ...item,
          totalPositions: item.totalPositions ?? 0,
          openPositions: item.openPositions ?? 0,
          inProgress: item.inProgress ?? 0,
          offered: item.offered ?? 0,
          accepted: item.accepted ?? 0,
          filled: item.filled ?? 0,
          closed: item.closed ?? 0,
        }
      });
      this.totalRecordsCount$.next(data.length);
      if (this.gridApi) {
        this.gridApi.setRowData(this.itemList);
        this.updatePinnedBottomRowData();
      }
    });
  }

  updatePinnedBottomRowData() {
    const totalPositionsSum = this.itemList.reduce((sum, row) => sum + row.totalPositions, 0);
    const openPositionsSum = this.itemList.reduce((sum, row) => sum + row.openPositions, 0);
    const inProgressSum = this.itemList.reduce((sum, row) => sum + row.inProgress, 0);
    const offeredSum = this.itemList.reduce((sum, row) => sum + row.offered, 0);
    const acceptedSum = this.itemList.reduce((sum, row) => sum + row.accepted, 0);
    const filledSum = this.itemList.reduce((sum, row) => sum + row.filled, 0);
    const closedSum = this.itemList.reduce((sum, row) => sum + row.closed, 0);
    this.pinnedBottomRowData = [{
      totalPositions: totalPositionsSum, openPositions: openPositionsSum,
      inProgress: inProgressSum, offered: offeredSum, accepted: acceptedSum,
      filled: filledSum, closed: closedSum, orderType: 'GrandTotal:',
    },
    ];
    this.gridApi.setPinnedBottomRowData(this.pinnedBottomRowData);
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
