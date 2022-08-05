import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { SpecialProject, SpecialProjectPage } from "@shared/models/special-project.model";

import {
  CheckboxSelectionCallbackParams,
  GridApi,
  GridReadyEvent,
  HeaderCheckboxSelectionCallbackParams,
  GridOptions
} from '@ag-grid-community/core';
import { ColumnDefinitionModel } from '../../../../shared/components/grid/models/column-definition.model';
import { SpecialProjectColumnsDefinition } from '../../constants/specialprojects.constant';

@Component({
  selector: 'app-special-projects',
  templateUrl: './special-projects.component.html',
  styleUrls: ['./special-projects.component.scss']
})

export class SpecialProjectsComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @Input() form: FormGroup;

  public gridApi!: GridApi;
  public rowData: SpecialProject[]=[];
  public rowSelection: 'single' | 'multiple' = 'single';
  public actionCellrenderParams: any = {
    handleOnEdit: (params: any) => {
      alert('edit')
    },
    handleOnDelete: (params: any) => {
      alert('Delete')
    }
  }
  constructor(private datePipe: DatePipe) {
    super();
  }

  public readonly columnDefinitions: ColumnDefinitionModel[] = SpecialProjectColumnsDefinition(this.actionCellrenderParams, this.datePipe);
 
  ngOnInit(): void {
    this.rowData = [{
      id: 1,
      category: 'category1',
      name: 'name1',
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
        category: 'category2',
        name: 'name2',
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
        category: 'category3',
        name: 'name3',
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
        category: 'category4',
        name: 'name4',
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

  gridOptions: GridOptions = {
    pagination: true,
    cacheBlockSize: 2,
    paginationPageSize: 2,
    columnDefs: this.columnDefinitions,
    rowData:this.rowData,
  };

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    this.gridApi.setRowData(this.rowData);
  }
}
