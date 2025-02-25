/* eslint-disable max-lines-per-function */
import { formatDate } from '@angular/common';

import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';
import { CellClassParams, ColDef, ICellRendererParams } from '@ag-grid-community/core';
import { ValueFormatterParams } from '@ag-grid-community/core/dist/cjs/es5/entities/colDef';

import {
  GridHeaderActionsComponent,
} from '@shared/components/grid/cell-renderers/grid-header-actions/grid-header-actions.component';
import { GridActionsCellComponent, GridActionsCellConfig } from '@shared/components/grid/cell-renderers/grid-actions-cell';
import { TableStatusCellComponent } from '@shared/components/table-status-cell/table-status-cell.component';

import { DefaultOrderCol, FirstColumnWidth, PrepareMenuItems } from './order-management-irp.const';
import { GridValuesHelper } from '@core/helpers';
import {
  TableTypeCellComponent,
} from '@client/order-management/components/order-management-content/sub-grid-components/table-type-cell';
import {
  CriticalCellComponent,
} from '@client/order-management/components/order-management-content/sub-grid-components/critical-cell';
import { OrderStatus } from '@shared/enums/order-management';
export const GridCellsSystemIRPTabOrderTemplate = (
  threeDotsMenuOptions: Record<string, ItemModel[]> = {},
  isIncompleteTab = false,
  canCreateOrder = false,
  settingsIsReordered = false,
  hasCreateEditOrderPermission = false,
  isIRPEnabled = false,
  isVMSEnabled = false,
): ColDef[] => [
  {
    headerName: '',
    headerCheckboxSelection: true,
    headerCheckboxSelectionFilteredOnly: true,
    checkboxSelection: true,
    ...FirstColumnWidth,
    headerComponent: GridHeaderActionsComponent,
    cellRenderer: GridActionsCellComponent,
    cellClass: 'fat-icon-btn',
    cellRendererParams: (params: ICellRendererParams) => {
       return {
        actionsConfig: [
          {
            action: () => {
              params.context.componentParent.deleteOrder(params.data.id);
            },
            iconName: 'trash-2',
            iconClass: 'color-supportive-red',
            badgeValue: params.data.Id,
            disabled: false,
          },
        ],
      } as GridActionsCellConfig;
    },
    sortable: false,
    suppressMenu: true,
    filter: false,
    resizable: false,
  },
  {
    ...DefaultOrderCol,
    field: 'publicId',
    headerName: 'TEMPLATE ID',
    width: 160,
    minWidth: 160,
    maxWidth: 200,
    cellRenderer: 'agGroupCellRenderer',
    cellClass: (cellClassParams: CellClassParams) => {
      const expansionToggleClass = 'expansion-toggle-icons-order-1';
      const usePrimaryColor =
        cellClassParams.data.irpCandidatesCount || cellClassParams.data.vmsCandidatesCount ?
          'color-primary-active-blue-10' : '';
      const boldClass = 'font-weight-bold';

      return `${expansionToggleClass} ${usePrimaryColor} ${boldClass}`;
    },
    valueFormatter: (params: ValueFormatterParams) =>
      `${params.data.organizationPrefix}-${params.data.publicId}`,
  },
  {
    ...DefaultOrderCol,
    field: 'templateTitle',
    headerName: 'Template Title',
    width: 160,
    minWidth: 160,
    maxWidth: 200,
    cellClass: 'wrap-cell',
  },
  {
    ...DefaultOrderCol,
    field: 'templateTitle',
    headerName: 'TYPE',
    cellRenderer: TableTypeCellComponent,
    width: 85,
    minWidth: 70,
    maxWidth: 110,
    cellClass: 'font-weight-bold',
  },
  {
    ...DefaultOrderCol,
    field: 'skillName',
    headerName: 'SKILL',
    width: 100,
    minWidth: 90,
    maxWidth: 200,
    cellClass: 'wrap-cell',
  },
  {
    ...DefaultOrderCol,
    field: 'regionName',
    headerName: 'REGION',
    width: 150,
    minWidth: 90,
    maxWidth: 200,
  },
  {
    ...DefaultOrderCol,
    field: 'locationName',
    headerName: 'LOCATION',
    width: 140,
    minWidth: 110,
    maxWidth: 200,
  },
  {
    ...DefaultOrderCol,
    field: 'departmentName',
    headerName: 'DEPARTMENT',
    width: 140,
    minWidth: 125,
    maxWidth: 200,
  },
  {
    ...DefaultOrderCol,
    field: 'endDate',
    headerName: 'END DATE',
    width: 155,
    minWidth: 135,
    maxWidth: 200,
    valueFormatter: (params: ValueFormatterParams) =>
      params.value ? formatDate(params.value, 'MM/dd/yyy', 'en-US', 'UTC') : '',
  },
  {
    ...DefaultOrderCol,
    field: 'shiftName',
    headerName: 'SHIFT Name',
    width: 160,
    minWidth: 80,
    maxWidth: 200,
  },
  {
    ...DefaultOrderCol,
    field: 'shiftStartTime',
    headerName: 'SHIFT START TIME',
    width: 160,
    minWidth: 80,
    maxWidth: 200,
    valueFormatter: (params: ValueFormatterParams) => {
      const startShiftTime = GridValuesHelper.formatDate(params.data?.shiftStartDateTime, 'HH:mm');
      return `${startShiftTime}`;
    },
  },
  {
    ...DefaultOrderCol,
    field: 'shiftEndTime',
    headerName: 'SHIFT END TIME',
    width: 160,
    minWidth: 80,
    maxWidth: 200,
    valueFormatter: (params: ValueFormatterParams) => {
      const endShiftTime = GridValuesHelper.formatDate(params.data?.shiftEndDateTime, 'HH:mm');
      return `${endShiftTime}`;
    },
  },
  {
    ...DefaultOrderCol,
    field: 'creationDate',
    headerName: 'CREATION DATE',
    width: 155,
    minWidth: 135,
    maxWidth: 200,
    valueFormatter: (params: ValueFormatterParams) =>
      formatDate(params.value, 'MM/dd/YYYY', 'en-US'),
  },
];
