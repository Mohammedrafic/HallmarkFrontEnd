import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ColDef, GridApi, IDetailCellRendererParams } from '@ag-grid-community/core';
import { GridReadyEventModel } from '@shared/components/grid/models/grid-ready-event.model';

@Component({
  selector: 'app-invoice-records-table-row-details',
  templateUrl: './invoice-records-table-row-details.component.html',
  styleUrls: ['./invoice-records-table-row-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceRecordsTableRowDetailsComponent implements ICellRendererAngularComp, OnDestroy {
  private gridApi: GridApi | null = null;
  private rowId: string = '';

  public rowData: unknown[] = [];
  public colDefs: ColDef[] = [];

  public agInit(params: IDetailCellRendererParams): void {
    const { api, node, data, detailGridOptions: { columnDefs } } = params;

    this.gridApi = api;
    this.rowId = node.id || '';
    this.colDefs = columnDefs || [];

    params.getDetailRowData({
      node: node,
      data: data,
      successCallback: (rowData: unknown[]) => this.rowData = rowData,
    })
  }

  public ngOnDestroy(): void {
    this.gridApi?.removeDetailGridInfo(this.rowId);
  }

  public refresh(params: IDetailCellRendererParams): boolean {
    this.agInit(params);
    return true;
  }

  public gridReady(params: GridReadyEventModel): void {
    params.api.setHeaderHeight(0);

    this.gridApi?.addDetailGridInfo(this.rowId, {
      id: this.rowId,
      api: params.api,
      columnApi: params.columnApi,
    });
  }
}
