import { ICellRendererParams } from '@ag-grid-community/core';

export interface TitleValueParams {
  value?: string;
  title?: string;
  valueClass?: string;
  organizationId?: number;
}

export interface TitleValueCellRendererParams extends ICellRendererParams {
  parentTimesheetId?: number | null;
  titleValueParams?: TitleValueParams;
}
