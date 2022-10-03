import { FilterChangedEvent, GridApi, GridOptions, GridReadyEvent } from '@ag-grid-community/core';
import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { Observable, Subject, takeUntil } from 'rxjs';
import { SpecialProjectMessages } from '../../../../../organization-management/specialproject/constants/specialprojects.constant';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { SetHeaderState } from '../../../../../store/app.actions';
import { DocumentLibraryColumnsDefinition } from '../../../constants/documents.constant';
import { DocumentsInfo, NodeItem } from '../../../store/model/document-library.model';
import { CustomNoRowsOverlayComponent } from '@shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';
import { DocumentLibraryState } from '../../../store/state/document-library.state';

@Component({
  selector: 'app-document-library',
  templateUrl: './document-library.component.html',
  styleUrls: ['./document-library.component.scss']
})
export class DocumentLibraryComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {

  public title: string = "Documents";
  private unsubscribe$: Subject<void> = new Subject();

  @Select(DocumentLibraryState.selectedDocumentNode)
  selectedDocNode$: Observable<NodeItem>;

  selectedDocumentNode: NodeItem | null;

  public gridApi!: GridApi;
  public rowData: DocumentsInfo[] = [];
  public rowSelection: 'single' | 'multiple' = 'single';

  public actionCellrenderParams: any = {
    handleOnEdit: (params: DocumentsInfo) => {
     // this.onEdit.next(params);
    },
    handleOnDelete: (params: any) => {
      //this.deleteSpecialProject(params);
    }
  }


  constructor(private store: Store, private datePipe: DatePipe) {
    super();
  }
  public readonly columnDefinitions: ColumnDefinitionModel[] = DocumentLibraryColumnsDefinition(this.actionCellrenderParams, this.datePipe);

  ngOnInit(): void {
    this.store.dispatch(new SetHeaderState({ title: 'Documents', iconName: 'folder' }));
    this.selectedDocNode$.pipe(takeUntil(this.unsubscribe$)).subscribe((nodeData) => {
      if (nodeData)
        this.selectedDocumentNode = nodeData;
    });
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

  public noRowsOverlayComponentParams: any = {
    noRowsMessageFunc: () => SpecialProjectMessages.NoRowsMessage,
  };

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


}
