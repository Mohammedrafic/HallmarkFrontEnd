import { Component, OnDestroy, OnInit, Input, Output, ViewEncapsulation, EventEmitter } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ConfirmService } from '@shared/services/confirm.service';
import { SpecialProjectMapping, SpecialProjectMappingPage } from "@shared/models/special-project-mapping.model";
import {
  GridApi,
  GridReadyEvent,
  GridOptions
} from '@ag-grid-community/core';
import { ColumnDefinitionModel } from '@shared/components/grid/models/column-definition.model';
import { SpecialProjectMappingColumnsDefinition } from '../../constants/specialprojects.constant';
import { Observable, Subject, takeUntil } from 'rxjs';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE, GRID_CONFIG } from '@shared/constants';
import { FormGroup } from '@angular/forms';
import { SpecialProjectMappingState } from '../../../store/special-project-mapping.state';
import { DeletSpecialProjectMapping, GetSpecialProjectMappings } from '../../../store/special-project-mapping.actions';

@Component({
  selector: 'app-project-mapping',
  templateUrl: './project-mapping.component.html',
  styleUrls: ['./project-mapping.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProjectMappingComponent extends AbstractGridConfigurationComponent implements OnInit {
  @Input() form: FormGroup;
  @Output() onEdit = new EventEmitter<SpecialProjectMapping>();
  @Select(SpecialProjectMappingState.specialProjectMappingPage)
  specialProjectMappingPage$: Observable<SpecialProjectMappingPage>;
  private unsubscribe$: Subject<void> = new Subject();
  public readonly gridConfig: typeof GRID_CONFIG = GRID_CONFIG;
  public gridApi!: GridApi;
  public rowData: SpecialProjectMapping[] = [];
  public rowSelection: 'single' | 'multiple' = 'single';
  public actionCellrenderParams: any = {
    handleOnEdit: (params: SpecialProjectMapping) => {
      this.onEdit.next(params);
    },
    handleOnDelete: (params: any) => {
      this.deleteSpecialProjectMapping(params);
    }
  }

  constructor(private store: Store, private confirmService: ConfirmService) {
    super();
  }
  public readonly columnDefinitions: ColumnDefinitionModel[] = SpecialProjectMappingColumnsDefinition(this.actionCellrenderParams);

  ngOnInit(): void {
    this.getSpecialProjectMappings();
  }

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
    cacheBlockSize: this.pageSize,
    paginationPageSize: this.pageSize,
    columnDefs: this.columnDefinitions,
    rowData: this.rowData,
    sideBar: this.sideBar
  };

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.setRowData(this.rowData);
  }

  public getSpecialProjectMappings(): void {
    this.store.dispatch(new GetSpecialProjectMappings({
      getAll: true
    }));
    this.specialProjectMappingPage$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data?.items) {
        this.rowData = data.items;
        this.gridApi?.setRowData(this.rowData);
      }
    });
  }

  deleteSpecialProjectMapping(params: any): void {
    this.addActiveCssClass(event);
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button'
      })
      .subscribe((confirm) => {
        if (confirm && params.id) {
          this.store.dispatch(new DeletSpecialProjectMapping(params.id)).subscribe(val => {
            this.getSpecialProjectMappings();
          });
        }
        this.removeActiveCssClass();
      });
  }
}
