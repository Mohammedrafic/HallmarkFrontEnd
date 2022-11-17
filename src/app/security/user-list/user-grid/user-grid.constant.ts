import { ColDef } from '@ag-grid-community/core';
import { ExportColumn } from '@shared/models/export.model';

export const DefaultUserGridColDef: ColDef = {
  flex: 2,
  minWidth: 120,
  resizable: true,
  sortable: true,
  filter: true,
};

export const AutoGroupColDef: ColDef = {
  flex: 1,
  minWidth: 280,
  field: 'name',
};

export const SideBarConfig = {
  toolPanels: [
    {
      id: 'columns',
      labelDefault: 'Columns',
      labelKey: 'columns',
      iconKey: 'columns',
      toolPanel: 'agColumnsToolPanel',
      toolPanelParams: {
        suppressRowGroups: true,
        suppressValues: true,
        suppressPivots: true,
        suppressPivotMode: true,
        suppressColumnFilter: true,
        suppressColumnSelectAll: true,
        suppressColumnExpandAll: true,
      },
    },
    {
      id: 'filters',
      labelDefault: 'Filters',
      labelKey: 'filters',
      iconKey: 'filters',
      toolPanel: 'agFiltersToolPanel',
      toolPanelParams: {
        suppressRowGroups: true,
        suppressValues: true,
        suppressPivots: true,
        suppressPivotMode: true,
        suppressColumnFilter: true,
        suppressColumnSelectAll: true,
        suppressColumnExpandAll: true,
      },
    },
  ],
};

export const UserListExportOptions: ExportColumn[] = [
  { text: 'First Name', column: 'FirstName' },
  { text: 'Last Name', column: 'LastName' },
  { text: 'Status', column: 'Status' },
  { text: 'Email', column: 'Email' },
  { text: 'Role', column: 'Role' },
  { text: 'Business', column: 'Business' },
  { text: 'Visibility', column: 'Visibility' },
  { text: 'Last Login Date', column: 'LastLoginDate'}
];
