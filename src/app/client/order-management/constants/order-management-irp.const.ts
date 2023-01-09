import { ButtonModel } from '@shared/models/buttons-group.model';
import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';
import { OrderManagementIRPSystemId, OrderManagementIRPTabs } from '@shared/enums/order-management-tabs.enum';
import { ColDef } from '@ag-grid-community/core';
import { OrderManagement } from '@shared/models/order-management.model';
import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';
import { OrderStatus } from '@shared/enums/order-management';
import { OrderType } from '@shared/enums/order-type';
import {
  MoreMenuType,
} from '@client/order-management/components/order-management-content/order-management-content.constants';

export const SystemGroupConfig = (
  isIRPIncluded = false,
  isVMSIncluded = false,
  selectedSystemId: OrderManagementIRPSystemId | undefined | null,
): ButtonModel[] => {
  const buttons = [];

  if (isIRPIncluded && isVMSIncluded) {
    buttons.push({
      id: OrderManagementIRPSystemId.All,
      title: 'All',
      disabled: true,
    });
  }

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

  if (isIRPIncluded && isVMSIncluded) {
    buttons.push({
      id: OrderManagementIRPSystemId.OrderJourney,
      title: 'Order Journey',
      disabled: true,
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
];

export const IRPTabRequestTypeMap: Map<number, number | null> = new Map<number, number | null>()
  .set(0, null)
  .set(1, 10)
  .set(2, 3)
  .set(3, 0);

export const MapSystemWithTabs: Map<OrderManagementIRPSystemId, TabsListConfig[]> =
  new Map<OrderManagementIRPSystemId, TabsListConfig[]>()
    .set(OrderManagementIRPSystemId.IRP, IRPTabsConfig);

export const ThreeDotsMenuOptions = (
  canCreateOrder: boolean,
  canCloseOrder: boolean,
): Record<string, ItemModel[]> => ({
  moreMenuWithDeleteButton: [
    { text: MoreMenuType[0], id: '0', disabled: !canCreateOrder },
    { text: MoreMenuType[1], id: '1', disabled: !canCreateOrder },
    { text: MoreMenuType[3], id: '3', disabled: !canCreateOrder },
  ],
  moreMenuWithCloseButton: [
    { text: MoreMenuType[0], id: '0', disabled: !canCreateOrder },
    { text: MoreMenuType[1], id: '1', disabled: !canCreateOrder },
    { text: MoreMenuType[2], id: '2', disabled: !canCloseOrder },
  ],
  moreMenuWithReOpenButton: [
    { text: MoreMenuType[0], id: '0', disabled: !canCreateOrder },
    { text: MoreMenuType[1], id: '1', disabled: !canCreateOrder },
    { text: MoreMenuType[4], id: '4', disabled: !canCreateOrder },
  ],
  moreMenu: [
    { text: MoreMenuType[0], id: '0', disabled: !canCreateOrder },
    { text: MoreMenuType[1], id: '1', disabled: !canCreateOrder },
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
});

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

export const PrepareMenuItems = (order: OrderManagement, threeDotsMenuOptions: Record<string, ItemModel[]> = {}) => {
  if (order.status === OrderStatus.Closed) {
    return threeDotsMenuOptions['closedOrderMenu'];
  }

  if (order.isMoreMenuWithDeleteButton) {
    return threeDotsMenuOptions['moreMenuWithDeleteButton'];
  } else {
    const orderStatuses = [OrderStatus.InProgressOfferAccepted, OrderStatus.Filled];

    if (order.children?.some((child) => orderStatuses.includes(child.orderStatus))) {
      return order.orderType === OrderType.OpenPerDiem
        ? threeDotsMenuOptions['moreMenuWithCloseButton'] : threeDotsMenuOptions['moreMenu'];
    }

    if (order?.status !== OrderStatus.Closed && Boolean(order?.orderClosureReasonId)) {
      return threeDotsMenuOptions['moreMenuWithReOpenButton'];
    } else {
      return threeDotsMenuOptions['moreMenuWithCloseButton'];
    }
  }
};

export const OrderManagementIRPSubGridCells: ColDef[] = [
  FirstColumnWidth,
  {
    field: 'name',
    headerName: 'Employee',
    width: 200,
  },
  {
    field: 'candidateStatus',
    width: 215,
  },
  {
    field: 'primarySkillName',
    headerName: 'Primary skill',
    width: 160,
  },
  {
    field: 'contract',
    headerName: 'Contract Employee',
    width: 160,
  },
/* TODO future iteration
  {
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
  },*/
];
