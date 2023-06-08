import { Component, OnDestroy, OnInit, Input, Output, ViewEncapsulation, EventEmitter } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ConfirmService } from '@shared/services/confirm.service';
import { SpecialProjectMapping, SpecialProjectMappingPage } from "@shared/models/special-project-mapping.model";
import { CustomNoRowsOverlayComponent } from '@shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';
import {
  GridApi,
  GridReadyEvent,
  GridOptions,
  FilterChangedEvent
} from '@ag-grid-community/core';
import { ColumnDefinitionModel } from '@shared/components/grid/models/column-definition.model';
import { SpecialProjectMappingColumnsDefinition, SpecialProjectMessages } from '../../constants/specialprojects.constant';
import { Observable, Subject, takeUntil } from 'rxjs';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE, GRID_CONFIG } from '@shared/constants';
import { FormGroup } from '@angular/forms';
import { SpecialProjectMappingState } from '../../../store/special-project-mapping.state';
import { DeletSpecialProjectMapping, GetSpecialProjectMappings } from '../../../store/special-project-mapping.actions';
import { SpecilaProjectCategoryTableColumns } from '@organization-management/specialproject/enums/specialproject.enum';
import { SelectedSystemsFlag } from '@shared/components/credentials-list/interfaces';

@Component({
  selector: 'app-project-mapping',
  templateUrl: './project-mapping.component.html',
  styleUrls: ['./project-mapping.component.scss']
})
export class ProjectMappingComponent extends AbstractGridConfigurationComponent implements OnInit {
  @Input() form: FormGroup;
  @Input() showSelectSystem:boolean;
  @Input() selectedSystem: SelectedSystemsFlag;
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
    this.columnDefinitions.forEach(element => {
      if(element.field==SpecilaProjectCategoryTableColumns.System){
        if(this.showSelectSystem){
          element.hide=false
        }else{
          element.hide=true
        }
      }
        });
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

  public noRowsOverlayComponentParams: any = {
    noRowsMessageFunc: () => SpecialProjectMessages.NoRowsMessage,
  };

  gridOptions: GridOptions = {
    pagination: true,
    cacheBlockSize: this.pageSize,
    paginationPageSize: this.pageSize,
    columnDefs: this.columnDefinitions,
    rowData: this.rowData,
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

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.setRowData(this.rowData);
  }

  public getSpecialProjectMappings(): void {
    this.store.dispatch(new GetSpecialProjectMappings({
      getAll: true
    }));
    this.specialProjectMappingPage$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (!data || !data?.items.length) {
        this.gridApi?.showNoRowsOverlay();
        this.gridApi?.setRowData([]);
      }
      else {
        this.gridApi?.hideOverlay();
        if(this.selectedSystem.isIRP && this.selectedSystem.isVMS){
          this.rowData = data.items;
        }else if(this.selectedSystem.isVMS){
          this.rowData = data.items.filter(f=>f.includeInVMS==true);
        }else{
          this.rowData = data.items.filter(f=>f.includeInIRP==true);
        }
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
