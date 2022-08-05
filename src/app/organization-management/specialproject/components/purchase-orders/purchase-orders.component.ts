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
  IDatasource, IGetRowsParams, GridOptions, ICellRendererParams
} from '@ag-grid-community/core';
import { ColumnDefinitionModel } from '../../../../shared/components/grid/models/column-definition.model';
import { PurchaseOrdderColumnsDefinition } from '../../constants/specialprojects.constant';

@Component({
  selector: 'app-purchase-orders',
  templateUrl: './purchase-orders.component.html',
  styleUrls: ['./purchase-orders.component.scss']
})

export class PurchaseOrdersComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @Input() form: FormGroup;

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


  gridOptions: GridOptions = {
    pagination: true,
    cacheBlockSize: 2,
    paginationPageSize: 2,
    columnDefs: this.columnDefinitions,
    rowData:this.rowData
  };

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    this.gridApi.setRowData(this.rowData);
  }
}
