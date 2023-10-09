import { formatDate } from '@angular/common';

import { ColDef, ValueFormatterParams } from '@ag-grid-community/core';

import * as Formats from '@shared/constants';
import { OrderJobType } from '@shared/enums';

const commonCell: ColDef = {
  resizable: true,
  sortable: true,
};

export const MyJobsGridConfig: ColDef[] = [
  {
    field: 'locationName',
    headerName: 'Location',
    width: 300,
    ...commonCell,
  },
  {
    field: 'departmentName',
    headerName: 'Department',
    width: 200,
    ...commonCell,
    valueFormatter: (params: ValueFormatterParams) => {
      if(params.data.isDeprtmentVisible) {
        return params.value;
      }

      return '';
    },
  },
  {
    field: 'positionId',
    headerName: 'Position ID',
    width: 130,
    ...commonCell,
    sortable: false,
  },
  {
    field: 'startDate',
    headerName: 'Start Date',
    width: 140,
    ...commonCell,
    valueFormatter: (params: ValueFormatterParams) => {
      return formatDate(params.value, Formats.formatDate, 'en-US', 'UTC');
    },
  },
  {
    field: 'endDate',
    headerName: 'End Date',
    width: 140,
    ...commonCell,
    valueFormatter: (params: ValueFormatterParams) => {
      return formatDate(params.value, Formats.formatDate, 'en-US', 'UTC');
    },
  },
  {
    field: 'shiftStartDateTime',
    headerName: 'Shift Start Time',
    width: 160,
    type: 'rightAligned',
    ...commonCell,
    valueFormatter: (params: ValueFormatterParams) => {
      return formatDate(params.value, Formats.formatTime, 'en-US', 'UTC');
    },
  },
  {
    field: 'shiftEndDateTime',
    headerName: 'Shift End Time',
    width: 160,
    type: 'rightAligned',
    ...commonCell,
    valueFormatter: (params: ValueFormatterParams) => {
      return formatDate(params.value, Formats.formatTime, 'en-US', 'UTC');
    },
  },
  {
    field: 'orderType',
    headerName: 'Order Type',
    minWidth: 130,
    flex: 1,
    ...commonCell,
    valueFormatter: (params: ValueFormatterParams) => {
      return OrderTypeName[params.value];
    },
  },
];

export const OrderTypeName: Record<number, string> = {
  [OrderJobType.LTA]: 'L',
  [OrderJobType.PerDiem]: 'D',
};
