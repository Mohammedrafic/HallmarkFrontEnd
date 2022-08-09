import { GridCellRenderer } from '@shared/components/grid/models/grid-cell-renderer.class';
import { ColDef, IDetailCellRendererParams } from '@ag-grid-community/core';
import { Directive, OnDestroy } from '@angular/core';

@Directive()
export abstract class GridRowDetailsCellRenderer<T> extends GridCellRenderer<IDetailCellRendererParams> implements OnDestroy {
  public rowData: T[];
  public colDefs: ColDef[];
  public rowId: string;

  public override agInit(params: IDetailCellRendererParams): void {
    super.agInit(params);

    const { node, data, detailGridOptions: { columnDefs } } = params;

    this.rowId = node.id || '';
    this.colDefs = columnDefs || [];

    params.getDetailRowData({
      node,
      data,
      successCallback: (rowData: T[]) => this.rowData = rowData,
    })
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
