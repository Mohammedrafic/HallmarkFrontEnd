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
  CriticalCellComponent,
} from '@client/order-management/components/order-management-content/sub-grid-components/critical-cell/critical-cell.component';
import { OrderStatus } from '@shared/enums/order-management';

export const GridCellsSystemIRPTabLta = (
  threeDotsMenuOptions: Record<string, ItemModel[]> = {},
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
              // TODO open IRP Order detail
            },
            iconName: 'message-square',
            buttonClass: 'default',
            useBadge: true,
            badgeValue: params.data.unreadComments,
            disabled: true,
          },
          {
            action: () => {
              params.context.componentParent.lockOrder(params.data);
            },
            iconName: params.data.isLockedIRP ? 'lock' : 'unlock',
            buttonClass: params.data.isLockedIRP ? 'e-danger' : '',
            isCustomIcon: !params.data.isLockedIRP,
            disabled: !canCreateOrder
            || ![OrderStatus.Open, OrderStatus.InProgress, OrderStatus.Filled].includes(params.data.status)
            || !hasCreateEditOrderPermission
            || params.data.orderTypeText != "LTA",
          },
          {
            action: (itemId: number) => {
              params.context.componentParent.menuOptionSelected(itemId, params.data);
            },
            iconName: 'more-vertical',
            buttonClass: 'e-primary',
            disabled: false,
            menuItems: PrepareMenuItems(params.data, threeDotsMenuOptions),
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
    headerName: 'ORDER ID',
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
    field: 'statusText',
    headerName: 'STATUS',
    width: 215,
    minWidth: 120,
    maxWidth: 260,
    cellRenderer: TableStatusCellComponent,
    cellClass: 'status-cell',
  },
  {
    ...DefaultOrderCol,
    field: 'criticalOrder',
    headerName: 'CRITICAL',
    width: 125,
    cellRenderer: CriticalCellComponent,
    cellRendererParams: {
      disabled: true,
      showCheckbox: true,
      useValueAsTrue: true,
    },
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
    field: 'numberOfPositions',
    headerName: 'AVAIL POS.',
    type: 'rightAligned',
    width: 135,
    minWidth: 110,
    maxWidth: 180,
    valueFormatter: (params: ValueFormatterParams) =>
      `${params.data.numberOfOpenPositions ?? 0}/${params.data.numberOfPositions ?? 0}`,
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
    field: 'startDate',
    headerName: 'START DATE',
    width: 155,
    minWidth: 135,
    maxWidth: 200,
    valueFormatter: (params: ValueFormatterParams) =>
      formatDate(params.value, 'MM/dd/yyy', 'en-US', 'UTC'),
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
    field: 'shiftDateTime',
    headerName: 'SHIFT',
    width: 160,
    minWidth: 80,
    maxWidth: 200,
    valueFormatter: (params: ValueFormatterParams) => {
      const startShiftTime = GridValuesHelper.formatDate(params.data.shiftStartDateTime, 'HH:mm');
      const endShiftTime = GridValuesHelper.formatDate(params.data.shiftEndDateTime, 'HH:mm');

      return `${startShiftTime}-${endShiftTime}`;
    },
  },
  ...(isIRPEnabled ? [{
    ...DefaultOrderCol,
    field: 'irpCandidatesCount',
    headerName: 'Employees',
    width: 120,
    minWidth: 120,
    maxWidth: 120,
  }] : []),
  ...(isVMSEnabled ? [{
    ...DefaultOrderCol,
    field: 'vmsCandidatesCount',
    headerName: 'Candidates',
    width: 120,
    minWidth: 120,
    maxWidth: 120,
  }] : []),
  {
    ...DefaultOrderCol,
    field: 'creationDate',
    headerName: 'CREATION DATE',
    width: 155,
    minWidth: 135,
    maxWidth: 200,
    valueFormatter: (params: ValueFormatterParams) =>
      formatDate(params.value, 'MM/dd/YYYY HH:mm', 'en-US', 'UTC'),
  },
];
