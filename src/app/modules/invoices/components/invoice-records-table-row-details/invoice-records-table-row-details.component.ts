import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { GridRowDetailsCellRenderer } from '@shared/components/grid/models';

@Component({
  selector: 'app-invoice-records-table-row-details',
  templateUrl: './invoice-records-table-row-details.component.html',
  styleUrls: ['./invoice-records-table-row-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceRecordsTableRowDetailsComponent<T> extends GridRowDetailsCellRenderer<T> implements ICellRendererAngularComp, OnDestroy {
  
  public gridReady(): void {
    this.addDetailsGridInfo();
  }
}
