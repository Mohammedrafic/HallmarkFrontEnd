import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Actions, Select, Store, ofActionSuccessful } from '@ngxs/store';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import { Observable, Subject, takeUntil } from 'rxjs';
import { SetHeaderState } from 'src/app/store/app.actions';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { MspListColumnsDefinition, MspListDto } from '../constant/msp.constant';
import { CellClickedEvent, FilterChangedEvent, GridApi, GridOptions, GridReadyEvent } from '@ag-grid-community/core';
import { CustomNoRowsOverlayComponent } from '@shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';
import { SpecialProjectMessages } from '@organization-management/specialproject/constants/specialprojects.constant';
import { AppState } from 'src/app/store/app.state';
import { GRID_CONFIG } from '@shared/constants';
import { MspState } from '../store/state/msp.state';
import { GetMsps, RemoveMspSucceeded } from '../store/actions/msp.actions';
import { MSP, MspListPage } from '../store/model/msp.model';
import { AgencyStatus } from '@shared/enums/status';
@Component({
  selector: 'app-msp-list',
  templateUrl: './msp-list.component.html',
  styleUrls: ['./msp-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MspListComponent extends AbstractPermissionGrid implements OnInit, OnDestroy {

  public gridApi!: GridApi;  
  private unsubscribe$: Subject<void> = new Subject();
  public columnDefinitions: ColumnDefinitionModel[] = MspListColumnsDefinition();
  public rowData: MspListDto[] = [];
  public rowSelection: 'single' | 'multiple' = 'multiple';
  public readonly gridConfig: typeof GRID_CONFIG = GRID_CONFIG;
  public totalRecordsCount: number = 0;
  
  @Select(AppState.isDarkTheme)
  isDarkTheme$: Observable<boolean>;

  @Select(MspState.getMspList)
  mspLists$: Observable<MspListPage>;

  constructor(
    protected override store: Store,
    private router: Router,
    private actions$: Actions,
    private formBuilder: FormBuilder
  ) {
    super(store);
    this.store.dispatch(new SetHeaderState({ title: 'MSP List', iconName: 'briefcase' }));
  }


  override ngOnInit(): void {
    super.ngOnInit();
    this.store.dispatch(new GetMsps());
    this.subscribeOnMspList(); 
    this.startGetDeleteActionWatching()
  }

  private subscribeOnMspList(): void {
    this.mspLists$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: MspListPage) => {
        this.rowData = data?.items;    
        this.rowData?.forEach((msp) => {
          msp.status = this.getStatusString(msp.status);
        });
        this.totalRecordsCount = data?.totalCount;
        this.gridApi?.setRowData(this.rowData);
      });
  }


   getStatusString(status: AgencyStatus | null): string {
    if (status === null) {
      return ''; 
    }
    return AgencyStatus[status]; 
  }
  
  private startGetDeleteActionWatching(): void {
    this.actions$
      .pipe(ofActionSuccessful(RemoveMspSucceeded))
      .subscribe((logo: { payload: MSP }) => {
    this.store.dispatch(new GetMsps());
    this.subscribeOnMspList()
      });
  }


  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }  

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.setRowData(this.rowData);
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
    rowSelection: this.rowSelection,
    noRowsOverlayComponent: CustomNoRowsOverlayComponent,
    noRowsOverlayComponentParams: this.noRowsOverlayComponentParams,
    onFilterChanged: (event: FilterChangedEvent) => {
      if (!event.api.getDisplayedRowCount()) {
        this.gridApi?.showNoRowsOverlay();
      }
      else {
        this.gridApi?.hideOverlay();
      }
    },
    suppressRowClickSelection: true,
    onCellClicked: (e: CellClickedEvent) => {
      const column: any = e.column;      
      // if (column?.colId == documentsColumnField.Name) {
      //   //this.documentPreview(e.data);
      // }
    }
  };

  onPageSizeChanged(event: any) {
    this.gridOptions.cacheBlockSize = Number(event.value.toLowerCase().replace("rows", ""));
    this.gridOptions.paginationPageSize = Number(event.value.toLowerCase().replace("rows", ""));
    if (this.gridApi != null) {
      this.gridApi.paginationSetPageSize(Number(event.value.toLowerCase().replace("rows", "")));
      this.gridApi.setRowData(this.rowData);
    }
  }
  addMsp()
  {
    this.router.navigateByUrl('/msp/msp-add')
  }
  onBtExport() {
    const params = {
      fileName: 'Msp List',
      sheetName: 'Msp List'
    };
    this.gridApi.exportDataAsExcel(params);
  }
}
