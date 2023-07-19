import { formatDate } from '@angular/common';

import { ValueFormatterParams } from '@ag-grid-community/core/dist/cjs/es5/entities/colDef';
import { ColDef } from '@ag-grid-enterprise/all-modules';
import { DateTimeHelper, GridValuesHelper } from '@core/helpers';

import { TypedValueGetterParams } from '@core/interface';
import { InvoicesActionBtn, InvoiceState, INVOICES_STATUSES } from '../enums';
import { InvoiceDetail, InvoiceInfoUIItem, InvoiceSummaryItem } from '../interfaces';

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
    value: formatDate(DateTimeHelper.setUtcTimeZone(data.meta.invoiceDate), 'MM/dd/yyyy', 'en-US', 'utc'),
  },
  {
    title: 'Due Date',
    icon: 'calendar',
    value: formatDate(DateTimeHelper.setUtcTimeZone(data.meta.dueDate), 'MM/dd/yyyy', 'en-US', 'utc'),
  },
];

const agencyCol: ColDef = {
  field: 'fee',
  headerName: 'Agency fee',
  width: 120,
  type: 'rightAligned',
  headerClass: 'custom-wrap align-right',
  cellClass: 'font-weight-bold align-right',
  valueFormatter: (params: ValueFormatterParams) => `${params.value}%`,
};

export const invoiceDetailsColumnDefs = (isAgency: boolean): ColDef[] => {
  const result: ColDef[] = [
    {
      field: 'weekDate',
      headerName: 'Week',
      width: 140,
      minWidth: 90,
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
      width: 150,
      minWidth: 103,
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
      width: 150,
      minWidth: 103,
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
      width: 140,
      minWidth: 100,
      autoHeight: true,
      wrapText: true,
      cellClass: 'custom-line-height',
      headerClass: 'custom-wrap',
    },
    {
      field: 'costCenterFormattedName',
      headerName: 'Cost center',
      width: 160,
      minWidth: 100,
      autoHeight: true,
      wrapText: true,
      cellClass: 'custom-line-height',
      headerClass: 'custom-wrap',
    },
    {
      field: 'formattedJobId',
      headerName: 'Job id',
      width: 100,
      minWidth: 85,
      autoHeight: true,
      wrapText: true,
      cellClass: 'custom-line-height',
      headerClass: 'custom-wrap',
    },
    {
      field: '',
      headerName: 'Candidate name',
      width: 160,
      minWidth: 120,
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
      width: isAgency ? 160 : 120,
      minWidth: isAgency ? 120 : 110,
      autoHeight: true,
      wrapText: true,
      cellClass: 'custom-line-height',
    },
    {
      field: 'skillName',
      headerName: 'Skill',
      width: 100,
      minWidth: 85,
      autoHeight: true,
      wrapText: true,
      cellClass: 'custom-line-height',
    },
    {
      field: 'value',
      headerName: 'Hours /Miles',
      width: 135,
      minWidth: 100,
      type: 'rightAligned',
      cellClass: 'font-weight-bold align-right',
      headerClass: 'custom-wrap align-right',
      valueFormatter: (params: ValueFormatterParams) => {
        const formatedValue = GridValuesHelper.formatAbsNumber(params.value, '1.2-2');

        if (params.data.total > 0) {
          return formatedValue;
        }

        return `(${formatedValue})`;
      },
    },
    {
      field: 'rate',
      headerName: 'Bill rate',
      width: 110,
      minWidth: 85,
      type: 'rightAligned',
      cellClass: 'font-weight-bold align-right',
      headerClass: 'custom-wrap align-right',
      valueFormatter: (params: ValueFormatterParams) => `$${GridValuesHelper.formatAbsNumber(params.value, '1.2-2')}`,
    },
    {
      field: 'total',
      headerName: 'Total',
      width: 130,
      minWidth: 100,
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

export const InvoiceSummaryColumnDefs: ColDef[] = [
  {
    field: 'locationName',
    headerName: 'Location',
    width: 150,
    minWidth: 125,
    autoHeight: true,
    wrapText: true,
    cellClass: 'custom-line-height',
  },
  {
    field: 'departmentName',
    headerName: 'Department',
    width: 160,
    minWidth: 140,
    autoHeight: true,
    wrapText: true,
    cellClass: 'custom-line-height',
  },
  {
    field: 'costCenterFormattedName',
    headerName: 'Cost center',
    width: 160,
    minWidth: 100,
    autoHeight: true,
    wrapText: true,
    cellClass: 'custom-line-height',
    headerClass: 'custom-wrap',
  },
  {
    field: 'skillName',
    headerName: 'Skill',
    width: 120,
    minWidth: 95,
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
    width: 175,
    minWidth: 135,
    type: 'rightAligned',
    cellClass: 'font-weight-bold align-right',
    headerClass: 'custom-wrap align-right',
    valueFormatter: (params: ValueFormatterParams) => `$${GridValuesHelper.formatAbsNumber(params.value, '1.2-2')}`,
  },
  {
    field: 'details',
    headerName: 'ACCT Unit - Dept GL ACCT',
    width: 300,
    minWidth: 140,
    type: 'rightAligned',
    cellClass: 'font-weight-bold align-right',
    headerClass: 'custom-wrap align-right',
    valueGetter: (params: TypedValueGetterParams<InvoiceSummaryItem>) => {
      const loactionIdText = params.data.locationIExternalId  ? `${params.data.locationIExternalId}-` : '';
      const departmentIdText = params.data.invoiceDepartmentId ? `-${params.data.invoiceDepartmentId}` : '';
      const skillGlText = params.data.skillGLNumber ? `-${params.data.skillGLNumber}` : '';

      return `${loactionIdText}${params.data.departmentName}${departmentIdText}${skillGlText}`;
    },
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
