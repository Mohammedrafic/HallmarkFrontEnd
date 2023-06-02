import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';

import { Store } from '@ngxs/store';

import {
  AbstractGridConfigurationComponent,
} from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ShowExportDialog } from '../../../../store/app.actions';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { InvoiceGridSelections } from '../../interfaces';
import { AgencyInvoiceExportCols, GetExportFileName, GetInvoiceState, GetTabsToExport, InvoiceExportCols } from './invoice-export.constant';
import { InvoicesState } from '../../store/state/invoices.state';
import { InvoiceState } from '../../enums';
import { Invoices } from '../../store/actions/invoices.actions';

@Component({
  selector: 'app-invoice-grid-export',
  templateUrl: './invoice-grid-export.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceGridExportComponent extends AbstractGridConfigurationComponent {
  @Input() public selectedRows: InvoiceGridSelections;
  @Input() public isAgency = false;
  @Input() public organizationId: number;
  @Input() set selectedTab(selectedTabIdx: number | never) {
   this.setSelectedTab(selectedTabIdx);
  }

  @Output() readonly resetTableSelection: EventEmitter<void> = new EventEmitter<void>();

  public showExport = false;
  public fileName = '';
  public defaultFileName = '';
  public columnsToExport: ExportColumn[];

  private selectedTabIndex = 0;
  private invoiceState: InvoiceState | null;

  constructor(
    private store: Store,
    private cdr: ChangeDetectorRef,
  ) {
    super();
  }

  public override customExport(): void {
    this.getDefaultFileName();
    this.fileName = this.defaultFileName;
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
public exportColumns():void{
  if (this.isAgency)
  {
this.columnsToExport=AgencyInvoiceExportCols
  }
  else
  {
    this.columnsToExport=InvoiceExportCols
  }

}

  public override defaultExport(fileType: ExportedFileType, options?: ExportOptions): void {
    
    this.exportColumns();
    const filters = this.store.selectSnapshot(InvoicesState.invoicesFilters);
    const ids = this.selectedRows.selectedInvoiceIds.length ? this.selectedRows.selectedInvoiceIds : null;
    const filterQuery = {
      ...filters,
      offset: Math.abs(new Date().getTimezoneOffset()),
      invoiceState: this.invoiceState,
      ids,
    };

    if (this.isAgency) {
      filterQuery.organizationId = this.organizationId;
    }

    this.getDefaultFileName();
    this.store.dispatch(new Invoices.ExportInvoices(new ExportPayload(
      fileType,
      filterQuery,
      options ? options.columns.map(val => val.column) : this.columnsToExport.map(val => val.column),
      ids,
      options?.fileName || this.defaultFileName,
    ), this.isAgency));

    this.resetTableSelection.emit();
  }

  private setSelectedTab(selectedTabIdx: number): void {
    const tabsToExport = GetTabsToExport(this.isAgency);
    this.selectedTabIndex = selectedTabIdx;
    this.showExport = tabsToExport.includes(selectedTabIdx);
    this.invoiceState = GetInvoiceState(this.isAgency, selectedTabIdx);
    this.cdr.markForCheck();
  }

  private getDefaultFileName(): void {
    this.defaultFileName = GetExportFileName(this.isAgency, this.selectedTabIndex);
  }
}
