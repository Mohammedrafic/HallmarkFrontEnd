import { GridActionsCellComponent, GridActionsCellConfig } from '@shared/components/grid/cell-renderers/grid-actions-cell';
import {
  CellClassParams,
  ColDef,
  ICellRendererParams,
} from '@ag-grid-community/core';
import { ValueFormatterParams } from '@ag-grid-community/core/dist/cjs/es5/entities/colDef';
import { TableStatusCellComponent } from '@shared/components/table-status-cell/table-status-cell.component';
import { OrderType } from '@shared/enums/order-type';
import { formatDate } from '@angular/common';
import { defaultOrderCol, firstColumnWidth } from './order-management-irp.const';
import {
  GridHeaderActionsComponent,
} from '@shared/components/grid/cell-renderers/grid-header-actions/grid-header-actions.component';
import { OrderStatus } from '@shared/enums/order-management';
import {
  SwitchEditorComponent,
} from '../../../../modules/timesheets/components/cell-editors/switch-editor/switch-editor.component';

export const GridCellsSystemAll = (
  canCreateOrder = false,
  settingsIsReordered = false,
  hasCreateEditOrderPermission = false,
  ): ColDef[] => [
  {
    headerName: '',
    headerCheckboxSelection: true,
    headerCheckboxSelectionFilteredOnly: true,
    checkboxSelection: true,
    ...firstColumnWidth,
    headerComponent: GridHeaderActionsComponent,
    cellRenderer: GridActionsCellComponent,
    cellClass: 'fat-icon-btn',
    cellRendererParams: (params: ICellRendererParams) => {
      return {
        actionsConfig: [
          (OrderType.OpenPerDiem === params.data.orderType && {
            action: () => {
              params.context.componentParent.createReorder(params.data);
            },
            iconName: 'calendar',
            buttonClass: 'default',
            disabled: !canCreateOrder
              || params.data.status === OrderStatus.PreOpen
              || params.data.status === OrderStatus.Closed
              || !settingsIsReordered
              || !hasCreateEditOrderPermission,
          }),
          {
            action: () => {
              params.context.componentParent.openOrderDetail(params.data);
            },
            iconName: 'message-square',
            buttonClass: 'default',
            useBadge: true,
            disabled: !hasCreateEditOrderPermission,
          },
          {
            action: () => {
              params.context.componentParent.lockOrder(params.data);
            },
            iconName: params.data.isLocked ? 'lock' : 'unlock',
            buttonClass: params.data.isLocked ? 'e-danger' : '',
            isCustomIcon: !params.data.isLocked,
            disabled: !canCreateOrder
              || ![OrderStatus.Open, OrderStatus.InProgress, OrderStatus.Filled].includes(params.data.status)
              || params.data.extensionFromId
              || !hasCreateEditOrderPermission,
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
    ...defaultOrderCol,
    field: 'publicId',
    headerName: 'ORDER ID',
    width: 160,
    minWidth: 160,
    maxWidth: 200,
    cellRenderer: 'agGroupCellRenderer',
    cellClass: (cellClassParams: CellClassParams) => {
      const expansionToggleClass = 'expansion-toggle-icons-order-1';
      const usePrimaryColor = cellClassParams.data.acceptedCandidates ? 'color-primary-active-blue-10' : '';
      const boldClass = 'font-weight-bold';

      return `${expansionToggleClass} ${usePrimaryColor} ${boldClass}`;
    },
    valueFormatter: (params: ValueFormatterParams) =>
      `${params.data.organizationPrefix}-${params.data.publicId}`,
  },
  {
    ...defaultOrderCol,
    field: 'statusText',
    headerName: 'STATUS',
    width: 215,
    minWidth: 120,
    maxWidth: 260,
    cellRenderer: TableStatusCellComponent,
    cellClass: 'status-cell',
  },
  {
    ...defaultOrderCol,
    field: 'isCritical',
    headerName: 'CRITICAL',
    width: 125,
    cellRenderer: SwitchEditorComponent,
    cellRendererParams: {
      disabled: true,
      showCheckbox: true,
      useValueAsTrue: true,
    },
  },
  {
    ...defaultOrderCol,
    field: 'system',
    headerName: 'SYSTEM',
    width: 125,
    cellClass: 'name',
    valueFormatter: (params: ValueFormatterParams) => {
      const irpText = params.data.includeInIRP ? 'IRP' : '';
      const vmsText = params.data.includeInVMS ? 'VMS' : '';

      if (irpText && vmsText) {
        return `${irpText}, ${vmsText}`;
      }

      return irpText || vmsText;
    },
  },
  {
    ...defaultOrderCol,
    field: 'orderType',
    headerName: 'TYPE',
    width: 85,
    minWidth: 70,
    maxWidth: 110,
  },
  {
    ...defaultOrderCol,
    field: 'jobTitle',
    headerName: 'JOB TITLE',
    width: 115,
    minWidth: 100,
    maxWidth: 200,
  },
  {
    ...defaultOrderCol,
    field: 'skillName',
    headerName: 'SKILL',
    width: 100,
    minWidth: 90,
    maxWidth: 200,
  },
  {
    ...defaultOrderCol,
    field: 'openPositions',
    headerName: 'AVAIL POSITIONS',
    type: 'rightAligned',
    width: 135,
    minWidth: 110,
    maxWidth: 180,
    valueFormatter: (params: ValueFormatterParams) =>
      params.data.orderType !== OrderType.OpenPerDiem
        ? `${params.data.numberOfOpenPositions || ''}/${params.data.numberOfPositions || ''}` : '',
  },
  {
    ...defaultOrderCol,
    field: 'regionName',
    headerName: 'REGION',
    width: 150,
    minWidth: 90,
    maxWidth: 200,
  },
  {
    ...defaultOrderCol,
    field: 'locationName',
    headerName: 'LOCATION',
    width: 140,
    minWidth: 110,
    maxWidth: 200,
  },
  {
    ...defaultOrderCol,
    field: 'departmentName',
    headerName: 'DEPARTMENT',
    width: 140,
    minWidth: 125,
    maxWidth: 200,
  },
  {
    ...defaultOrderCol,
    field: 'startDate',
    headerName: 'START DATE',
    width: 155,
    minWidth: 135,
    maxWidth: 200,
    valueFormatter: (params: ValueFormatterParams) =>
      formatDate(params.value, 'MM/dd/yyy', 'en-US', 'UTC'),
  },
  {
    ...defaultOrderCol,
    field: 'endDate',
    headerName: 'END DATE',
    width: 155,
    minWidth: 135,
    maxWidth: 200,
    valueFormatter: (params: ValueFormatterParams) =>
      formatDate(params.value, 'MM/dd/yyy', 'en-US', 'UTC'),
  },
  {
    ...defaultOrderCol,
    field: 'shift',
    headerName: 'SHIFT TIME',
    width: 160,
    minWidth: 80,
    maxWidth: 200,
    valueFormatter: (params: ValueFormatterParams) => {
      const startShiftTime = formatDate(params.data.shiftStartTime, 'shortTime', 'en-US');
      const endShiftTime = formatDate(params.data.shiftEndTime, 'shortTime', 'en-US');

      return `${startShiftTime}-${endShiftTime}`;
    },
  },
  {
    ...defaultOrderCol,
    field: 'employee',
    headerName: 'EMPLOYEE',
    width: 120,
    minWidth: 120,
    maxWidth: 120,
  },
  {
    ...defaultOrderCol,
    field: 'candid',
    headerName: 'CANDID',
    width: 100,
    minWidth: 100,
    maxWidth: 100,
  },
  {
    ...defaultOrderCol,
    field: 'creationDate',
    headerName: 'CREATION DATE',
    width: 155,
    minWidth: 135,
    maxWidth: 200,
    valueFormatter: (params: ValueFormatterParams) =>
      formatDate(params.value, 'MM/dd/YYYY HH:mm', 'en-US', 'UTC'),
  },
];
