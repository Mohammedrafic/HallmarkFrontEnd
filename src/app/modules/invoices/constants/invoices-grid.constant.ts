import {
  CellRendererSelectorFunc,
  ColDef,
  ICellRendererParams,
  ValueFormatterFunc, ValueGetterFunc,
  ValueGetterParams
} from '@ag-grid-community/core';
import { ValueFormatterParams } from '@ag-grid-community/core/dist/cjs/es5/entities/colDef';
import { GridValuesHelper } from '../../timesheets/helpers';
import {
  TitleValueCellRendererComponent
} from '@shared/components/grid/components/title-value-cell-renderer/title-value-cell-renderer.component';
import { TypedColDef, TypedValueGetterParams } from '../interfaces/typed-col-def.interface';
import { ManualInvoice } from '../interfaces';
import { PendingInvoice } from '../interfaces/pending-invoice-record.interface';

export const numberValueFormatter: (params: ValueFormatterParams) => string =
  ({ value }: ValueFormatterParams) => GridValuesHelper.formatNumber(value, '1.2-2');

export const currencyFormatter: ValueFormatterFunc =
  ({ value }: ValueFormatterParams) => GridValuesHelper.formatCurrency(value);

export const monthDayYearDateFormatter: ValueFormatterFunc =
  ({ value }: ValueFormatterParams) => GridValuesHelper.formatDate(value, 'MM/dd/yyyy');

export const titleValueCellRendererSelector: CellRendererSelectorFunc = (params: ICellRendererParams) => {
  return params.value !== null ? {
    component: TitleValueCellRendererComponent,
  } : undefined;
}

export const weekPeriodValueGetter: ValueGetterFunc = (params: ValueGetterParams) => {
  const { weekNumber, weekStartDate: date } = params.data as PendingInvoice;

  return `${weekNumber} - ${GridValuesHelper.formatDate(date, 'cccccc M/d/yy')}`;
};

export const invoicesRowDetailsOffsetColDef: ColDef = {
  width: 140,
};

export const vendorFeeAppliedColDef: TypedColDef<ManualInvoice> = {
  width: 130,
  maxWidth: 130,
  field: 'vendorFeeApplicable',
  headerName: 'VENDOR FEE\nAPPLIED',
  headerClass: 'multi-line-header',
  valueGetter: (params: TypedValueGetterParams<ManualInvoice>) => params.data.vendorFeeApplicable ? 'Yes' : 'No',
};

export const amountColDef: TypedColDef<ManualInvoice> = {
  field: 'amount',
  headerName: 'AMOUNT',
  width: 110,
  type: 'rightAligned',
  cellClass: 'font-weight-bold align-right',
  valueFormatter: numberValueFormatter,
};

export const rejectionReasonColDef: TypedColDef<ManualInvoice> = {
  field: 'rejectionReason',
  headerName: 'REASON FOR REJECTION',
  minWidth: 200,
};
