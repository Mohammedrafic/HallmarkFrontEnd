import { ActionsCellComponent } from './../components/cell-editors/actions-cell/actions-cell.component';
import { ColDef } from '@ag-grid-community/core';

import { DropdownEditorComponent } from '../components/cell-editors/dropdown-editor/dropdown-editor.component';
import { GridDateEditorComponent } from '../components/cell-editors/grid-date-editor/grid-date-editor.component';
import { GridDayComponent } from '../components/cell-editors/grid-day/grid-day.component';
import { GridValuesHelper } from '../helpers/grid-values.helper';

const valueHelper = new GridValuesHelper();

const commonColumn: ColDef = {
  filter: true,
  sortable: true,
  resizable: true,
}

export const TimesheetRecordsColdef: ColDef[] = [
  {
    field: 'day',
    headerName: 'Day',
    ...commonColumn,
    initialWidth: 80,
    cellRenderer: GridDayComponent,
  },
  {
    field: 'timeIn',
    headerName: 'Time in',
    ...commonColumn,
    initialWidth: 120,
    cellRenderer: GridDateEditorComponent,
    type: 'rightAligned',
    cellRendererParams: {
      editMode: true,
      isEditable: false,
    },
    valueFormatter: (data) => valueHelper.formatDate(data.value, 'HH:mm'),
  },
  {
    field: 'timeOut',
    headerName: 'Time out',
    ...commonColumn,
    initialWidth: 120,
    cellRenderer: GridDateEditorComponent,
    type: 'rightAligned',
    cellRendererParams: {
      editMode: true,
      isEditable: false,
    },
    valueFormatter: (data) => valueHelper.formatDate(data.value, 'HH:mm'),
  },
  {
    field: 'costCenter',
    headerName: 'Cost center',
    ...commonColumn,
    initialWidth: 200,
    minWidth: 135,
    cellRenderer: DropdownEditorComponent,
    type: 'rightAligned',
    cellRendererParams: {
      editMode: true,
      isEditable: false,
      options: [],
    }
  },
  {
    field: 'billRateType',
    headerName: 'Bill rate type',
    ...commonColumn,
    width: 220,
    minWidth: 150,
    cellRenderer: DropdownEditorComponent,
    type: 'rightAligned',
    cellRendererParams: {
      editMode: true,
      isEditable: false,
      options: [],
    }
  },
  {
    field: 'amount',
    headerName: 'Hours',
    type: 'rightAligned',
    ...commonColumn,
    initialWidth: 110,
    maxWidth: 110,
  },
  {
    field: 'rate',
    headerName: 'Bill rate',
    type: 'rightAligned',
    ...commonColumn,
    initialWidth: 110,
    minWidth: 110,
    valueFormatter: (data) => valueHelper.formatCurrency(data.value),
  },
  {
    field: 'total',
    headerName: 'Total',
    type: 'rightAligned',
    ...commonColumn,
    initialWidth: 110,
    maxWidth: 110,
    valueFormatter: (data) => valueHelper.formatCurrency(data.value),
  },
  {
    field: 'id',
    headerName: '',
    type: 'rightAligned',
    resizable: false,
    width: 40,
    cellRenderer: ActionsCellComponent,
    cellRendererParams: {
      editMode: true,
      isEditable: false,
    }
  }
];

export const submitTimesheetDialogData = {
  title: 'Submit Timesheet',
  submitButtonText: 'Submit',
  confirmMessage: 'Are you sure you want to submit this timesheet?',
  successMessage: 'Success. Timesheet Submitted',
};

export const approveTimesheetDialogData = {
  title: 'Approve Timesheet',
  submitButtonText: 'Approve',
  confirmMessage: 'Are you sure you want to approve this timesheet?',
  successMessage: 'Success. Timesheet Approved',
};
