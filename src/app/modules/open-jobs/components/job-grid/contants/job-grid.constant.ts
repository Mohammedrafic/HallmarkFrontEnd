import { formatDate } from '@angular/common';

import { ColDef, ValueFormatterParams } from '@ag-grid-community/core';

import { formatTime } from '@shared/constants';
import { LikeActionComponent } from '../like-action/like-action.component';

const commonCell: ColDef = {
  resizable: true,
  sortable: true,
};

export const JobGridConfig: ColDef[] = [
  {
    field: 'id',
    headerName: '',
    type: 'leftAligned',
    resizable: false,
    sortable: false,
    maxWidth: 140,
    cellRenderer: LikeActionComponent,
  },
  {
    field: 'skillName',
    headerName: 'Skill',
    width: 220,
    type: 'leftAligned',
    ...commonCell,
  },
  {
    field: 'shiftStartDateTime',
    headerName: 'Shift Start Time',
    width: 160,
    type: 'leftAligned',
    ...commonCell,
    valueFormatter: (params: ValueFormatterParams) => {
      return formatDate(params.value, formatTime, 'en-US', 'UTC');
    },
  },
  {
    field: 'shiftEndDateTime',
    headerName: 'Shift End Time',
    width: 160,
    type: 'leftAligned',
    ...commonCell,
    valueFormatter: (params: ValueFormatterParams) => {
      return formatDate(params.value, formatTime, 'en-US', 'UTC');
    },
  },
  {
    field: 'startDate',
    headerName: 'Start Date',
    width: 140,
    type: 'leftAligned',
    ...commonCell,
    valueFormatter: (params: ValueFormatterParams) => {
      return formatDate(params.value, 'MM/dd/yyy', 'en-US', 'UTC');
    },
  },
  {
    field: 'endDate',
    headerName: 'End Date',
    width: 140,
    type: 'leftAligned',
    ...commonCell,
    valueFormatter: (params: ValueFormatterParams) => {
      return formatDate(params.value, 'MM/dd/yyy', 'en-US', 'UTC');
    },
  },
  {
    field: 'orderTypeName',
    headerName: 'Order Type',
    width: 160,
    type: 'leftAligned',
    ...commonCell,
  },
  {
    field: 'departmentName',
    headerName: 'Department',
    minWidth: 200,
    flex: 1,
    type: 'leftAligned',
    ...commonCell,
    valueFormatter: (params: ValueFormatterParams) => {
      if(params.data.isDeprtmentVisible) {
        return params.value;
      }

      return '';
    },
  },
];
