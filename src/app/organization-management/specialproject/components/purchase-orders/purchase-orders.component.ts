import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { PurchaseOrder, PurchaseOrderPage } from "@shared/models/purchase-order.model";
import { DatePipe } from '@angular/common';

import {
  CheckboxSelectionCallbackParams,
  GridApi,
  GridReadyEvent,
  HeaderCheckboxSelectionCallbackParams,
  GridOptions
} from '@ag-grid-community/core';
import { ColumnDefinitionModel } from '../../../../shared/components/grid/models/column-definition.model';
import { PurchaseOrdderColumnsDefinition } from '../../constants/specialprojects.constant';
import { GRID_CONFIG } from '../../../../shared/constants';

@Component({
  selector: 'app-purchase-orders',
  templateUrl: './purchase-orders.component.html',
  styleUrls: ['./purchase-orders.component.scss']
})

export class PurchaseOrdersComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @Input() form: FormGroup;
  public readonly gridConfig: typeof GRID_CONFIG = GRID_CONFIG;
  public gridApi!: GridApi;
  public rowData : PurchaseOrder[]=[];
  public rowSelection: 'single' | 'multiple' = 'single';
  public actionCellrenderParams: any = {
    handleOnEdit: (params: any) => {
      alert('edit')
    },
    handleOnDelete: (params: any) => {
      alert('delete')
    }
  }
  constructor(private datePipe: DatePipe) {
    super();
  }

  public readonly columnDefinitions: ColumnDefinitionModel[] = PurchaseOrdderColumnsDefinition(this.actionCellrenderParams,this.datePipe);
  
  ngOnInit(): void {
    this.rowData = [{
      id: 1,
      poName: 'test1',
      poDescription: 'testdesc',
      regionId: 1,
      regionName: 'testreg',
      locationId: 2,
      locationName: 'testloc',
      departmentId: 1,
      departmentName: 'testdept',
      skillId: 2,
      skillName: 'testskilln',
      budget: 100,
      startDate: new Date(),
      endDate: new Date()
    },
      {
        id: 2,
        poName: 'test2',
        poDescription: 'testdesc',
        regionId: 1,
        regionName: 'testreg',
        locationId: 2,
        locationName: 'testloc',
        departmentId: 1,
        departmentName: 'testdept',
        skillId: 2,
        skillName: 'testskilln',
        budget: 100,
        startDate: new Date(),
        endDate: new Date()
      }
      ,
      {
        id: 3,
        poName: 'test3',
        poDescription: 'testdesc',
        regionId: 1,
        regionName: 'testreg',
        locationId: 2,
        locationName: 'testloc',
        departmentId: 1,
        departmentName: 'testdept',
        skillId: 2,
        skillName: 'testskilln',
        budget: 100,
        startDate: new Date(),
        endDate: new Date()
      }
      ,
      {
        id: 4,
        poName: 'test4',
        poDescription: 'testdesc',
        regionId: 1,
        regionName: 'testreg',
        locationId: 2,
        locationName: 'testloc',
        departmentId: 1,
        departmentName: 'testdept',
        skillId: 2,
        skillName: 'testskilln',
        budget: 100,
        startDate: new Date(),
        endDate: new Date()
      }]
  }
  ngOnDestroy(): void {
  }

  checkboxSelection = (params: CheckboxSelectionCallbackParams) => {
    return params.columnApi.getRowGroupColumns().length === 0;
  };

  headerCheckboxSelection = (params: HeaderCheckboxSelectionCallbackParams)=> {
    return params.columnApi.getRowGroupColumns().length === 0;
  };

  onPageSizeChanged(event: any) {
    this.gridOptions.cacheBlockSize = Number(event.value.toLowerCase().replace("rows", ""));
    this.gridOptions.paginationPageSize = Number(event.value.toLowerCase().replace("rows", ""));
    if (this.gridApi != null) {
      this.gridApi.paginationSetPageSize(Number(event.value.toLowerCase().replace("rows", "")));
      this.gridApi.setRowData(this.rowData);
    }
  }

  public sideBar = {
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

  gridOptions: GridOptions = {
    pagination: true,
    cacheBlockSize: 2,
    paginationPageSize: 2,
    columnDefs: this.columnDefinitions,
    rowData: this.rowData,
    sideBar:this.sideBar
  };

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    this.gridApi.setRowData(this.rowData);
  }
}
