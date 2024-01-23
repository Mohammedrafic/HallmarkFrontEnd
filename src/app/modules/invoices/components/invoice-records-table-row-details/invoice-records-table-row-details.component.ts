import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { GridRowDetailsCellRenderer } from '@shared/components/grid/models';
import { IDetailCellRendererParams } from '@ag-grid-community/core';
import { InvoicesApiService } from '../../services';
import { PendingInvoiceRecord } from '../../interfaces';

@Component({
  selector: 'app-invoice-records-table-row-details',
  templateUrl: './invoice-records-table-row-details.component.html',
  styleUrls: ['./invoice-records-table-row-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceRecordsTableRowDetailsComponent<T> extends GridRowDetailsCellRenderer<T> implements ICellRendererAngularComp, OnDestroy {

  constructor(
    private invoicesApiService: InvoicesApiService,
  ) {
    super();
  }

  public override agInit(params: IDetailCellRendererParams): void {
    if (params.data.isBasedOnPdTimesheet) {
      this.invoicesApiService.getInvoiceReorderDetails(params.data.id, params.data.organizationId)
        .subscribe((invoiceReordersData) => {
          params.data.invoiceRecords.map((record: PendingInvoiceRecord) => {
            record.reorderCandidatePosition = invoiceReordersData
              .find(reorderData => reorderData.id === record.id)?.reorderCandidatePosition || '';
          });
          super.agInit(params);
          this.addDetailsGridInfo();
        });
      return;
    }
    super.agInit(params);
  }
  
  public gridReady(): void {
    this.addDetailsGridInfo();
  }
}
