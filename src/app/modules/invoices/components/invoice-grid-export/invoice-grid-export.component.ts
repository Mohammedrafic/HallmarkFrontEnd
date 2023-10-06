import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';

import { Store } from '@ngxs/store';

import {
  AbstractGridConfigurationComponent,
} from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ShowExportDialog } from '../../../../store/app.actions';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { InvoiceGridSelections } from '../../interfaces';
import {
  AgencyInvoiceExportCols,
  AgencyManualInvoicePendingExportCols,
  GetExportFileName,
  GetInvoiceState,
  GetTabsToExport,
  InvoiceExportCols,
  OrgManualInvoicePendingExportCols,
  PendingInvoiceExportCols,
} from './invoice-export.constant';
import { InvoicesState } from '../../store/state/invoices.state';
import { AgencyInvoicesGridTab, InvoiceState, OrganizationInvoicesGridTab } from '../../enums';
import { Invoices } from '../../store/actions/invoices.actions';
import { InvoicesModel } from '../../store/invoices.model';

@Component({
  selector: 'app-invoice-grid-export',
  templateUrl: './invoice-grid-export.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceGridExportComponent extends AbstractGridConfigurationComponent {
  @Input() public selectedRows: InvoiceGridSelections;
  @Input() public organizationId: number;
  @Input() public agencyOrganizationIds:Array<number> = [];
  @Input() set selectedTab(selectedTabIdx: number | never) {
   this.setSelectedTab(selectedTabIdx);
  }
  @Input() public noorgSelection: boolean = false;
  @Output() readonly resetTableSelection: EventEmitter<void> = new EventEmitter<void>();

  public showExport = false;
  public fileName = '';
  public defaultFileName = '';
  public columnsToExport: ExportColumn[];

  private selectedTabIndex = 0;
  private invoiceState: InvoiceState | null;
  public isAgency:boolean;

  constructor(
    private store: Store,
    private cdr: ChangeDetectorRef,
  ) {
    super();
    this.exportColumns();
    this.isAgency = (this.store.snapshot().invoices as InvoicesModel).isAgencyArea;
   

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
      if(this.selectedTabIndex === AgencyInvoicesGridTab.Manual)
      this.columnsToExport=AgencyManualInvoicePendingExportCols;
    else
    this.columnsToExport=AgencyInvoiceExportCols;
  
     
    }
    else
    {
      if(this.selectedTabIndex === OrganizationInvoicesGridTab.Manual)
      this.columnsToExport=OrgManualInvoicePendingExportCols;
      else if(this.selectedTabIndex === OrganizationInvoicesGridTab.PendingRecords)
        this.columnsToExport=PendingInvoiceExportCols;
      else
        this.columnsToExport=InvoiceExportCols;
    }
  }

  public override defaultExport(fileType: ExportedFileType, options?: ExportOptions): void {
    
    
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
      filterQuery.agencyOrganizationIds = this.agencyOrganizationIds;
    }
    let allTabIds:any = [];
    if(this.isAgency && this.selectedTabIndex === AgencyInvoicesGridTab.All){
      this.selectedRows.rowNodes.forEach(ele=>{        
        allTabIds.push([ele.data.invoiceId,ele.data.organizationId]);
      })
      filterQuery.ids = allTabIds;
    }

    this.getDefaultFileName();
    this.store.dispatch(new Invoices.ExportInvoices(new ExportPayload(
      fileType,
      filterQuery,
      options ? options.columns.map(val => val.column) : this.columnsToExport.map(val => val.column),
      this.isAgency && this.selectedTabIndex === AgencyInvoicesGridTab.All ? allTabIds : ids,
      options?.fileName || this.defaultFileName,
    ), this.isAgency,this.selectedTabIndex)); 

    this.resetTableSelection.emit();
  }

  private setSelectedTab(selectedTabIdx: number): void {
    const tabsToExport = GetTabsToExport(this.isAgency);
    this.selectedTabIndex = selectedTabIdx;
    this.showExport = tabsToExport.includes(selectedTabIdx);
    this.invoiceState = GetInvoiceState(this.isAgency, selectedTabIdx);    
    this.cdr.markForCheck();
    this.exportColumns();
  }

  private getDefaultFileName(): void {
    this.defaultFileName = GetExportFileName(this.isAgency, this.selectedTabIndex);
  }
}
