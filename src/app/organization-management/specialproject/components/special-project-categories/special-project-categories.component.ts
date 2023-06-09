import { Component, OnDestroy, OnInit, Input, Output, ViewEncapsulation, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { CustomNoRowsOverlayComponent } from '@shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';
import {
  GridApi,
  GridReadyEvent,
  GridOptions,
  FilterChangedEvent
} from '@ag-grid-community/core';
import { ColumnDefinitionModel } from '@shared/components/grid/models/column-definition.model';
import { SpecialProjectCategoryColumnsDefinition, SpecialProjectMessages } from '../../constants/specialprojects.constant';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE, GRID_CONFIG } from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';
import { SpecialProjectCategoryState } from '../../../store/special-project-category.state';
import { DeletSpecialProjectCategory, GetSpecialProjectCategories } from '../../../store/special-project-category.actions';
import { SpecialProjectCategory, SpecialProjectCategoryPage } from '@shared/models/special-project-category.model';
import { SpecilaProjectCategoryTableColumns } from '@organization-management/specialproject/enums/specialproject.enum';
import { SelectedSystemsFlag } from '@shared/components/credentials-list/interfaces';

@Component({
  selector: 'app-special-project-category',
  templateUrl: './special-project-categories.component.html',
  styleUrls: ['./special-project-categories.component.scss']
})

export class SpecialProjectCategoryComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @Input() form: FormGroup;
  @Input() showSelectSystem:boolean;
  @Input() selectedSystem: SelectedSystemsFlag;
  @Output() onEdit = new EventEmitter<DeletSpecialProjectCategory>();

  @Select(SpecialProjectCategoryState.specialProjectCategoryPage)
  specialProjectCategoryPage$: Observable<SpecialProjectCategoryPage>;

  private unsubscribe$: Subject<void> = new Subject();
  public readonly gridConfig: typeof GRID_CONFIG = GRID_CONFIG;
  public gridApi!: GridApi;
  public rowData: SpecialProjectCategory[]=[];
  public rowSelection: 'single' | 'multiple' = 'single';
  public actionCellrenderParams: any = {
    handleOnEdit: (params: any) => {
      this.onEdit.next(params);
    },
    handleOnDelete: (params: any) => {
      this.deleteSpecialProjectCategory(params);
    }
  }
  constructor(private store: Store, private confirmService: ConfirmService) {
    super();
  }

  public readonly columnDefinitions: ColumnDefinitionModel[] = SpecialProjectCategoryColumnsDefinition(this.actionCellrenderParams);
  
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
    this.getSpecialProjectCategories();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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

  public getSpecialProjectCategories(): void {
    this.store.dispatch(new GetSpecialProjectCategories());
    this.specialProjectCategoryPage$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
        if (!data?.items.length) {
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

  deleteSpecialProjectCategory(params: any): void {
    this.addActiveCssClass(event);
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button'
      })
      .subscribe((confirm) => {
        if (confirm && params.id) {
          this.store.dispatch(new DeletSpecialProjectCategory(params.id)).subscribe(val => {
            this.getSpecialProjectCategories();
          });
        }
        this.removeActiveCssClass();
      });
  }
}
