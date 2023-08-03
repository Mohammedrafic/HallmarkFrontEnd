import { formatDate } from '@angular/common';
import { Validators } from '@angular/forms';

import { ColDef } from '@ag-grid-community/core';
import { ValueFormatterParams } from '@ag-grid-community/core/dist/cjs/es5/entities/colDef';

import { GridValuesHelper } from '@core/helpers/grid-values.helper';
import { EditFieldTypes } from '@core/enums';
import { AttachmentsListComponent } from '@shared/components/attachments';
import { InvoiceRecordState } from 'src/app/modules/timesheets/enums';
import { TabConfig } from '../interface';
import { ActionsCellComponent } from '../components/cell-editors/actions-cell/actions-cell.component';
import { DropdownEditorComponent } from '../components/cell-editors/dropdown-editor/dropdown-editor.component';
import { GridDateEditorComponent } from '../components/cell-editors/grid-date-editor/grid-date-editor.component';
import { GridDayComponent } from '../components/cell-editors/grid-day/grid-day.component';
import { InputEditorComponent } from '../components/cell-editors/input-editor/input-editor.component';
import { RecordStatusCellComponent } from '../components/cell-editors/record-status-cell/record-status-cell.component';
import { SwitchEditorComponent } from '@shared/components/switch-editor/switch-editor.component';
import { BillRateCalculationType } from '@shared/models';

const commonColumn: ColDef = {
  filter: true,
  sortable: true,
  resizable: true,
};

export const dayColDef: ColDef = {
  field: 'day',
  headerName: 'Day',
  ...commonColumn,
  width: 80,
  minWidth: 80,
  cellRenderer: GridDayComponent,
};

export const editableCostCenterDef: ColDef = {
  field: 'departmentId',
  headerName: 'Cost center',
  ...commonColumn,
  width: 180,
  minWidth: 100,
  filterValueGetter: (value) => value.data.costCenterFormattedName,
  cellRenderer: DropdownEditorComponent,
  type: 'rightAligned',
  headerClass: 'custom-wrap',
  cellRendererParams: {
    editMode: true,
    isEditable: false,
    storeField: 'costCenterOptions',
  },
};

export const billRateColDef: ColDef = {
  field: 'billRate',
  headerName: 'Bill rate',
  type: 'rightAligned',
  headerClass: 'custom-wrap',
  ...commonColumn,
  cellClass: 'common-cell',
  width: 110,
  minWidth: 90,
  valueFormatter: (data) => {
    if(!data.value) return '0';
    return GridValuesHelper.formatCurrencyValue(data.value);
  },
};

export const amountColdef = (headerText: string): ColDef => (
  {
    field: 'value',
    headerName: headerText,
    resizable: true,
    type: 'rightAligned',
    headerClass: 'custom-wrap',
    ...commonColumn,
    cellClass: 'common-cell',
    width: 110,
    minWidth: 100,
    valueFormatter: (params: ValueFormatterParams) => GridValuesHelper.formatNumber(params.value, '1.2-2'),
  }
);

export const actionCol = (isUploadAllowed = false, disableAction = false): ColDef => (
  {
    field: 'id',
    headerName: '',
    type: 'rightAligned',
    flex: 1,
    ...(isUploadAllowed && {
      minWidth: 120,
    }),
    resizable: true,
    cellRenderer: ActionsCellComponent,
    cellRendererParams: {
      editMode: true,
      isEditable: false,
      isUploadAllowed,
      disableAction,
    },
  }
);

export const totalCol: ColDef = {
  field: 'total',
  headerName: 'Total',
  type: 'rightAligned',
  headerClass: 'custom-wrap',
  ...commonColumn,
  cellClass: 'common-cell',
  width: 140,
  minWidth: 90,
  valueFormatter: (data) => {
    if(!data.value) return '0';
    return GridValuesHelper.formatCurrencyValue(data.value);
  },
};

export const attachmentsCol: ColDef = {
  field: 'attachments',
  headerName: 'Attachments',
  ...commonColumn,
  width: 200,
  minWidth: 140,
  cellRenderer: AttachmentsListComponent,
  cellClass: 'invoice-records-attachments-list custom-scroll',
  type: 'rightAligned',
  headerClass: 'custom-wrap',
};

export const billRateTypeStatic: ColDef = {
  field: 'billRateConfigName',
  headerName: 'Bill rate type',
  ...commonColumn,
  width: 180,
  minWidth: 105,
  type: 'rightAligned',
  headerClass: 'custom-wrap',
};

export const recordStatusCell: ColDef = {
  field: 'stateText',
  headerName: 'Status',
  ...commonColumn,
  width: 140,
  cellRenderer: RecordStatusCellComponent,
  headerClass: 'custom-wrap',
};

export const TimesheetRecordsColdef = (isStatusAvaliable = false): ColDef[] =>  ([
  dayColDef,
  ...(isStatusAvaliable ? [recordStatusCell] : []),
  {
    field: 'timeIn',
    headerName: 'Time in',
    ...commonColumn,
    width: 125,
    minWidth: 85,
    cellRenderer: GridDateEditorComponent,
    type: 'rightAligned',
    headerClass: 'custom-wrap',
    cellRendererParams: {
      editMode: true,
      isEditable: false,
      type: EditFieldTypes.Time,
    },
  },
  {
    field: 'timeOut',
    headerName: 'Time out',
    ...commonColumn,
    width: 125,
    minWidth: 85,
    cellRenderer: GridDateEditorComponent,
    type: 'rightAligned',
    headerClass: 'custom-wrap',
    cellRendererParams: {
      editMode: true,
      isEditable: false,
      type: EditFieldTypes.DateTime,
    },
  },
  {
    field: 'hadLunchBreak',
    headerName: 'No Meal Break',
    width: 125,
    minWidth: 105,
    type: 'rightAligned',
    headerClass: 'custom-wrap',
    cellRenderer: SwitchEditorComponent,
    ...commonColumn,
    cellRendererParams: {
      editMode: true,
      storeField: 'billRateTypes',
      disabled: true,
    },
  },
  {
    field: 'location',
    headerName: 'Location',
    ...commonColumn,
    width: 125,
    minWidth: 105,
    headerClass: 'custom-wrap',
    type: 'rightAligned',
  },
  editableCostCenterDef,
  {
    field: 'billRateConfigName',
    headerName: 'Bill rate type',
    ...commonColumn,
    width: 180,
    minWidth: 110,
    filterValueGetter: (value) => { return value.data.billRateConfigName; },
    type: 'rightAligned',
    headerClass: 'custom-wrap',
  },
  amountColdef('Hours'),
  billRateColDef,
  totalCol,
  actionCol(),
]);

export const ExpensesRecordsColDef = (isStatusAvaliable = false): ColDef[] => ([
  dayColDef,
  ...(isStatusAvaliable ? [recordStatusCell] : []),
  editableCostCenterDef,
  {
    ...billRateTypeStatic,
  },
  {
    field: 'manualInvoiceReason',
    headerName: 'Reason',
    ...commonColumn,
    width: 180,
    type: 'rightAligned',
    headerClass: 'custom-wrap',
  },
  {
    field: 'description',
    headerName: 'Description',
    filter: false,
    sortable: false,
    resizable: true,
    width: 400,
    minWidth: 200,
    type: 'leftAligned',
    headerClass: 'custom-wrap',
    cellRenderer: InputEditorComponent,
    cellRendererParams: {
      editMode: true,
      isEditable: false,
      validators: [Validators.maxLength(250)],

    },
  },
  {
    field: 'total',
    headerName: 'Amount',
    type: 'rightAligned',
    headerClass: 'custom-wrap',
    ...commonColumn,
    cellClass: 'common-cell',
    width: 200,
    cellRenderer: InputEditorComponent,
    valueFormatter: (data) => {
      if(!data.value) return '0';
      return GridValuesHelper.formatCurrencyValue(data.value);
    },
    cellRendererParams: {
      editMode: true,
      isEditable: false,
      type: EditFieldTypes.Currency,
      validators: [Validators.min(0), Validators.max(Number.MAX_SAFE_INTEGER), Validators.required],
    },
  },
  actionCol(),
]);

export const HistoricalDataRecordsColDef = (isStatusAvaliable = false): ColDef[] => ([
  {
    field: 'timesheetId',
    headerName: 'Version Id',
    width: 120,
    minWidth: 90,
    resizable: true,
    type: 'rightAligned',
    cellClass: 'common-cell',
  },
  {
    ...dayColDef,
    width: 102,
    minWidth: 90,
    filter: false,
    sortable: false,
  },
  {
    field: 'timeIn',
    headerName: 'Time In',
    width: 92,
    minWidth: 90,
    resizable: true,
    type: 'rightAligned',
    cellClass: 'common-cell',
    valueFormatter: (data) => {
      return formatDate(data.value, 'H:mm', 'en-US', 'UTC');
    },
  },
  {
    field: 'timeOut',
    headerName: 'Time Out',
    width: 100,
    minWidth: 90,
    resizable: true,
    type: 'rightAligned',
    cellClass: 'common-cell',
    valueFormatter: (data) => {
      return formatDate(data.value, 'H:mm', 'en-US', 'UTC');
    },
  },
  {
    field: 'hours',
    headerName: 'Hours',
    width: 90,
    minWidth: 90,
    resizable: true,
    type: 'rightAligned',
    cellClass: ['common-cell', 'bold'],
  },
  {
    field: 'type',
    headerName: 'Type',
    width: 140,
    minWidth: 90,
    resizable: true,
    cellClass: ['common-cell', 'align-left'],
    valueFormatter: (data) => {
      return billRateCalculationTypeMapper[data.value as BillRateCalculationType];
    },
  },
  {
    field: 'state',
    headerName: 'State',
    width: 187,
    minWidth: 90,
    resizable: true,
    cellClass: ['common-cell', 'align-left'],
    cellStyle: (data) => {
      return { color: getStateCellColor(data.value) };
    },
    valueFormatter: (data) => {
      return invoiceRecordStateMapper[data.value as InvoiceRecordState];
    },
  },
  {
    field: 'invoiceId',
    headerName: 'Invoice Id',
    width: 120,
    minWidth: 90,
    resizable: true,
    type: 'rightAligned',
    cellClass: ['common-cell', 'bold'],
  },
]);

export const RecordsTabConfig: TabConfig[] = [
  {
    title: 'Timesheet',
  },
  {
    title: 'Historical Data',
  },
  {
    title: 'Miles',
  },
  {
    title: 'Expenses',
  },
];

export const approveTimesheetDialogData = (timesheetOrMiles = true) => ({
  title: `Approve ${timesheetOrMiles ? 'Timesheet' : 'Mileages'}`,
  submitButtonText: 'Approve',
  confirmMessage: `Are you sure you want to approve this ${timesheetOrMiles ? 'timesheet' : 'mileages'}?`,
  successMessage: `Success. ${timesheetOrMiles ? 'Timesheet' : 'Mileages'} Approved`,
});

export const rejectTimesheetDialogData = (timesheetOrMiles = true) => ({
  successMessage: `Success. ${timesheetOrMiles ? 'Timesheet' : 'Mileages'} Rejected`,
});

export const rejectReasonMaxLength = 250;

export const submitTimesheetDialogData = (timesheetOrMiles = true) => ({
  title: `Submit ${timesheetOrMiles ? 'Timesheet' : 'Mileages'}`,
  submitButtonText: 'Submit',
  confirmMessage: `Are you sure you want to submit this ${timesheetOrMiles ? 'timesheet' : 'mileages'}?`,
  successMessage: `Success. ${timesheetOrMiles ? 'Timesheet' : 'Mileages'} Submitted`,
});

export const orgSubmitEmptyTimesheetDialogData = () => ({
  title: 'Submit Timesheet',
  submitButtonText: 'Ok',
  confirmMessage: 'If the candidate did not work this week, check the DNW switch.',
});

const billRateCalculationTypeMapper = {
  [BillRateCalculationType.Regular]: 'Regular',
  [BillRateCalculationType.RegularLocal]: 'Regular Local',
  [BillRateCalculationType.GuaranteedHours]: 'Guaranteed Hours',
  [BillRateCalculationType.Callback]: 'Callback',
  [BillRateCalculationType.Charge]: 'Charge',
  [BillRateCalculationType.Holiday]: 'Holiday',
  [BillRateCalculationType.Oncall]: 'On call',
  [BillRateCalculationType.Orientation]: 'Orientation',
  [BillRateCalculationType.Preceptor]: 'Preceptor',
  [BillRateCalculationType.Mileage]: 'Mileage',
  [BillRateCalculationType.DailyOT]: 'Daily OT',
  [BillRateCalculationType.DailyPremiumOT]: 'Daily Premium OT',
  [BillRateCalculationType.WeeklyOT]: 'Weekly OT',
  [BillRateCalculationType.SevenDayOT]: 'Seven Day OT',
  [BillRateCalculationType.SevenDayPremiumOT]: 'Seven Day Premium OT',
};

const invoiceRecordStateMapper = {
  [InvoiceRecordState.None]: '',
  [InvoiceRecordState.New]: 'NEW',
  [InvoiceRecordState.Deleted]: 'DELETE',
  [InvoiceRecordState.NotChanged]: 'NOT CHANGED',
};

const invoiceRecordStateColorMapper = {
  [InvoiceRecordState.None]: '#060715',
  [InvoiceRecordState.New]: '#70B16E',
  [InvoiceRecordState.Deleted]: '#FF5858',
  [InvoiceRecordState.NotChanged]: '#060715',
};

const getStateCellColor = (state: InvoiceRecordState): string => {
  return invoiceRecordStateColorMapper[state];
};
