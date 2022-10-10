import { Validators } from '@angular/forms';

import { ColDef, ICellRendererParams } from '@ag-grid-community/core';
import { GridValuesHelper } from '@core/helpers/grid-values.helper';
import { EditFieldTypes } from '@core/enums';
import { Attachment, AttachmentsListComponent, AttachmentsListParams } from '@shared/components/attachments';
import { ValueFormatterParams } from '@ag-grid-community/core/dist/cjs/es5/entities/colDef';

import { RecordFields } from '../enums';
import { TabConfig } from '../interface';
import { ActionsCellComponent } from '../components/cell-editors/actions-cell/actions-cell.component';
import { DropdownEditorComponent } from '../components/cell-editors/dropdown-editor/dropdown-editor.component';
import { GridDateEditorComponent } from '../components/cell-editors/grid-date-editor/grid-date-editor.component';
import { GridDayComponent } from '../components/cell-editors/grid-day/grid-day.component';
import { InputEditorComponent } from '../components/cell-editors/input-editor/input-editor.component';
import { RecordStatusCellComponent } from '../components/cell-editors/record-status-cell/record-status-cell.component';

const commonColumn: ColDef = {
  filter: true,
  sortable: true,
  resizable: true,
}

export const dayColDef: ColDef = {
  field: 'day',
  headerName: 'Day',
  ...commonColumn,
  width: 80,
  cellRenderer: GridDayComponent,
};

export const editableCostCenterDef: ColDef = {
  field: 'departmentId',
  headerName: 'Cost center',
  ...commonColumn,
  width: 180,
  filterValueGetter: (value) => value.data.costCenterFormattedName,
  cellRenderer: DropdownEditorComponent,
  type: 'rightAligned',
  cellRendererParams: {
    editMode: true,
    isEditable: false,
    storeField: 'costCenterOptions'
  }
};

export const billRateColDef: ColDef = {
  field: 'billRate',
  headerName: 'Bill rate',
  type: 'rightAligned',
  ...commonColumn,
  cellClass: 'common-cell',
  width: 110,
  valueFormatter: (data) => {
    if(!data.value) return '0'
    return GridValuesHelper.formatCurrency(data.value)
  },
};

export const amountColdef = (headerText: string): ColDef => (
  {
    field: 'value',
    headerName: headerText,
    resizable: true,
    type: 'rightAligned',
    ...commonColumn,
    cellClass: 'common-cell',
    width: 110,
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
    }
  }
);

export const totalCol: ColDef = {
  field: 'total',
  headerName: 'Total',
  type: 'rightAligned',
  ...commonColumn,
  cellClass: 'common-cell',
  width: 140,
  valueFormatter: (data) => {
    if(!data.value) return '0'
    return GridValuesHelper.formatCurrency(data.value)
  },
};

export const attachmentsCol: ColDef = {
  field: 'attachments',
  headerName: 'Attachments',
  ...commonColumn,
  width: 200,
  cellRenderer: AttachmentsListComponent,
  cellClass: 'invoice-records-attachments-list custom-scroll',
  type: 'rightAligned',
};

export const billRateTypeStatic: ColDef = {
  field: 'billRateConfigName',
  headerName: 'Bill rate type',
  ...commonColumn,
  width: 180,
  type: 'rightAligned',
};

export const recordStatusCell: ColDef = {
  field: 'stateText',
  headerName: 'Status',
  ...commonColumn,
  width: 140,
  cellRenderer: RecordStatusCellComponent,
}

export const TimesheetRecordsColdef = (isStatusAvaliable = false): ColDef[] =>  ([
  dayColDef,
  ...(isStatusAvaliable ? [recordStatusCell] : []),
  {
    field: 'timeIn',
    headerName: 'Time in',
    ...commonColumn,
    width: 125,
    cellRenderer: GridDateEditorComponent,
    type: 'rightAligned',
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
    cellRenderer: GridDateEditorComponent,
    type: 'rightAligned',
    cellRendererParams: {
      editMode: true,
      isEditable: false,
      type: EditFieldTypes.DateTime,
    },
  },
  editableCostCenterDef,
  {
    field: 'billRateConfigName',
    headerName: 'Bill rate type',
    ...commonColumn,
    width: 180,
    filterValueGetter: (value) => { return value.data.billRateConfigName },
    type: 'rightAligned',
  },
  amountColdef('Hours'),
  billRateColDef,
  totalCol,
  actionCol(),
]);

export const MilesRecordsColDef = (isStatusAvaliable = false): ColDef[] => ([
  dayColDef,
  ...(isStatusAvaliable ? [recordStatusCell] : []),
  {
    ...editableCostCenterDef,
    width: 220,
  },
  {
    ...billRateTypeStatic,
    width: 200,
  },
  attachmentsCol,
  {
    ...amountColdef('Miles'),
    width: 200,
    cellRenderer: InputEditorComponent,
    cellRendererParams: {
      editMode: true,
      isEditable: false,
      type: EditFieldTypes.Text,
      validators: [Validators.min(0), Validators.max(24), Validators.required],
    }
  },
  {
    ...billRateColDef,
    width: 150,
  },
  {
    ...totalCol,
    width: 200,
  },
  actionCol(true),
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
  },
  {
    field: 'description',
    headerName: 'Description',
    filter: false,
    sortable: false,
    resizable: true,
    width: 400,
    type: 'leftAligned',
    cellRenderer: InputEditorComponent,
    cellRendererParams: {
      editMode: true,
      isEditable: false,
      validators: [Validators.maxLength(250)],

    }
  },
  {
    field: 'total',
    headerName: 'Amount',
    type: 'rightAligned',
    ...commonColumn,
    cellClass: 'common-cell',
    width: 200,
    cellRenderer: InputEditorComponent,
    valueFormatter: (data) => {
      if(!data.value) return '0'
      return GridValuesHelper.formatCurrency(data.value)
    },
    cellRendererParams: {
      editMode: true,
      isEditable: false,
      type: EditFieldTypes.Currency,
      validators: [Validators.min(0), Validators.max(Number.MAX_SAFE_INTEGER), Validators.required],
    }
  },
  actionCol(),
]);

export const TimesheetRecordsColConfig: Record<string, ((isStatusAvaliable: boolean) => ColDef[])> = {
  [RecordFields.Time]: TimesheetRecordsColdef,
  [RecordFields.Miles]: MilesRecordsColDef,
  [RecordFields.Expenses]: ExpensesRecordsColDef,
}

export const RecordsTabConfig: TabConfig[] = [
  {
    title: 'Timesheet',
  },
  {
    title: 'Miles',
  },
  {
    title: 'Expenses',
  },
];

export const approveTimesheetDialogData = (timesheetOrMiles: boolean = true) => ({
  title: `Approve ${timesheetOrMiles ? 'Timesheet' : 'Mileages'}`,
  submitButtonText: 'Approve',
  confirmMessage: `Are you sure you want to approve this ${timesheetOrMiles ? 'timesheet' : 'mileages'}?`,
  successMessage: `Success. ${timesheetOrMiles ? 'Timesheet' : 'Mileages'} Approved`,
});

export const rejectTimesheetDialogData = (timesheetOrMiles: boolean = true) => ({
  successMessage: `Success. ${timesheetOrMiles ? 'Timesheet' : 'Mileages'} Rejected`,
});

export const rejectReasonMaxLength: number = 250;

export const submitTimesheetDialogData = (timesheetOrMiles: boolean = true) => ({
  title: `Submit ${timesheetOrMiles ? 'Timesheet' : 'Mileages'}`,
  submitButtonText: 'Submit',
  confirmMessage: `Are you sure you want to submit this ${timesheetOrMiles ? 'timesheet' : 'mileages'}?`,
  successMessage: `Success. ${timesheetOrMiles ? 'Timesheet' : 'Mileages'} Submitted`,
});
