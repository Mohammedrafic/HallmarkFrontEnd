import { Directive, OnDestroy } from '@angular/core';

import { ColDef, IDetailCellRendererParams } from '@ag-grid-community/core';

import { GridCellRenderer } from '@shared/components/grid/models/grid-cell-renderer.class';
import { BaseObservable } from '@core/helpers';

@Directive()
export abstract class GridRowDetailsCellRenderer<T> extends GridCellRenderer<IDetailCellRendererParams> implements OnDestroy {
  public rowData: any[];
  public colDefs: ColDef[];
  public rowId: string;
  public rowDataSubj: BaseObservable<T[]> = new BaseObservable<T[]>([]);

  public override agInit(params: IDetailCellRendererParams): void {
    super.agInit(params);

    const { node, data, detailGridOptions: { columnDefs } } = params;

    this.rowId = node.id || '';
    this.colDefs = columnDefs || [];

    params.getDetailRowData({
      node,
      data,
      successCallback: (rowData: T[]) => {
        this.rowData = rowData;
        this.rowDataSubj.set(this.rowData);
      },
    });
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
