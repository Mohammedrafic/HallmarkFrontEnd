import { ChangeDetectionStrategy, Component, EventEmitter, Input } from '@angular/core';
import { InvoiceRecord } from "../../interfaces";
import { MoreMenuType } from "../../../timesheets/enums";
import { Timesheet } from 'src/app/modules/timesheets/interface';
import { ColDef, GridApi, GridOptions, RowNode } from '@ag-grid-community/core';
import { GridReadyEventModel } from '@shared/components/grid/models/grid-ready-event.model';
import { PageOfCollections } from '@shared/models/page.model';
import { InvoiceRecordsGridHelper } from '../../helpers/invoice-records-grid.helper';

@Component({
  selector: 'app-invoice-records-table',
  templateUrl: './invoice-records-table.component.html',
  styleUrls: ['./invoice-records-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceRecordsTableComponent {
  @Input()
  public tableData: PageOfCollections<InvoiceRecord> | null = null;

  public gridApi: GridApi | null = null;

  public isLoading: boolean = false;
  public newSelectedIndex: number | null = null;
  public sortHandler: EventEmitter<unknown> = new EventEmitter<unknown>();
  public currentPage: number;
  public pageSize: number;

  public readonly columnDefs: ColDef[] = InvoiceRecordsGridHelper.getInvoiceRecordsGridColumnDefinitions();

  public readonly gridOptions: GridOptions = InvoiceRecordsGridHelper.getRowNestedGridOptions();

  public menuOptionSelected(event: any, data: Timesheet): void {
    switch (event.item.properties.text) {
      case MoreMenuType.Edit: {
        break;
      }
      case MoreMenuType.Duplicate: {
        break;
      }
      case MoreMenuType.Close: {
        break;
      }
      case MoreMenuType.Delete: {
        break;
      }
    }
  }

  onGoToClick(event: number) {

  }

  public gridReady(event: GridReadyEventModel) {
    this.gridApi = event.api;
  }

  onRowsDropDownChanged(event: number) {

  }

  bulkApprove(event: RowNode[]) {

  }

  bulkExport(event: RowNode[]) {

  }

  selectedRow(event: any) {

  }
}
