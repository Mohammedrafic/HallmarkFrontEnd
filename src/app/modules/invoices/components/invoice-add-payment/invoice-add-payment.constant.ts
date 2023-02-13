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
    text: 'Check',
    value: PaymentMode.Check,
  },
  {
    text: 'Electronic',
    value: PaymentMode.Electronic,
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
  comparator: () => 0,
  resizable: true,
};

export const CheckPaymentsDefs: ColDef[] = [
  {
    field: 'id',
    headerName: '',
    type: 'leftAligned',
    width: 55,
    minWidth: 45,
    sortable: false,
    resizable: true,
    cellRenderer: PaymentDeleteRendererComponent,
  },
  {
    field: 'invoiceNumber',
    headerName: 'Invoice Number',
    width: 185,
    minWidth: 108,
    wrapText: true,
    type:  'rightAligned',
    headerClass: 'custom-wrap',
    ...commonColumn,
  },
  {
    field: 'amount',
    headerName: 'Amount',
    type:  'rightAligned',
    width: 148,
    minWidth: 108,
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
    minWidth: 109,
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
    headerClass: 'custom-wrap',
    minWidth: 110,
    sortable: false,
    resizable: true,
    ...commonColumn,
  },
];

export const PaymentMessages = {
  partialyCovered: (ids: string[]): string => {
    return `Please note that amount assigned to invoices is lower than check\u00A0
    amount and ${ids.join(', ')} is/are partially paid. Are you sure you want to proceed?`;
  },
  partialyNullAmount: (ids: string[]): string => {
    return `Please note that invoices ${ids.join(', ')} is/are partially paid. Are you sure you want to proceed?`;
  },
  lowerAmount: 'Please note that amount assigned to invoices is lower than check amount. Are you sure you want to proceed?',
  negativeAmount: 'Please note that amount assigned to invoices is higher than check amount',
  deleteInvoice: 'Deleting payment details can change invoice status. Are you sure you want to proceed?',
  unsavedData: 'Are you sure you want to leave this page without saving?',
};
