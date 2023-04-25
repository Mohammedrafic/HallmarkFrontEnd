import { ColDef, GridApi, GridOptions, GridReadyEvent } from '@ag-grid-community/core';
import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild, OnDestroy } from '@angular/core';
import { Select } from '@ngxs/store';
import { SpecialProjectMessages } from '@organization-management/specialproject/constants/specialprojects.constant';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { CustomNoRowsOverlayComponent } from '@shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';
import { GRID_CONFIG } from '@shared/constants';
import { OrgInterface } from '@shared/models/org-interface.model';
import { disabledBodyOverflow, windowScrollTop } from '@shared/utils/styles.utils';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { AppState } from 'src/app/store/app.state';

@Component({
  selector: 'app-org-interface-dialog',
  templateUrl: './org-interface-dialog.component.html',
  styleUrls: ['./org-interface-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgInterfaceDialogComponent extends AbstractGridConfigurationComponent implements OnInit,  OnDestroy {

  @Input() selectedOrgLog$: Subject<OrgInterface> = new Subject<OrgInterface>();
  @Input() openDialogue: Subject<boolean>;

  @ViewChild('sideOrgInterfaceDialog') sideOrgInterfaceDialog: DialogComponent;

  @Select(AppState.isDarkTheme)
  isDarkTheme$: Observable<boolean>;

  private isAlive = true;
  selectedOrgLogDataset:OrgInterface;
  private unsubscribe$: Subject<void> = new Subject();
  selectedOrgLogDataset$: Subject<OrgInterface> = new Subject<OrgInterface>();
  onSaveEvent$: Subject<boolean> = new Subject<boolean>();
  onClearEvent$: Subject<boolean> = new Subject<boolean>();
  public targetElement: HTMLElement | null = document.body.querySelector('#main');

  public rowSelection: 'single' | 'multiple' = 'multiple';
  public readonly gridConfig: typeof GRID_CONFIG = GRID_CONFIG;

  public commonColumn: ColDef = {
    sortable: true,
    resizable: true,
    filter: true,
    editable: true,
  }

  public gridApi!: GridApi;
  public rowData: any[] = [];

  public columnDefinitions: any[] = 
  [
    /*{
      field: '',
      headerName: 'Action',
      sortable: false,
      resizable: false,
      filter: false,
    },*/
    {
      field: 'id',
      headerName: 'id',
      hide: true,
      sortable: true,
      resizable: false,
      filter: false,
    },
    {
      field: 'name',
      headerName: 'name',
      ...this.commonColumn,
   //   cellRenderer: StatusTextCellrenderComponent
    },
   
    {
      field: 'fileName',
      headerName: 'fileName',
      ...this.commonColumn,
    },
    {
      field: 'folderId',
      headerName: 'folderId',
      ...this.commonColumn
    },
    {
      field: 'folderName',
      headerName: 'folderName',
      ...this.commonColumn,
    },
    {
      field: 'docType',
      headerName: 'docType',
      ...this.commonColumn,
    },
    {
      field: 'docTypeName',
      headerName: 'docTypeName',
      ...this.commonColumn,
    },
    {
      field: 'tags',
      headerName: 'tags',
      ...this.commonColumn,
    },
    {
      field: 'comments',
      headerName: 'comments',
      ...this.commonColumn,
    },
  ]

  constructor() { 
    super();
  }

  ngOnInit(): void {

    this.selectedOrgLog$.pipe(takeUntil(this.unsubscribe$)).subscribe((dataSet)=>{
      this.selectedOrgLogDataset$.next(dataSet);
    });

    this.openDialogue.pipe(takeWhile(() => this.isAlive)).subscribe((isOpen) => {
      if (isOpen) { 
        windowScrollTop();
        this.sideOrgInterfaceDialog.show();
        disabledBodyOverflow(true);
      } else {
        this.sideOrgInterfaceDialog.hide();
        disabledBodyOverflow(false);
      }
    });
  }

  public onClose(): void {
    this.sideOrgInterfaceDialog.hide();
    this.openDialogue.next(false);
    this.gridApi.setRowData(this.rowData);
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
    rowSelection: this.rowSelection,
    noRowsOverlayComponent: CustomNoRowsOverlayComponent,
    noRowsOverlayComponentParams: this.noRowsOverlayComponentParams,
  /*  onFilterChanged: (event: FilterChangedEvent) => {
      if (!event.api.getDisplayedRowCount()) {
        this.gridApi?.showNoRowsOverlay();
      }
      else {
        this.gridApi?.hideOverlay();
      }
    },*/
    suppressRowClickSelection: true,
  /*  onCellClicked: (e: CellClickedEvent) => {
      const column: any = e.column;
      if (column?.colId == documentsColumnField.Name) {
        this.documentPreview(e.data);
      }
    }*/
  };


  

  
  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.setRowData(this.rowData);
  }


  ngOnDestroy(): void {
    this.isAlive = false;
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
