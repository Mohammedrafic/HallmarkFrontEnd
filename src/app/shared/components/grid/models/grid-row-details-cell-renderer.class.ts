import { ChangeDetectorRef, Directive, OnDestroy } from '@angular/core';

import { ColDef, IDetailCellRendererParams } from '@ag-grid-community/core';

import { GridCellRenderer } from '@shared/components/grid/models/grid-cell-renderer.class';
import { BaseObservable } from '@core/helpers';
import { InvoicesApiService } from 'src/app/modules/invoices/services';
import { PendingInvoiceRecord } from 'src/app/modules/invoices/interfaces';

@Directive()
export abstract class GridRowDetailsCellRenderer<T> extends GridCellRenderer<IDetailCellRendererParams> implements OnDestroy {
  public rowData: any[];
  public colDefs: ColDef[];
  public rowId: string;
  public rowDataSubj: BaseObservable<T[]> = new BaseObservable<T[]>([]);
  public isLoading = true;

  constructor(
    private invoicesApiService: InvoicesApiService,
    private cd: ChangeDetectorRef,
  ) {
    super();
  }

  public override agInit(params: IDetailCellRendererParams): void {
    super.agInit(params);

    const { node, data, detailGridOptions: { columnDefs } } = params;

    this.rowId = node.id || '';
    this.colDefs = columnDefs || [];

    if (params.data.isBasedOnPdTimesheet) {
      this.invoicesApiService.getInvoiceReorderDetails(params.data.id, params.data.organizationId)
        .subscribe((invoiceReordersData) => {
          params.data.invoiceRecords.map((record: PendingInvoiceRecord) => {
            record.reorderCandidatePosition = invoiceReordersData
              .find(reorderData => reorderData.id === record.id)?.reorderCandidatePosition || '';
          });
          params.getDetailRowData({
            node,
            data,
            successCallback: (rowData: T[]) => {
              this.rowData = rowData;
              this.rowDataSubj.set(this.rowData);
              this.isLoading = false;
              this.cd.detectChanges();
            },
          });
          
        });
    } else {
      params.getDetailRowData({
        node,
        data,
        successCallback: (rowData: T[]) => {
          this.rowData = rowData;
          this.rowDataSubj.set(this.rowData);
          this.isLoading = false;
        },
      });
    }


  }

  public ngOnDestroy(): void {
    this.removeDetailsGridInfo();
  }

  protected addDetailsGridInfo(): void {
    this.gridApi?.addDetailGridInfo(this.rowId, {
      id: this.rowId,
    });
  }

  protected removeDetailsGridInfo(): void {
    this.gridApi?.removeDetailGridInfo(this.rowId);
  }
}
