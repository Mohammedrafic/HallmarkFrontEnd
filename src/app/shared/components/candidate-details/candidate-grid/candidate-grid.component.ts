import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
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
import { ColDef } from '@ag-grid-community/core';
import { AbstractPermissionGrid } from '@shared/helpers/permissions/abstract-permission-grid';
import { ShowExportDialog } from 'src/app/store/app.actions';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { Subject, filter, takeUntil } from 'rxjs';
import { DatePipe } from '@angular/common';
import { CandidateDetailsFilterTab } from '@shared/enums/candidate-assignment.enum';

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
  @Input() public activeTab: CandidateDetailsFilterTab;
  @ViewChild('grid') grid: GridComponent;

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
  constructor(private router: Router, store: Store, public datePipe: DatePipe, private actions$: Actions) {
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
    this.defaultFileName = 'Candidate Assignment '+ CandidateDetailsFilterTab[this.activeTab] + ' '+ this.generateDateTime(this.datePipe);
    this.store.dispatch(
      new ExportCandidateAssignment(
        new ExportPayload(
          fileType,
          {  tab,...this.filters, offset: Math.abs(new Date().getTimezoneOffset()) },
          options ? options.columns.map((val) => val.column) : this.columnsToExport.map((val) => val.column),
          null,
          options?.fileName || this.defaultFileName
        )
      )
    );
    this.clearSelection(this.grid);
  }

  public closeExport(): void {
    this.fileName = '';
    this.store.dispatch(new ShowExportDialog(false));
  }

  private watchForDefaultExport(): void {
    this.export$.pipe(takeUntil(this.unsubscribe$)).subscribe((event: ExportedFileType) => {
      this.defaultFileName = 'Candidate Assignment '+ CandidateDetailsFilterTab[this.activeTab] + ' '+ this.generateDateTime(this.datePipe);
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
        this.defaultFileName = 'Candidate Assignment '+ CandidateDetailsFilterTab[this.activeTab]+ ' ' + this.generateDateTime(this.datePipe);
        this.fileName = this.defaultFileName;
      });
  }

  public sortByColumn(order: string): void {
  this.orderBy =order
    }
  
}
