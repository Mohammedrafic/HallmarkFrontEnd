import { formatCurrency, formatDate, formatNumber } from '@angular/common';

import { ColDef, ValueFormatterParams } from '@ag-grid-community/core';

import { PaymentMode } from '../../enums';
import { EditPaymentRendererComponent } from './cell-renderers/edit-payment-renderer/edit-payment-renderer.component';
import { DateTimeHelper } from '../../../../core/helpers/date-time.helper';

const commonCol = {
  sortable: false,
  resizable: true,
};

const paymentModeOptions = {
  [PaymentMode.Check]: 'check',
  [PaymentMode.Electronic]: 'electronic',
};

export const PaymentTableDefs: ColDef[] = [
  {
    field: 'id',
    headerName: '',
    type: 'leftAligned',
    width: 55,
    minWidth: 45,
    ...commonCol,
    cellRenderer: EditPaymentRendererComponent,
  },
  {
    field: 'paymentDate',
    headerName: 'Payment Date',
    type: 'rightAligned',
    width: 150,
    ...commonCol,
    valueFormatter: (params: ValueFormatterParams) => DateTimeHelper.formatDateUTC(params.value, 'MM/dd/yyyy'),
  },
  {
    field: 'paymentMode',
    headerName: 'Payment Mode',
    type: 'rightAligned',
    width: 150,
    ...commonCol,
    valueFormatter: (params: ValueFormatterParams) => paymentModeOptions[params.value as PaymentMode],
  },
  {
    field: 'checkNumber',
    headerName: 'Reference Number',
    type: 'rightAligned',
    width: 160,
    ...commonCol,
  },
  {
    field: 'checkDate',
    headerName: 'Check Date',
    width: 130,
    type: 'rightAligned',
    ...commonCol,
    valueFormatter: (params: ValueFormatterParams) => DateTimeHelper.formatDateUTC(params.value, 'MM/dd/yyyy'),
  },
  {
    field: 'payment',
    headerName: 'Payment',
    width: 136,
    type: 'rightAligned',
    ...commonCol,
    valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.value, 'en', '$'),
  },
  {
    field: 'isRefund',
    headerName: 'Refund',
    width: 100,
    type: 'rightAligned',
    ...commonCol,
    valueFormatter: (params: ValueFormatterParams) => {
      if (params.value) {
        return 'Yes';
      }
      return 'No';
    },
  },
  {
    field: 'burnRate',
    headerName: 'Burn Rate %',
    type: 'rightAligned',
    width: 130,
    ...commonCol,
    valueFormatter: (params: ValueFormatterParams) => `${formatNumber(params.value, 'en-US', '1.0-1')}%`,
  },
];
