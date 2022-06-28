import { FieldType, TableColumnAlign } from '../enums';
import { DetailsTableConfig, DialogConfig } from '../interface';

export const TimesheetEditDialogConfig: DialogConfig = {
  title: 'Add Record',
  fields: [
    [{
      title: 'Day',
      field: 'day',
      type: FieldType.Dropdown,
      disabled: false,
      required: true,
      options: [
        { text: 'Monday', value: 1 },
        { text: 'Tuesday', value: 2 },
        { text: 'Wednesday', value: 3 },
        { text: 'Thursday', value: 4 },
        { text: 'Friday', value: 5 },
        { text: 'Saturday', value: 6 },
        { text: 'Sunday', value: 7 },
      ],
    }],
    [
      {
        title: 'Time in',
        field: 'timeIn',
        type: FieldType.Time,
        disabled: false,
        required: true,
      },
      {
        title: 'Time out',
        field: 'timeOut',
        type: FieldType.Time,
        disabled: false,
        required: true,
      },
    ],
    [
      {
        title: 'Cost center',
        field: 'costCenter',
        type: FieldType.Dropdown,
        disabled: false,
        required: true,
        options: [{ text: 'FAV-871000', value: 1}, { text: 'DAS-965', value: 2}, { text: 'LES-1000', value: 3}],
      },
      {
        title: 'Category',
        field: 'category',
        type: FieldType.Dropdown,
        disabled: false,
        required: true,
        options: [{ text: 'Regular', value: 1}, { text: 'On-Call', value: 2}, { text: 'Temporary', value: 3}],
      },
    ],
    [
      {
        title: 'Hours/Miles',
        field: 'hours',
        type: FieldType.Input,
        disabled: false,
        required: true,
        valueType: 'number',
      },
      {
        title: 'Rate',
        field: 'rate',
        type: FieldType.Input,
        disabled: false,
        required: true,
        valueType: 'number',
      },
    ],
  ],
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
  costCenter: {
    align: TableColumnAlign.Right,
    width: 130,
    header: 'Cost Center',
  },
  category: {
    align: TableColumnAlign.Right,
    width: 130,
    header: 'Cost Center',
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
  actions: {
    align: TableColumnAlign.Right,
    width: 120,
    header: '',
  }
}
