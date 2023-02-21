import { ColDef } from '@ag-grid-community/core';

import { ToggleIconRendererComponent } from '@shared/components/cell-renderers/toggle-icon-renderer';

const commonCell: ColDef = {
  resizable: true,
  sortable: true,
};

export const UnavaliabilityGridConfig: ColDef[] = [
  {
    field: 'id',
    headerName: '',
    type: 'leftAligned',
    resizable: false,
    sortable: false,
    maxWidth: 140,
    //cellRenderer: UnavaliabilityActionsComponent,
  },
  {
    field: 'reason',
    headerName: 'Reason',
    width: 150,
    type: 'leftAligned',
    ...commonCell,
  },
  {
    field: 'description',
    headerName: 'Description',
    width: 500,
    type: 'leftAligned',
    ...commonCell,
  },
  {
    field: 'calculateTowardsWeeklyHours',
    headerName: 'Calculate Towards Weekly Hours',
    width: 280,
    type: 'leftAligned',
    cellRenderer: ToggleIconRendererComponent,
    ...commonCell,
  },
  {
    field: 'eligibleToBeScheduled',
    headerName: 'Eligible For scheduling',
    width: 280,
    type: 'leftAligned',
    cellRenderer: ToggleIconRendererComponent,
    ...commonCell,
  },
  {
    field: 'visibleForIRPCandidates',
    headerName: 'Visible For irp candidate',
    width: 280,
    type: 'leftAligned',
    cellRenderer: ToggleIconRendererComponent,
    ...commonCell,
  },
];
