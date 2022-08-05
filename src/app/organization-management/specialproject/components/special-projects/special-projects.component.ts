import { Component, OnDestroy, OnInit, Input, ViewEncapsulation } from '@angular/core';
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
import { Select, Store } from '@ngxs/store';
import { DeletSpecialProject, GetSpecialProjects, SaveSpecialProject } from '../../../store/special-project.actions';
import { SpecialProjectState } from '../../../store/special-project.state';
import { Observable, Subject, takeUntil } from 'rxjs';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE, GRID_CONFIG } from '../../../../shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';

@Component({
  selector: 'app-special-projects',
  templateUrl: './special-projects.component.html',
  styleUrls: ['./special-projects.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class SpecialProjectsComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @Input() form: FormGroup;

  @Select(SpecialProjectState.specialProjectPage)
  specialProjectPage$: Observable<SpecialProjectPage>;

  private unsubscribe$: Subject<void> = new Subject();
  public readonly gridConfig: typeof GRID_CONFIG = GRID_CONFIG;

  public gridApi!: GridApi;
  public rowData: SpecialProject[]=[];
  public rowSelection: 'single' | 'multiple' = 'single';
  public actionCellrenderParams: any = {
    handleOnEdit: (params: any) => {
      this.saveSpecialProject(params);
    },
    handleOnDelete: (params: any) => {
      this.deleteSpecialProject(params);
    }
  }
  constructor(private store: Store, private confirmService: ConfirmService,private datePipe: DatePipe) {
    super();
  }

  public readonly columnDefinitions: ColumnDefinitionModel[] = SpecialProjectColumnsDefinition(this.actionCellrenderParams, this.datePipe);
 
  ngOnInit(): void {
    
    this.getSpecialProjects();
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
    cacheBlockSize: 30,
    paginationPageSize: 30,
    columnDefs: this.columnDefinitions,
    rowData: this.rowData,
    sideBar: this.sideBar
  };

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    this.gridApi.setRowData(this.rowData);
  }


  getSpecialProjects(): void {
    this.store.dispatch(new GetSpecialProjects());
    this.specialProjectPage$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data?.items) {
        this.rowData = data.items;
        this.gridApi.setRowData(this.rowData);
      }
    });
  
  }

  saveSpecialProject(params: any):void{
    // var specialProject: SpecialProject;
    //   specialProject=
    //   {id:0,projectTypeId:1,
    //     regionId:8,regionName:'East',locationId:7,locationName:'Defiance Hospital',
    //     departmentId:654,departmentName:'CARDIOLOGY CLINIC ',startDate:new Date(),
    //     endDate:new Date(),isDeleted:false,
    //     name:'test001',organizationId:2,projectBudget:2000.90,skillId:7};
    //   this.store.dispatch(new SaveSpecialProject(specialProject));
  }

  deleteSpecialProject(params: any): void {
    this.addActiveCssClass(event);
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button'
      })
      .subscribe((confirm) => {
        if (confirm && params.id) {
          this.store.dispatch(new DeletSpecialProject(params.id));
        }
        this.removeActiveCssClass();
      });
  }
}
