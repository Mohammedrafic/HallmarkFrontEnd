import { ColDef } from '@ag-grid-community/core';

import { PageSettings } from '@organization-management/reasons/components/cancel-employee/interfaces';
import {
  ActionCellComponent
} from '@organization-management/reasons/components/cancel-employee/action-cell/action-cell.component';

const commonCell: ColDef = {
  resizable: true,
  sortable: true,
};

export const CancelEmpGripConfig: ColDef[] = [
  {
    field: 'id',
    headerName: '',
    resizable: false,
    sortable: false,
    maxWidth: 140,
    type: 'leftAligned',
    cellRenderer: ActionCellComponent
  },
  {
    field: 'reason',
    headerName: 'Reason',
    minWidth: 130,
    flex: 1,
    type: 'leftAligned',
    ...commonCell,
  },
];

export const CancelEmpPageSettings: PageSettings = {
  currentPage: 1,
  pageSize: 100,
}
