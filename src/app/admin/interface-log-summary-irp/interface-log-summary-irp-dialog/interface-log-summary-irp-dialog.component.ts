import { ColDef, FilterChangedEvent, GridOptions, ICellRendererParams } from '@ag-grid-community/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import { DatePipe } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, Input, Output, ViewChild, EventEmitter, OnDestroy } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { CustomNoRowsOverlayComponent } from '@shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';
import { GRID_CONFIG } from '@shared/constants';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { EmpGeneralNoteImportDetails, EmpGeneralNoteImportDetailsPage, InterfaceLogSummary, InterfaceLogSummaryDetails, InterfaceLogSummaryIRPDetailsPage } from '@shared/models/org-interface.model';
import { disabledBodyOverflow, windowScrollTop } from '@shared/utils/styles.utils';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { BehaviorSubject, Observable, Subject, takeWhile } from 'rxjs';
import { ExportEmpGeneralNoteImportDetails, ExportEmployeeImportDetails, GetInterfaceLogDetails } from 'src/app/security/store/security.actions';
import { SecurityState } from 'src/app/security/store/security.state';
import { DefaultUserGridColDef, SideBarConfig } from 'src/app/security/user-list/user-grid/user-grid.constant';
import { ShowExportDialog } from 'src/app/store/app.actions';
import { AppState } from 'src/app/store/app.state';
import { EmpGeneralNoteWithErrorColumnsConfig, InterfaceEmployeesWithErrorColumnsConfig, LogStatusEnum } from '../interface-log-summary-irp.constants';

@Component({
  selector: 'app-interface-log-summary-irp-dialog',
  templateUrl: './interface-log-summary-irp-dialog.component.html',
  styleUrls: ['./interface-log-summary-irp-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InterfaceLogSummaryIrpDialogComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {

  @Input() selectedLog: InterfaceLogSummary;
  @Input() selectedType: number;
  @Input() openDialogue: Subject<boolean>;

  @Output() nextPreviousLogEvent = new EventEmitter<boolean>();

  @ViewChild('sideDialog') sideDialog: DialogComponent;


  @Select(SecurityState.logDialogOptions)
  public logDialogOptions$: Observable<DialogNextPreviousOption>;


  @Select(SecurityState.logSummaryDetails)
  public logInterfaceDetailsPage$: Observable<InterfaceLogSummaryIRPDetailsPage>;


  @Select(SecurityState.logGeneralNoteSummaryDetails)
  public logGeneralNoteDetailsPage$: Observable<EmpGeneralNoteImportDetailsPage>;

  @Select(AppState.isDarkTheme)
  isDarkTheme$: Observable<boolean>;


  private isAlive = true;
  private unsubscribe$: Subject<void> = new Subject();
  public targetElement: HTMLElement | null = document.body.querySelector('#main');
  public SelectedLogType: number;

  public totalRecordsCount$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public gridApi: any;
  private gridColumnApi: any;
  // columnDefs: ColDef[];
  defaultColDef: ColDef = DefaultUserGridColDef;
  modules: any[] = [ServerSideRowModelModule, RowGroupingModule];
  cacheBlockSize: any;
  rowModelType: any;
  frameworkComponents: any;
  serverSideStoreType: any;
  serverSideInfiniteScroll: any;
  serverSideFilterOnServer: any;
  pagination: boolean;
  paginationPageSize: number;
  maxBlocksInCache: any;
  sideBar = SideBarConfig;
  timeSheetHistoryItemList: Array<InterfaceLogSummaryDetails> = [];
  empGeneralNoteImportList: Array<EmpGeneralNoteImportDetails> = [];
  public readonly gridConfig: typeof GRID_CONFIG = GRID_CONFIG;
  public noRowsOverlayComponent: any = CustomNoRowsOverlayComponent;
  public noRowsOverlayComponentParams: any = {
    noRowsMessageFunc: () => 'No Rows To Show',
  };

  public columnDefs: ColumnDefinitionModel[] = [];
  public defaultFileName: string;
  public fileName: string;
  public columnsToExport: ExportColumn[] = [
    { text: 'Employee ID', column: 'EmployeeId' },
    { text: 'First Name', column: 'FirstName' },
    { text: 'Middle Name', column: 'MiddleName' },
    { text: 'Last Name', column: 'LastName' },
    { text: 'DOB', column: 'DOB' },
    { text: 'Primary Skill', column: 'PrimarySkill' },
    { text: 'Secondary Skill', column: 'SecondarySkill' },
    { text: 'Classification', column: 'Classification' },
    { text: 'Hire Date', column: 'HireDate' },
    { text: 'FTE', column: 'FTE' },
    { text: 'HR Company Code', column: 'HRCompanyCode' },
    { text: 'Internal Transfer Recruitment', column: 'InternalTransferRecruitment' },
    { text: 'Contract', column: 'Contract' },
    { text: 'Contract Start Date', column: 'ContractStartDate' },
    { text: 'Contract End Date', column: 'ContractEndDate' },
    { text: 'Address', column: 'Address' },
    { text: 'Country', column: 'Country' },
    { text: 'State', column: 'State' },
    { text: 'City', column: 'City' },
    { text: 'Zip Code', column: 'ZipCode' },
    { text: 'Email', column: 'Email' },
    { text: 'Work Email', column: 'WorkEmail' },
    { text: 'Cell Phone', column: 'Cellphone' },
    { text: 'Alternative Phone', column: 'AlternativePhone' },
    { text: 'Professional Summary', column: 'ProfessionalSummary' },
    { text: 'Profile Status', column: 'ProfileStatus' },
    { text: 'Hold Start Date', column: 'HoldStartDate' },
    { text: 'Hold End Date', column: 'HoldEndDate' },
    { text: 'Inactivation Date', column: 'InactivationDate' },
    { text: 'Inactivation Reason', column: 'InactivationReason' },
    { text: 'Status', column: 'Status' },
    { text: 'Error Descriptions', column: 'ErrorDescriptions' }
  ];
  public EmpGeneralNoteColumnsToExport: ExportColumn[] = [
    { text: 'Employee ID', column: 'EmployeeID' },
    { text: 'Employee Name', column: 'EmployeeName' },
    { text: 'Date', column: 'Date' },
    { text: 'Category', column: 'Category' },
    { text: 'Note', column: 'Note' },
    { text: 'Status', column: 'Status' },
    { text: 'Error Descriptions', column: 'ErrorDescriptions' }
  ];
  get hidePreviousDialog(): boolean {
    return this.selectedType == LogStatusEnum.OverAll

  }
  get getSelectedTypeName(): string {
    return this.selectedType == LogStatusEnum.Errored ? "Error" : LogStatusEnum[this.selectedType]

  }
  get getImportType(): string {
    return this.selectedLog?.importType

  }
  constructor(
    private store: Store, private datePipe: DatePipe,
  ) {
    super();
    var self = this;
  }

  ngOnInit(): void {

    this.openDialogue.pipe(takeWhile(() => this.isAlive)).subscribe((isOpen) => {
      if (isOpen) {
        windowScrollTop();
        this.sideDialog.show();
        disabledBodyOverflow(true);
      } else {
        this.sideDialog.hide();
        disabledBodyOverflow(false);
      }
    });

       this.logInterfaceDetailsPage$.pipe(takeWhile(() => this.isAlive)).subscribe((data: any) => {
        if (data != null) {
          this.timeSheetHistoryItemList = data?.items;
          this.totalRecordsCount$.next(data?.totalCount);
          if (!this.timeSheetHistoryItemList || !this.timeSheetHistoryItemList.length) {
            this.gridApi?.showNoRowsOverlay();
          } else {
            this.gridApi?.hideOverlay();
          }
          this.gridApi?.setRowData(this.timeSheetHistoryItemList);
        }
      });
  
      this.logGeneralNoteDetailsPage$.pipe(takeWhile(() => this.isAlive)).subscribe((data: any) => {
      if (data != null) {
        this.empGeneralNoteImportList = data?.items;
        this.totalRecordsCount$.next(data?.totalCount);
        if (!this.empGeneralNoteImportList || !this.empGeneralNoteImportList.length) {
          this.gridApi?.showNoRowsOverlay();
        } else {
          this.gridApi?.hideOverlay();
        }
        this.gridApi?.setRowData(this.empGeneralNoteImportList);
      }
    });
 

  }

  public gridEmployeeOptions: GridOptions = {
    pagination: true,
    cacheBlockSize: this.pageSize,
    paginationPageSize: this.pageSize,
    columnDefs: InterfaceEmployeesWithErrorColumnsConfig,
    rowData:  this.timeSheetHistoryItemList,
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
  public gridEmpGeneralNoteOptions: GridOptions = {
    pagination: true,
    cacheBlockSize: this.pageSize,
    paginationPageSize: this.pageSize,
    columnDefs: EmpGeneralNoteWithErrorColumnsConfig,
    rowData:  this.empGeneralNoteImportList,
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

  public onClose(): void {
    this.sideDialog.hide();
    this.openDialogue.next(false);
  }

  public onNextPreviousLog(next: boolean): void {
    this.nextPreviousLogEvent.emit(next);
  }

  public override customExport(): void {
    const currentDateTime = this.generateDateTime(this.datePipe);
    this.fileName = this.hidePreviousDialog ? `InterfaceLogSummaryIRPDetails_${currentDateTime}` : this.getSelectedTypeName + `RecordDetails_${currentDateTime}`;
    this.store.dispatch(new ShowExportDialog(true));
  }

  public closeExport(): void {
    this.fileName = '';
    this.store.dispatch(new ShowExportDialog(false));
  }

  public export(event: ExportOptions): void {
    this.closeExport();
    this.defaultExport(event.fileType, event);
  }

  public override defaultExport(fileType: ExportedFileType, options?: ExportOptions): void {
    this.defaultFileName = this.hidePreviousDialog ? `InterfaceLogSummaryIRPDetails_${this.generateDateTime(this.datePipe)}` : this.getSelectedTypeName + `RecordDetails_${this.generateDateTime(this.datePipe)}`;
    if(this.getImportType == "Employee Import"){
      this.store.dispatch(
        new ExportEmployeeImportDetails(
          new ExportPayload(
            fileType,
            {
              InterfaceLogSummaryID: this.selectedLog.id,
              StatusType: this.selectedType,
              PageNumber: this.currentPage,
              PageSize: this.pageSize,
            },
            options
              ? options.columns.map((val: ExportColumn) => val.column)
              : this.columnsToExport.map((val: ExportColumn) => val.column),
            null,
            options?.fileName || this.defaultFileName
          )
        )
      );
    }else if(this.getImportType == "Employee General Note Import"){
      this.store.dispatch(
        new ExportEmpGeneralNoteImportDetails(
          new ExportPayload(
            fileType,
            {
              InterfaceLogSummaryID: this.selectedLog.id,
              StatusType: this.selectedType,
              PageNumber: this.currentPage,
              PageSize: this.pageSize,
            },
            options
              ? options.columns.map((val: ExportColumn) => val.column)
              : this.EmpGeneralNoteColumnsToExport.map((val: ExportColumn) => val.column),
            null,
            options?.fileName || this.defaultFileName
          )
        )
      );
    }
  
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridApi.setRowData(this.getImportType == "Employee Import" ? this.timeSheetHistoryItemList: this.empGeneralNoteImportList);
  }


  onPageSizeChanged(event: any) {
    this.cacheBlockSize = Number(event.value.toLowerCase().replace('rows', ''));
    this.paginationPageSize = Number(event.value.toLowerCase().replace('rows', ''));
    if (this.gridApi != null) {
      this.gridApi.paginationSetPageSize(Number(event.value.toLowerCase().replace('rows', '')));
      this.gridApi.setRowData(this.getImportType == "Employee Import"? this.timeSheetHistoryItemList: this.empGeneralNoteImportList);
    }
  }

  ngOnDestroy(): void {
    this.isAlive = false;
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
