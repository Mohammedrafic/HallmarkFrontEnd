import {
  CellRendererSelectorFunc,
  ColDef,
  ICellRendererParams,
  ValueFormatterFunc, ValueGetterFunc,
  ValueGetterParams,
} from '@ag-grid-community/core';
import { ValueFormatterParams } from '@ag-grid-community/core/dist/cjs/es5/entities/colDef';
import { GridValuesHelper } from '../../timesheets/helpers';
import {
  TitleValueCellRendererComponent,
} from '@shared/components/grid/components/title-value-cell-renderer/title-value-cell-renderer.component';
import { ManualInvoice, TypedColDef } from '../interfaces';
import { PendingInvoice } from '../interfaces/pending-invoice-record.interface';
import { PendingApprovalInvoiceRecord } from '../interfaces/pending-approval-invoice.interface';
import { TypedValueGetterParams } from '@core/interface';

const commonColumn: ColDef = {
  sortable: true,
  comparator: () => 0,
};

export const numberValueFormatter: (params: ValueFormatterParams) => string =
  ({ value }: ValueFormatterParams) => GridValuesHelper.formatNumber(value, '1.2-2');

export const CurrencyFormatter: ValueFormatterFunc =
  ({ value }: ValueFormatterParams) => GridValuesHelper.formatCurrencyValue(value);

export const monthDayYearDateFormatter: ValueFormatterFunc =
  ({ value }: ValueFormatterParams) => GridValuesHelper.formatDate(value, 'MM/dd/yyyy');

export const titleValueCellRendererSelector: CellRendererSelectorFunc = (params: ICellRendererParams) => {
  return params.value !== null ? {
    component: TitleValueCellRendererComponent,
  } : undefined;
};

export const weekPeriodValueGetter: ValueGetterFunc = (params: ValueGetterParams) => {
  const { weekNumber, weekStartDate: date } = params.data as PendingInvoice;

  return `${weekNumber} - ${GridValuesHelper.formatDate(date, 'cccccc MM/dd/yyyy')}`;
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
  ...commonColumn,
};

export const amountColDef: TypedColDef<ManualInvoice> = {
  field: 'amount',
  headerName: 'AMOUNT',
  width: 110,
  cellClass: 'font-weight-bold',
  valueFormatter: CurrencyFormatter,
  ...commonColumn,
};

export const rejectionReasonColDef: TypedColDef<ManualInvoice> = {
  field: 'rejectionReason',
  headerName: 'REASON FOR REJECTION',
  minWidth: 200,
  ...commonColumn,
};

export const commentColDef: TypedColDef<ManualInvoice> = {
  field: 'comment',
  headerName: 'COMMENT',
  minWidth: 200,
  ...commonColumn,
};

export const linkedInvoiceIdColDef: TypedColDef<ManualInvoice> = {
  field: 'linkedInvoiceId',
  headerName: 'LINKED INVOICE ID',
  minWidth: 120,
  ...commonColumn,
};

export const reasonCodeColDef: TypedColDef<ManualInvoice> = {
  field: 'reasonCode',
  headerName: 'REASON CODE',
  minWidth: 120,
  ...commonColumn,
};

export const RateReasonValueGetter: ValueGetterFunc = (
  params: TypedValueGetterParams<PendingApprovalInvoiceRecord>) => {
  if (params.data.timesheetTypeText === 'Expenses') {
    return params.data.reasonCode || '-';
  }
  return GridValuesHelper.formatCurrencyValue(params.data.billRate.toString());
};

export const DepartmentNameGetter: ValueGetterFunc = (
  params: TypedValueGetterParams<PendingApprovalInvoiceRecord>
) => `${params.data.departmentName} (${params.data.extDepartmentId})`;
