import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ColumnApi, GridApi, ICellRendererParams } from '@ag-grid-community/core';
import { Directive } from '@angular/core';

@Directive()
export abstract class GridCellRenderer<P extends ICellRendererParams = ICellRendererParams> implements ICellRendererAngularComp {
  public params: P;
  public value: string | number | null;
  public gridApi: GridApi;
  public gridColumnApi: ColumnApi;

  public agInit(params: P): void {
    this.params = params;
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    this.value = params.valueFormatted || params.getValue?.();
  }

  public refresh(params: P): boolean {
    this.agInit(params);

    return true;
  }
}
