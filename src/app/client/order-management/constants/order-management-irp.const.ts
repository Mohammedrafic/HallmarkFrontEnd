import { ColDef } from '@ag-grid-community/core';
import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';

import { ButtonModel } from '@shared/models/buttons-group.model';
import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';
import { OrderManagementIRPSystemId, OrderManagementIRPTabs } from '@shared/enums/order-management-tabs.enum';
import { OrderManagement } from '@shared/models/order-management.model';
import { OrderStatus } from '@shared/enums/order-management';
import { OrderType } from '@shared/enums/order-type';
import {
  MoreMenuType,
} from '@client/order-management/components/order-management-content/order-management-content.constants';

export const SystemGroupConfig = (
  isIRPIncluded = false,
  isVMSIncluded = false,
  selectedSystemId: OrderManagementIRPSystemId | undefined | null,
  canViewOrderJourney =false,
): ButtonModel[] => {
  const buttons = [];

  // if (isIRPIncluded && isVMSIncluded) { // TODO hide before future iterations
  //   buttons.push({
  //     id: OrderManagementIRPSystemId.All,
  //     title: 'All',
  //     disabled: true,
  //   });
  // }

  if (isIRPIncluded) {
    buttons.push({
      id: OrderManagementIRPSystemId.IRP,
      title: 'IRP',
      active: selectedSystemId === OrderManagementIRPSystemId.IRP || !isVMSIncluded,
    });
  }

  if (isVMSIncluded) {
    buttons.push({
      id: OrderManagementIRPSystemId.VMS,
      title: 'VMS',
      active: selectedSystemId === OrderManagementIRPSystemId.VMS || !isIRPIncluded || !selectedSystemId,
    });
  }

  if (isIRPIncluded && isVMSIncluded && canViewOrderJourney) { // TODO hide before future iterations
    buttons.push({
      id: OrderManagementIRPSystemId.OrderJourney,
      title: 'Order Journey',
      active: selectedSystemId === OrderManagementIRPSystemId.OrderJourney && isVMSIncluded && isIRPIncluded,
    });
  }

  return buttons;
};

export const DetectActiveSystem = (isIRPIncluded = false, isVMSIncluded = false): number => {
  if (isIRPIncluded && isVMSIncluded) {
    return OrderManagementIRPSystemId.VMS;
  }

  if (isIRPIncluded) {
    return OrderManagementIRPSystemId.IRP;
  }

  return OrderManagementIRPSystemId.VMS;
};

export const IRPTabsConfig: TabsListConfig[] = [
  {
    title: OrderManagementIRPTabs.AllOrders,
  },
  {
    title: OrderManagementIRPTabs.PerDiem,
  },
  {
    title: OrderManagementIRPTabs.LTA,
  },
  {
    title: OrderManagementIRPTabs.Incomplete,
  },
  {
    title: OrderManagementIRPTabs.OrderTemplates,
  }
];

export const IRPTabRequestTypeMap: Map<number, number | null> = new Map<number, number | null>()
  .set(0, null)
  .set(1, 10)
  .set(2, 3)
  .set(3, 0);

export const MapSystemWithTabs: Map<OrderManagementIRPSystemId, TabsListConfig[]> =
  new Map<OrderManagementIRPSystemId, TabsListConfig[]>()
    .set(OrderManagementIRPSystemId.IRP, IRPTabsConfig);

export const ThreeDotsMenuOptionsIRP = (
      CanCreateOrderIRP: boolean,
      CanCloseOrdersIRP: boolean,
      isIrpSystem: OrderManagementIRPSystemId,
    ): Record<string, ItemModel[]> => ({
      moreMenuWithDeleteButton: [
        { text: MoreMenuType[0], id: '0', disabled: !CanCreateOrderIRP },
        { text: MoreMenuType[1], id: '1', disabled: !CanCreateOrderIRP },
        { text: MoreMenuType[3], id: '3', disabled: !CanCreateOrderIRP },
      ],
      moreMenuWithCloseButton: [
        { text: MoreMenuType[0], id: '0', disabled: !CanCreateOrderIRP },
        { text: MoreMenuType[1], id: '1', disabled: !CanCreateOrderIRP },
        { text: MoreMenuType[2], id: '2', disabled: !CanCloseOrdersIRP },
      ],
      moreMenuWithReOpenButton: [
        { text: MoreMenuType[0], id: '0', disabled: !CanCreateOrderIRP },
        { text: MoreMenuType[1], id: '1', disabled: !CanCreateOrderIRP },
        { text: MoreMenuType[4], id: '4', disabled: !CanCreateOrderIRP },
      ],
      moreMenu: [
        { text: MoreMenuType[0], id: '0', disabled: !CanCreateOrderIRP },
        { text: MoreMenuType[1], id: '1', disabled: !CanCreateOrderIRP },
      ],
      reOrdersMenu: [
        { text: MoreMenuType[0], id: '0', disabled: !CanCreateOrderIRP },
        { text: MoreMenuType[2], id: '2', disabled: !CanCloseOrdersIRP },
      ],
      filledReOrdersMenu: [
        { text: MoreMenuType[0], id: '0', disabled: !CanCreateOrderIRP },
      ],
      closedOrderMenu: [
        { text: MoreMenuType[1], id: '1', disabled: !CanCreateOrderIRP },
      ],
      irpIncompleteMenu: [
        { text: MoreMenuType[0], id: '0', disabled: !CanCreateOrderIRP },
        { text: MoreMenuType[1], id: '1', disabled: !CanCreateOrderIRP },
      ],
    });


export const ThreeDotsMenuOptions = (
  canCreateOrder: boolean,
  canCloseOrder: boolean,
  isIrpSystem: OrderManagementIRPSystemId,
): Record<string, ItemModel[]> => ({
  moreMenuWithDeleteButton: [
    { text: MoreMenuType[0], id: '0', disabled: !canCreateOrder },
    { text: MoreMenuType[1], id: '1', disabled: !canCreateOrder },
    { text: MoreMenuType[3], id: '3', disabled: !canCreateOrder },
    { text: MoreMenuType[6], id: '6', disabled: !canCreateOrder },
  ],
  moreMenuWithCloseButton: [
    { text: MoreMenuType[0], id: '0', disabled: !canCreateOrder },
    { text: MoreMenuType[1], id: '1', disabled: !canCreateOrder },
    { text: MoreMenuType[2], id: '2', disabled: !canCloseOrder },
    { text: MoreMenuType[6], id: '6', disabled: !canCreateOrder },
  ],
  moreMenuWithReOpenButton: [
    { text: MoreMenuType[0], id: '0', disabled: !canCreateOrder },
    { text: MoreMenuType[1], id: '1', disabled: !canCreateOrder },
    { text: MoreMenuType[4], id: '4', disabled: !canCreateOrder },
    { text: MoreMenuType[6], id: '6', disabled: !canCreateOrder },
  ],
  moreMenu: [
    { text: MoreMenuType[0], id: '0', disabled: !canCreateOrder },
    { text: MoreMenuType[1], id: '1', disabled: !canCreateOrder },
    { text: MoreMenuType[6], id: '6', disabled: !canCreateOrder },
  ],
  reOrdersMenu: [
    { text: MoreMenuType[0], id: '0', disabled: !canCreateOrder },
    { text: MoreMenuType[2], id: '2', disabled: !canCloseOrder },
  ],
  filledReOrdersMenu: [
    { text: MoreMenuType[0], id: '0', disabled: !canCreateOrder },
  ],
  closedOrderMenu: [
    { text: MoreMenuType[1], id: '1', disabled: !canCreateOrder },
  ],
  irpIncompleteMenu: [
    { text: MoreMenuType[0], id: '0', disabled: !canCreateOrder },
    { text: MoreMenuType[1], id: '1', disabled: !canCreateOrder },
  ],
  moreMenuAddReOrderButton: [
    { text: MoreMenuType[5], id: '5', disabled: !canCreateOrder },
  ],
});

export const PositionGridCell = {
  field: 'positionId',
  headerName: 'Position ID',
  width: 140,
};

export const DefaultOrderCol: ColDef = {
  sortable: true,
  filter: false,
  resizable: true,
};

export const FirstColumnWidth = {
  width: 240,
  minWidth: 240,
  maxWidth: 240,
};

export const FirstColumnSubRowWidth = {
  width: 50,
  minWidth: 50,
  maxWidth: 50,
};

export const PrepareMenuItems = (order: OrderManagement, threeDotsMenuOptions: Record<string, ItemModel[]> = {}) => {
  if (order.status === OrderStatus.Closed) {
    return threeDotsMenuOptions['closedOrderMenu'];
  }

  if (order.isMoreMenuWithDeleteButton && order?.status !== OrderStatus.Incomplete) {
    return threeDotsMenuOptions['moreMenuWithDeleteButton'];
  } else if (order?.status === OrderStatus.Incomplete) {
    return threeDotsMenuOptions['irpIncompleteMenu'];
  } else {

    if (order.activeCandidatesCount && order.activeCandidatesCount > 0) {
      return threeDotsMenuOptions['moreMenu'];
    }

    if (order?.status !== OrderStatus.Closed && Boolean(order?.orderClosureReasonId)) {
      return threeDotsMenuOptions['moreMenuWithReOpenButton'];
    } else {
      return threeDotsMenuOptions['moreMenuWithCloseButton'];
    }
  }
};

export const DefaultOrderManagementSubGridCells: ColDef[] = [
  {
    field: 'candidateStatus',
    width: 150,
  },
  {
    field: 'system',
    headerName: 'System',
    width: 80,
  },
  {
    field: 'name',
    headerName: 'Employee Name',
    width: 250,
  },
];

export const OrderManagementIRPSubGridCells: ColDef[] = [
  FirstColumnSubRowWidth,
  PositionGridCell,
  ...DefaultOrderManagementSubGridCells,
  {
    field: 'skill',
    headerName: 'Primary Skill',
    width: 240,
  },
  {
    field: 'workCommitment',
    headerName: 'Work Commitment',
    width: 240,
  },
  {
    field: 'actualStartDate',
    headerName: 'Actual start date',
    width: 140,
  },
  {
    field: 'actualEndDate',
    headerName: 'Actual end date',
    width: 140,
  },
];

export const OrderManagementVMSSubGridCells: ColDef[] = [
  FirstColumnSubRowWidth,
  PositionGridCell,
  ...DefaultOrderManagementSubGridCells,
  {
    field: 'agency',
    headerName: 'Agency',
    width: 160,
  },
  {
    field: 'actualStartDate',
    headerName: 'Actual start date',
    width: 140,
  },
  {
    field: 'actualEndDate',
    headerName: 'Actual end date',
    width: 140,
  },
];

export const OrderManagementSubGridCells: Record<string, ColDef[]> = {
  IRP: OrderManagementIRPSubGridCells,
  VMS: OrderManagementVMSSubGridCells,
};

/* TODO future iteration
  [{
    field: 'lastShiftScheduledStartTime',
    headerName: 'Last Shift Scheduled',
    width: 160,
    valueFormatter: (params) =>
      params.value ? formatDate(params.value, 'MM/dd/yyy', 'en-US', 'UTC') : '',
    cellRendererSelector: titleValueCellRendererSelector,
  },
  {
    field: 'lastShiftScheduledStartTime',
    headerName: 'Last Shift',
    width: 160,
    valueFormatter: (params: ValueFormatterParams) => {
      const startShiftTime = formatDate(params.data.lastShiftScheduledStartTime, 'shortTime', 'en-US');
      const endShiftTime = formatDate(params.data.lastShiftScheduledEndTime, 'shortTime', 'en-US');

      return `${startShiftTime}-${endShiftTime}`;
    },
    cellRendererSelector: titleValueCellRendererSelector,
  },
  {
    field: 'nextShiftScheduledStartTime',
    headerName: 'Next Shift Scheduled',
    width: 160,
    valueFormatter: (params) =>
      params.value ? formatDate(params.value, 'MM/dd/yyy', 'en-US', 'UTC') : '',
    cellRendererSelector: titleValueCellRendererSelector,
  },
  {
    field: 'nextShiftScheduledStartTime',
    headerName: 'Next Shift',
    width: 160,
    valueFormatter: (params: ValueFormatterParams) => {
      const startShiftTime = formatDate(params.data.nextShiftScheduledStartTime, 'shortTime', 'en-US');
      const endShiftTime = formatDate(params.data.nextShiftScheduledStartTime, 'shortTime', 'en-US');

      return `${startShiftTime}-${endShiftTime}`;
    },
    cellRendererSelector: titleValueCellRendererSelector,
  },
  {
    field: 'scheduledWeeklyHours',
    headerName: 'Sch Weekly Hours',
    width: 150,
    cellRendererSelector: titleValueCellRendererSelector,
  },
  {
    field: 'overtime',
    headerName: 'Overtime',
    width: 100,
    cellRendererSelector: titleValueCellRendererSelector,
  },];*/
