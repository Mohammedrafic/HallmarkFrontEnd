import { ICellRendererParams } from '@ag-grid-community/core';

export interface TitleValueParams {
  value?: string;
  title?: string;
  valueClass?: string;
}

export interface TitleValueCellRendererParams extends ICellRendererParams {
  titleValueParams?: TitleValueParams;
}
