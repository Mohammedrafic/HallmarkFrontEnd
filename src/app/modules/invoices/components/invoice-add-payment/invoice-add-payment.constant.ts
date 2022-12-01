import { formatCurrency } from '@angular/common';

import { ColDef, ValueFormatterParams } from '@ag-grid-community/core';

import { FieldType } from '@core/enums';
import { DropdownOption } from '@core/interface';
import { PaymentFormConfig } from './invoice-add-payment.interface';
import { InputEditorComponent } from './cell-renderers/input-editor/input-editor.component';
import { PaymentDeleteRendererComponent } from './cell-renderers/payment-delete-renderer/payment-delete-renderer.component';
import { BalanceRendererComponent } from './cell-renderers/balance-renderer/balance-renderer.component';
import { PaymentMode } from '../../enums';

export const PaymentOptions: DropdownOption[] = [
  {
    text: 'Electronic',
    value: PaymentMode.Electronic,
  },
  {
    text: 'Check',
    value: PaymentMode.Check,
  },
];

export const AddPaymentFormConfig: PaymentFormConfig[] = [
  {
    title: 'Payment Date',
    field: 'date',
    type: FieldType.Date,
    required: true,
  },
  {
    title: 'Reference Number',
    field: 'checkNumber',
    type: FieldType.Input,
    required: true,
  },
  {
    title: 'Check Date',
    field: 'checkDate',
    type: FieldType.Date,
    required: true,
  },
  {
    title: 'Check Amount',
    field: 'initialAmount',
    type: FieldType.Number,
    required: true,
  },
  {
    title: 'Payment Mode',
    field: 'paymentMode',
    type: FieldType.Dropdown,
    required: true,
    options: PaymentOptions,
  },
  {
    title: 'Refund',
    field: 'isRefund',
    type: FieldType.Toggle,
  },
];

const commonColumn: ColDef = {
  sortable: true,
  resizable: true,
};

export const CheckPaymentsDefs: ColDef[] = [
  {
    field: 'id',
    headerName: '',
    type: 'leftAligned',
    width: 55,
    sortable: false,
    resizable: true,
    cellRenderer: PaymentDeleteRendererComponent,
  },
  {
    field: 'invoiceNumber',
    headerName: 'Invoice Number',
    type:  'rightAligned',
    width: 185,
    ...commonColumn,
  },
  {
    field: 'amount',
    headerName: 'Amount',
    type:  'rightAligned',
    width: 148,
    ...commonColumn,
    valueFormatter: (params: ValueFormatterParams) => {
      return formatCurrency(params.value, 'en', '$');
    },
  },
  {
    field: 'payment',
    headerName: 'Payment',
    type:  'leftAligned',
    width: 155,
    cellRenderer: InputEditorComponent,
    sortable: false,
    resizable: true,
  },
  {
    field: 'balance',
    headerName: 'Balance',
    type:  'rightAligned',
    cellRenderer: BalanceRendererComponent,
    width: 147,
    sortable: false,
    resizable: true,
    ...commonColumn,
  },
];
