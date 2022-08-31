import { InvoiceDetail, InvoiceInfoUIItem } from '../interfaces';
import { GridValuesHelper } from '../../timesheets/helpers';
import { ColDef } from '@ag-grid-enterprise/all-modules';
import { ValueFormatterParams } from '@ag-grid-community/core/dist/cjs/es5/entities/colDef';
import { formatDate } from '@angular/common';
import { DateTimeHelper } from '@core/helpers';

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
    value: data.meta.paymentTerms,
  },
  {
    title: 'Invoice Amount',
    icon: '',
    value: `$${data.totals.calculatedTotal}`,
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
    value: `${GridValuesHelper.formatDate(data.meta.invoiceDate, 'MM/d/y')}`,
  },
  {
    title: 'Due Date',
    icon: 'calendar',
    value: `${GridValuesHelper.formatDate(data.meta.dueDate, 'MM/d/y')}`,
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
      minWidth: 100,
      flex: 1,
      autoHeight: true,
      wrapText: true,
      cellClass: 'font-weight-bold custom-line-height',
      valueFormatter: (params: ValueFormatterParams) => {
        const weekNum = params.data.weekNumber;
        return `${weekNum} - ${GridValuesHelper.formatDate(params.value, 'ccc M/d/yy')}`.toUpperCase()
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
      valueFormatter: (params: ValueFormatterParams) => {
        return formatDate(DateTimeHelper.toUtcFormat(params.value), 'MM/dd/YYYY HH:mm', 'en-US', 'utc');
      },
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
      valueFormatter: (params: ValueFormatterParams) => {
        return formatDate(DateTimeHelper.toUtcFormat(params.value), 'MM/dd/YYYY HH:mm', 'en-US', 'utc');
      },
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
      field: 'agencyName',
      headerName: 'Agency',
      minWidth: 110,
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
    },
    {
      field: 'rate',
      headerName: 'Bill rate',
      minWidth: 85,
      flex: 1,
      type: 'rightAligned',
      cellClass: 'font-weight-bold align-right',
      headerClass: 'custom-wrap align-right',
      valueFormatter: (params: ValueFormatterParams) => `$${params.value}`,
    },
    {
      field: 'total',
      headerName: 'Total',
      minWidth: 103,
      flex: 1,
      type: 'rightAligned',
      cellClass: 'font-weight-bold align-right',
      headerClass: 'align-right',
      valueFormatter: (params: ValueFormatterParams) => `$${params.value}`,
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
  },
  {
    field: 'calculatedTotal',
    headerName: 'Amount to be Paid',
    width: 150,
    type: 'rightAligned',
    cellClass: 'font-weight-bold align-right',
    headerClass: 'custom-wrap align-right',
    valueFormatter: (params: ValueFormatterParams) => `$${params.value}`,
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
