import { FieldType, FieldWidthStyle, TableColumnAlign } from '../enums';
import { DetailsTableConfig, DialogConfig } from '../interface';


export const WeekDaysOptions = [
  { text: 'Monday', value: 1 },
  { text: 'Tuesday', value: 2 },
  { text: 'Wednesday', value: 3 },
  { text: 'Thursday', value: 4 },
  { text: 'Friday', value: 5 },
  { text: 'Saturday', value: 6 },
  { text: 'Sunday', value: 0 },
];

export const TimesheetEditDialogConfig: DialogConfig = {
  title: 'Add Record',
  timesheets: [
    {
      title: 'Time in',
      field: 'timeIn',
      type: FieldType.TimeCalendar,
      disabled: false,
      required: true,
      widthStyle: FieldWidthStyle.Short,
    },
    {
      title: 'Time out',
      field: 'timeOut',
      type: FieldType.TimeCalendar,
      disabled: false,
      required: true,
      widthStyle: FieldWidthStyle.Short,
    },
    {
      title: 'Cost center',
      field: 'costCenter',
      type: FieldType.Dropdown,
      disabled: false,
      required: true,
      widthStyle: FieldWidthStyle.Short,
      options: [],
    },
    {
      title: 'Bill Rate Type',
      field: 'billRateConfigId',
      type: FieldType.Dropdown,
      disabled: false,
      required: true,
      widthStyle: FieldWidthStyle.Short,
      options: [],
    },
    {
      title: 'Hours',
      field: 'amount',
      type: FieldType.Input,
      disabled: false,
      required: true,
      valueType: 'number',
      widthStyle: FieldWidthStyle.Short,
    },
  ],
  miles: [
    {
      title: 'Day',
      field: 'day',
      type: FieldType.Date,
      disabled: false,
      required: true,
      widthStyle: FieldWidthStyle.Long,
    },
    {
      title: 'Cost center',
      field: 'costCenter',
      type: FieldType.Dropdown,
      disabled: false,
      required: true,
      widthStyle: FieldWidthStyle.Short,
      options: [],
    },
    {
      title: 'Bill Rate Type',
      field: 'billRateConfigId',
      type: FieldType.Dropdown,
      disabled: false,
      required: true,
      widthStyle: FieldWidthStyle.Short,
      options: [],
    },
    {
      title: 'Miles',
      field: 'amount',
      type: FieldType.Input,
      disabled: false,
      required: true,
      widthStyle: FieldWidthStyle.Long,
    },
  ],
  expenses: [
    {
      title: 'Day',
      field: 'day',
      type: FieldType.Date,
      disabled: false,
      required: true,
      widthStyle: FieldWidthStyle.Long,
    },
    {
      title: 'Cost center',
      field: 'costCenter',
      type: FieldType.Dropdown,
      disabled: false,
      required: true,
      widthStyle: FieldWidthStyle.Short,
      options: [],
    },
    {
      title: 'Bill Rate Type',
      field: 'billRateConfigId',
      type: FieldType.Dropdown,
      disabled: false,
      required: true,
      widthStyle: FieldWidthStyle.Short,
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
      field: 'amount',
      type: FieldType.Input,
      disabled: false,
      required: true,
      widthStyle: FieldWidthStyle.Long,
    },
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
  actions: {
    align: TableColumnAlign.Center,
    width: 88,
    header: '',
  }
}
