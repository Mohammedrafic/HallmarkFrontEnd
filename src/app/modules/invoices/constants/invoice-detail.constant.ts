import { formatDate } from '@angular/common';

import { DateTimeHelper, GridValuesHelper } from '@core/helpers';
import { ColDef } from '@ag-grid-enterprise/all-modules';
import { ValueFormatterParams } from '@ag-grid-community/core/dist/cjs/es5/entities/colDef';

import { InvoiceDetail, InvoiceInfoUIItem } from '../interfaces';
import { INVOICES_STATUSES, InvoicesActionBtn, InvoiceState } from '../enums';

const hallmarkName = 'Hallmark';

export const invoiceInfoItems = (data: InvoiceDetail, isAgency: boolean): InvoiceInfoUIItem[] => [
  {
    title: 'Invoice to',
    icon: 'user',
    value: isAgency ? hallmarkName : data.meta.unitName,
  },
  {
    title: 'Invoice from',
    icon: 'user',
    value: isAgency ? data.meta.unitName : hallmarkName,
  },
  {
    title: 'Net Payment Terms',
    icon: 'package',
    value: GridValuesHelper.formatAbsNumber(data.meta.paymentTerms, '1.2-2'),
  },
  {
    title: 'Invoice Amount',
    icon: '',
    value: `$${GridValuesHelper.formatAbsNumber(data.totals.calculatedTotal, '1.2-2')}`,
    isAmount: true,
  },
  {
    title: 'Address',
    icon: 'map-pin',
    value: data.meta.unitAddress,
  },
  {
    title: 'Invoice Date',
    icon: 'calendar',
    value: formatDate(DateTimeHelper.toUtcFormat(data.meta.invoiceDate), 'MM/dd/yyyy', 'en-US', 'utc'),
  },
  {
    title: 'Due Date',
    icon: 'calendar',
    value: formatDate(DateTimeHelper.toUtcFormat(data.meta.dueDate), 'MM/dd/yyyy', 'en-US', 'utc'),
  },
];

const agencyCol: ColDef = {
  field: 'fee',
  headerName: 'Agency fee',
  width: 120,
  type: 'rightAligned',
  headerClass: 'custom-wrap align-right',
  cellClass: 'font-weight-bold align-right',
  valueFormatter: (params: ValueFormatterParams) => `% ${params.value}`,
};

export const invoiceDetailsColumnDefs = (isAgency: boolean): ColDef[] => {
  const result: ColDef[] = [
    {
      field: 'weekDate',
      headerName: 'Week',
      minWidth: 102,
      flex: 1,
      autoHeight: true,
      wrapText: true,
      cellClass: 'font-weight-bold custom-line-height',
      valueFormatter: (params: ValueFormatterParams) => {
        const weekNum = params.data.weekNumber;
        return `${weekNum} - ${GridValuesHelper.formatDate(params.value, 'ccc MM/dd/yyyy')}`.toUpperCase();
      },
    },
    {
      field: 'timeIn',
      headerName: 'Time in',
      minWidth: 110,
      flex: 1,
      type: 'rightAligned',
      autoHeight: true,
      wrapText: true,
      cellClass: 'align-right custom-line-height',
      headerClass: 'custom-wrap align-right',
      valueFormatter: (params: ValueFormatterParams) => DateTimeHelper.formatDateUTC(params.value, 'MM/dd/YYYY HH:mm'),
    },
    {
      field: 'timeOut',
      headerName: 'Time out',
      minWidth: 110,
      flex: 1,
      type: 'rightAligned',
      autoHeight: true,
      wrapText: true,
      cellClass: 'align-right custom-line-height',
      headerClass: 'custom-wrap align-right',
      valueFormatter: (params: ValueFormatterParams) => DateTimeHelper.formatDateUTC(params.value, 'MM/dd/YYYY HH:mm'),
    },
    {
      field: 'billRateConfigName',
      headerName: 'Bill rate type',
      minWidth: 120,
      flex: 1,
      autoHeight: true,
      wrapText: true,
      cellClass: 'custom-line-height',
      headerClass: 'custom-wrap',
    },
    {
      field: 'costCenterFormattedName',
      headerName: 'Cost center',
      minWidth: 160,
      flex: 1,
      autoHeight: true,
      wrapText: true,
      cellClass: 'custom-line-height',
    },
    {
      field: 'formattedJobId',
      headerName: 'Job id',
      minWidth: 100,
      flex: 1,
      autoHeight: true,
      wrapText: true,
      cellClass: 'custom-line-height',
    },
    {
      field: '',
      headerName: 'Candidate name',
      minWidth: 150,
      flex: 1,
      autoHeight: true,
      wrapText: true,
      cellClass: 'custom-line-height',
      headerClass: 'custom-wrap',
      valueFormatter: (params: ValueFormatterParams) => {
        return `${params.data.candidateFirstName}, ${params.data.candidateLastName}`;
      },
    },
    {
      field: isAgency ? 'organizationName' : 'agencyName',
      headerName: isAgency ? 'Organization' : 'Agency',
      minWidth: isAgency ? 160 : 110,
      flex: 1,
      autoHeight: true,
      wrapText: true,
      cellClass: 'custom-line-height',
    },
    {
      field: 'skillName',
      headerName: 'Skill',
      minWidth: 100,
      flex: 1,
      autoHeight: true,
      wrapText: true,
      cellClass: 'custom-line-height',
    },
    {
      field: 'value',
      headerName: 'Hours /Miles',
      minWidth: 100,
      flex: 1,
      type: 'rightAligned',
      cellClass: 'font-weight-bold align-right',
      headerClass: 'custom-wrap align-right',
      valueFormatter: (params: ValueFormatterParams) => GridValuesHelper.formatAbsNumber(params.value, '1.2-2'),
    },
    {
      field: 'rate',
      headerName: 'Bill rate',
      minWidth: 85,
      flex: 1,
      type: 'rightAligned',
      cellClass: 'font-weight-bold align-right',
      headerClass: 'custom-wrap align-right',
      valueFormatter: (params: ValueFormatterParams) => `$${GridValuesHelper.formatAbsNumber(params.value, '1.2-2')}`,
    },
    {
      field: 'total',
      headerName: 'Total',
      minWidth: 103,
      flex: 1,
      type: 'rightAligned',
      cellClass: 'font-weight-bold align-right',
      headerClass: 'align-right',
      valueFormatter: (params: ValueFormatterParams) => `$${GridValuesHelper.formatAbsNumber(params.value, '1.2-2')}`,
    },
  ];
  if (isAgency) {
    result.push(agencyCol);
  }

  return result;
};

export const invoiceSummaryColumnDefs = (location: string): ColDef[] => [
  {
    field: '',
    headerName: 'Location',
    minWidth: 100,
    autoHeight: true,
    wrapText: true,
    cellClass: 'custom-line-height',
    valueFormatter: () => location,
  },
  {
    field: 'departmentName',
    headerName: 'Department',
    minWidth: 140,
    autoHeight: true,
    wrapText: true,
    cellClass: 'custom-line-height',
  },
  {
    field: 'costCenterFormattedName',
    headerName: 'Cost center',
    minWidth: 180,
    autoHeight: true,
    wrapText: true,
    cellClass: 'custom-line-height',
  },
  {
    field: 'skillName',
    headerName: 'Skill',
    minWidth: 100,
    autoHeight: true,
    wrapText: true,
    cellClass: 'custom-line-height',
  },
  {
    field: 'value',
    headerName: 'Hours /Miles',
    width: 140,
    type: 'rightAligned',
    cellClass: 'font-weight-bold align-right',
    headerClass: 'custom-wrap align-right',
    valueFormatter: (params: ValueFormatterParams) => GridValuesHelper.formatAbsNumber(params.value, '1.2-2'),
  },
  {
    field: 'calculatedTotal',
    headerName: 'Amount to be Paid',
    width: 150,
    type: 'rightAligned',
    cellClass: 'font-weight-bold align-right',
    headerClass: 'custom-wrap align-right',
    valueFormatter: (params: ValueFormatterParams) => `$${GridValuesHelper.formatAbsNumber(params.value, '1.2-2')}`,
  },
  {
    field: 'details',
    headerName: 'ACCT Unit - Dept GL ACCT',
    minWidth: 300,
    type: 'rightAligned',
    cellClass: 'font-weight-bold align-right',
    headerClass: 'align-right',
  },
];

export const ActionBtnOnStatus: Map<INVOICES_STATUSES, InvoicesActionBtn> = new Map<INVOICES_STATUSES, InvoicesActionBtn>()
  .set(INVOICES_STATUSES.SUBMITED_PEND_APPR, InvoicesActionBtn.Approve)
  .set(INVOICES_STATUSES.PENDING_PAYMENT, InvoicesActionBtn.Pay);

export const AgencyActionBtnOnStatus: Map<INVOICES_STATUSES,
InvoicesActionBtn> = new Map<INVOICES_STATUSES, InvoicesActionBtn>()
  .set(INVOICES_STATUSES.SUBMITED_PEND_APPR, InvoicesActionBtn.Pay)
  .set(INVOICES_STATUSES.PENDING_PAYMENT, InvoicesActionBtn.Pay);

export const NewStatusDependsOnAction: Map<string, InvoiceState> = new Map<string, InvoiceState>()
  .set(InvoicesActionBtn.Approve, InvoiceState.PendingPayment)
  .set(InvoicesActionBtn.Pay, InvoiceState.Paid);
