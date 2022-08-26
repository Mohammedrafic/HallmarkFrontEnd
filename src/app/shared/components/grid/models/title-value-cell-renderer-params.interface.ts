import { ICellRendererParams } from '@ag-grid-community/core';

export interface TitleValueCellRendererParams extends ICellRendererParams {
  titleValueParams?: {
    value?: string;
    title?: string;
    valueClass?: string;
  }
}
