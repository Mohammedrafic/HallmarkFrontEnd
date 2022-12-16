import { ResizeSettingsModel } from '@syncfusion/ej2-grids/src/grid/base/grid-model';

export const gridConfig = {
  columns: [
    {
      field: 'templateTitle',
      headerText: 'TEMPLATE TITLE',
    },
    {
      field: 'skillName',
      headerText: 'SKILL',
    },
    {
      field: 'regionName',
      headerText: 'REGION',
    },
    {
      field: 'locationName',
      headerText: 'LOCATION',
    },
    {
      field: 'departmentName',
      headerText: 'DEPARTMENT',
    },
  ],
  resizeSettings: { mode: 'Auto' } as ResizeSettingsModel,
  allowSorting: true,
  allowResizing: true,
  enableVirtualization: true,
  height: 185,
};
