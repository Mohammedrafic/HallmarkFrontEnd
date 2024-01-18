import { Component, Input, OnInit } from '@angular/core';
import { CandidateStatus } from '@shared/enums/status';
import { Actions, Store, ofActionDispatched } from '@ngxs/store';
import {
  CandidateAgencyExportColumns,
  CandidateOrgExportColumns,
  CandidatesColumnsDefinition,
} from '@shared/components/candidate-details/candidate-grid/candidate-grid.constant';
import { Router } from '@angular/router';
import {
  ExportCandidateAssignment,
  SetPageNumber,
  SetPageSize,
} from '@shared/components/candidate-details/store/candidate.actions';
import { CandidateDetailsPage, FiltersModal } from '@shared/components/candidate-details/models/candidate.model';
import { ColDef, ColumnApi, GridApi, GridReadyEvent } from '@ag-grid-community/core';
import { AbstractPermissionGrid } from '@shared/helpers/permissions/abstract-permission-grid';
import { ShowExportDialog } from 'src/app/store/app.actions';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { Subject, filter, takeUntil } from 'rxjs';
import { formatDate } from '@angular/common';
import { CandidateDetailsFilterTab } from '@shared/enums/candidate-assignment.enum';
import { resetAgGridHorizontalScroll } from '@core/helpers/grid-scroll.helper';

@Component({
  selector: 'app-candidate-grid',
  templateUrl: './candidate-grid.component.html',
})
export class CandidateGridComponent extends AbstractPermissionGrid implements OnInit {
  @Input() public CandidateStatus: number;
  @Input() public candidatesPage: CandidateDetailsPage;
  @Input() public pageNumber: number;
  @Input() public override pageSize: number;
  @Input() public filters: FiltersModal |  null;
  @Input()
  get activeTab(): CandidateDetailsFilterTab { return this._activeTab; }
  set activeTab(activeTab: CandidateDetailsFilterTab) {
    resetAgGridHorizontalScroll(this.gridApi, this.columnApi);
    this._activeTab = activeTab;
  }
  private _activeTab: CandidateDetailsFilterTab;

  public readonly statusEnum = CandidateStatus;
  public isAgency = false;
  public isLoading = false;
  public columnDefinitions: ColDef[];
  public selectedRowDatas: any[] = [];
  @Input() export$: Subject<ExportedFileType>;
  public columnsToExport: ExportColumn[];
  private unsubscribe$: Subject<void> = new Subject();
  public defaultFileName: string;
  public fileName: string;
  private gridApi: GridApi;
  private columnApi: ColumnApi;
  
  constructor(private router: Router, store: Store, private actions$: Actions) {
    super(store);
  }

  override ngOnInit(): void {
    this.isAgency = this.router.url.includes('agency');
    this.columnsToExport =this.isAgency ? CandidateAgencyExportColumns : CandidateOrgExportColumns;
    this.columnDefinitions = CandidatesColumnsDefinition(this.isAgency);
    this.watchForDefaultExport();
    this.watchForExportDialog();
  }

  public onRowsDropDownChanged(pageSize: number): void {
    this.store.dispatch(new SetPageNumber(1));
    this.store.dispatch(new SetPageSize(pageSize));
  }

  public onGoToClick(pageNumber: number): void {
    this.store.dispatch(new SetPageNumber(pageNumber));
  }
  public export(event: ExportOptions): void {
    this.closeExport();
    this.defaultExport(event.fileType, event);
  }

  public override defaultExport(fileType: ExportedFileType, options?: ExportOptions): void {
    if(!this.filters){
      this.filters ={}
    }
    this.filters!.orderBy = this.orderBy;
    this.columnsToExport = this.isAgency ? CandidateAgencyExportColumns : CandidateOrgExportColumns;
    let tab= this.activeTab;
    this.defaultFileName = this.generateExportFileName();
    let filterQuery:any = {...this.filters};
    if(filterQuery?.organizationIds){
      filterQuery.organizationIds = [filterQuery.organizationIds]
    }
    this.store.dispatch(
      new ExportCandidateAssignment(
        new ExportPayload(
          fileType,
          {  tab,...filterQuery, offset: Math.abs(new Date().getTimezoneOffset()) },
          options ? options.columns.map((val) => val.column) : this.columnsToExport.map((val) => val.column),
          null,
          options?.fileName || this.defaultFileName
        )
      )
    );
  }

  public closeExport(): void {
    this.fileName = '';
    this.store.dispatch(new ShowExportDialog(false));
  }

  private watchForDefaultExport(): void {
    this.export$.pipe(takeUntil(this.unsubscribe$)).subscribe((event: ExportedFileType) => {
      this.defaultFileName = this.generateExportFileName();
      this.defaultExport(event);
    });
  }

  private watchForExportDialog(): void {
    this.actions$
      .pipe(
        ofActionDispatched(ShowExportDialog),
        filter((value) => value.isDialogShown),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.defaultFileName = this.generateExportFileName();
        this.fileName = this.defaultFileName;
      });
  }

  private generateExportFileName(): string {
    return 'Candidate Assignment ' + CandidateDetailsFilterTab[this.activeTab] +
      ' ' + formatDate(Date.now(), 'MM/dd/yyyy HH:mm', 'en-US');
  }

  public sortByColumn(order: string): void {
  this.orderBy =order
    }
  
  public setGridApi(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }
}
