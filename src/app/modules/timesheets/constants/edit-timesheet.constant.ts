import { FieldType, FieldWidthStyle } from '@core/enums';
import { RecordFields, TableColumnAlign } from '../enums';
import { DetailsTableConfig, DialogConfig } from '../interface';

export const RecordAddDialogConfig: DialogConfig = {
  timesheets: {
    title: 'Add Timesheet Record',
    fields: [
      {
        title: 'Day',
        field: 'day',
        type: FieldType.Date,
        disabled: false,
        required: true,
        widthStyle: FieldWidthStyle.Long,
      },
      {
        title: 'Time in',
        field: 'timeIn',
        type: FieldType.Time,
        disabled: false,
        required: true,
        widthStyle: FieldWidthStyle.Short,
      },
      {
        title: 'Time out',
        field: 'timeOut',
        type: FieldType.Time,
        disabled: false,
        required: true,
        widthStyle: FieldWidthStyle.Short,
      },
      {
        title: 'Cost center',
        field: 'departmentId',
        type: FieldType.Dropdown,
        disabled: false,
        required: true,
        widthStyle: FieldWidthStyle.Short,
        optionsStateKey: 'costCenterOptions',
        options: [],
      },
      {
        title: 'Bill Rate Type',
        field: 'billRateConfigId',
        type: FieldType.Dropdown,
        disabled: false,
        required: true,
        widthStyle: FieldWidthStyle.Short,
        optionsStateKey: 'billRateTypes',
        options: [],
      },
    ],
  },
  miles: {
    title: 'Add Miles Record',
    fields: [
      {
        title: 'Day',
        field: 'timeIn',
        type: FieldType.Date,
        disabled: false,
        required: true,
        widthStyle: FieldWidthStyle.Short,
      },
      {
        title: 'Cost center',
        field: 'departmentId',
        type: FieldType.Dropdown,
        disabled: false,
        required: true,
        widthStyle: FieldWidthStyle.Short,
        optionsStateKey: 'costCenterOptions',
        options: [],
      },
      {
        title: 'Miles',
        field: 'value',
        type: FieldType.Input,
        disabled: false,
        required: true,
        widthStyle: FieldWidthStyle.Short,
      },
    ],
  },
  expenses: {
    title: 'Add Expenses Record',
    fields: [
      {
        title: 'Day',
        field: 'timeIn',
        type: FieldType.Date,
        disabled: false,
        required: true,
        widthStyle: FieldWidthStyle.Short,
      },
      {
        title: 'Cost center',
        field: 'departmentId',
        type: FieldType.Dropdown,
        disabled: false,
        required: true,
        widthStyle: FieldWidthStyle.Short,
        optionsStateKey: 'costCenterOptions',
        options: [],
      },
      {
        title: 'Description',
        field: 'description',
        type: FieldType.Input,
        disabled: false,
        required: true,
        widthStyle: FieldWidthStyle.Long,
      },
      {
        title: 'Expenses',
        field: 'value',
        type: FieldType.Input,
        disabled: false,
        required: true,
        widthStyle: FieldWidthStyle.Short,
      },
    ],
  }
};

export const ProfileTimesheetTableConfig: DetailsTableConfig = {
  day: {
    align: TableColumnAlign.Right,
    width: 85,
    header: 'Day',
  },
  timeIn: {
    align: TableColumnAlign.Right,
    width: 120,
    header: 'Time In',
  },
  timeOut: {
    align: TableColumnAlign.Right,
    width: 120,
    header: 'Time Out',
  },
  category: {
    align: TableColumnAlign.Right,
    width: 130,
    header: 'Bill Rate Type',
    dataSource: [
      {
        id: 1,
        text: 'Regular'
      },
      {
        id: 2,
        text: 'Fixed'
      },
    ],
  },
  costCenter: {
    align: TableColumnAlign.Right,
    width: 130,
    header: 'Cost Center',
    dataSource: [
      {
        id: 1,
        text: 'FAV-87100'
      },
      {
        id: 2,
        text: 'FAV-90'
      },
    ],
  },
  hours: {
    align: TableColumnAlign.Right,
    width: 115,
    header: 'Hours/Miles',
  },
  rate: {
    align: TableColumnAlign.Right,
    width: 110,
    header: 'Bill Rate',
  },
  total: {
    align: TableColumnAlign.Right,
    width: 100,
    header: 'Total',
  },
}

export const MapedRecordsType = {
  [RecordFields.Time]: 1,
  [RecordFields.Miles]: 2,
  [RecordFields.Expenses]: 3,
}

export const AddSuccessMessage = {
  successMessage: 'Record was added successfully',
}

export const PutSuccess = {
  successMessage: 'Records were updated successfully'
}

export const GetBydateErrMessage = 'Timesheet for selected week does not exist';
