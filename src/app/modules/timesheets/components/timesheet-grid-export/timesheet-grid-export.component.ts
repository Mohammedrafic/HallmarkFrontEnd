import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { ShowCustomExportDialog, ShowExportDialog } from '../../../../store/app.actions';
import { TimesheetStatus } from '../../enums/timesheet-status.enum';
import { TimesheetGridSelections } from '../../interface/timesheet.interface';
import { Timesheets } from '../../store/actions/timesheets.actions';
import { TimesheetsState } from '../../store/state/timesheets.state';
import { GetExportFileName, TimesheetsExportColsOrg, TimesheetsExportColsAgency  } from './timesheet-export.constant';

@Component({
  selector: 'app-timesheet-grid-export',
  templateUrl: './timesheet-grid-export.component.html',  
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimesheetGridExportComponent extends AbstractGridConfigurationComponent{
  @Input() public selectedRows: TimesheetGridSelections;
  @Input() public isAgency = false;
  @Input() public organizationId: number;
  @Input() set selectedTab(selectedTabIdx: number | never) {
   this.setSelectedTab(selectedTabIdx);
  }

  @Output() readonly resetTableSelection: EventEmitter<void> = new EventEmitter<void>();
  public showExport = false;
  public fileName = '';
  public defaultFileName = '';
 
  public timeSheetColumnsToExport: ExportColumn[];

  private selectedTabIndex = 0;
  private timesheetStatus: TimesheetStatus | null;

  constructor(
    private store: Store,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {
    super();
    this.isAgency = this.route.snapshot.data['isAgencyArea'];
  }

  public override customExport(): void {
    this.getDefaultFileName();
    this.fileName = this.defaultFileName;
    this.store.dispatch(new ShowCustomExportDialog(true));
  }

  public closeExport(): void {
    this.fileName = '';
    this.store.dispatch(new ShowCustomExportDialog(false));
  }

  public export(event: ExportOptions): void {
    this.closeExport();
    this.defaultExport(event.fileType, event);
  }


  public override defaultExport(fileType: ExportedFileType, options?: ExportOptions): void {
    const filters = this.store.selectSnapshot(TimesheetsState.timesheetsFilters);
    this.timeSheetColumnsToExport = this.isAgency?TimesheetsExportColsAgency:TimesheetsExportColsOrg;
    const ids = this.selectedRows.selectedTimesheetIds?.length ? this.selectedRows.selectedTimesheetIds : null;
    const filterQuery = {
      ...filters,
      offset: Math.abs(new Date().getTimezoneOffset()),
      timesheetStatus: this.timesheetStatus,
      ids,
    };
    this.getDefaultFileName();
    this.store.dispatch(new Timesheets.ExportTimesheets(new ExportPayload(
      fileType,
      filterQuery,
      options ? options.columns.map(val => val.column) : this.timeSheetColumnsToExport.map(val => val.column),
      ids,
      options?.fileName || this.defaultFileName,
    )));

    this.resetTableSelection.emit();
  }

  private setSelectedTab(selectedTabIdx: number): void {
    const tabsToExport = [0,1,2,3];
    this.selectedTabIndex = selectedTabIdx;
   
      this.showExport = tabsToExport.includes(selectedTabIdx);
  
    //this.invoiceState = GetInvoiceState(this.isAgency, selectedTabIdx);
    this.cdr.markForCheck();
  }

  private getDefaultFileName(): void {
    this.defaultFileName = GetExportFileName(this.selectedTabIndex);
  }

}
