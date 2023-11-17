import { ColDef } from '@ag-grid-community/core';
import { BusinessUnitType } from '@shared/enums/business-unit-type';

export const BUSINESS_UNITS_MSP_VALUES = [
  { id: BusinessUnitType.Agency, text: 'Agency' },
  { id: BusinessUnitType.MSP, text: 'MSP' },
  { id: BusinessUnitType.Organization, text: 'Organization' }  
];
export const DefaultUseractivityGridColDef: ColDef = {
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
  
  ],
};

