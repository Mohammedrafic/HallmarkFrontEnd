import { ButtonModel } from '@shared/models/buttons-group.model';
import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';
import { OrderManagementIRPSystemId, OrderManagementIRPTabs } from '@shared/enums/order-management-tabs.enum';
import { ColDef } from '@ag-grid-community/core';
import { OrderManagement } from '@shared/models/order-management.model';
import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';
import { OrderStatus } from '@shared/enums/order-management';
import { OrderType } from '@shared/enums/order-type';
import { ValueFormatterParams } from '@ag-grid-community/core/dist/cjs/es5/entities/colDef';
import { titleValueCellRendererSelector } from '../../../../modules/invoices/constants';
import { TableStatusCellComponent } from '@shared/components/table-status-cell/table-status-cell.component';
import { OrderStatusText } from '@shared/enums/status';
import { MoreMenuType } from '@client/order-management/components/order-management-content/order-management-content.constants';

export const SystemGroupConfig: ButtonModel[] = [
  {
    id: OrderManagementIRPSystemId.All,
    title: 'All',
    disabled: true,
  },
  {
    id: OrderManagementIRPSystemId.IRP,
    title: 'IRP',
  },
  {
    id: OrderManagementIRPSystemId.VMS,
    title: 'VMS',
    active: true,
  },
  {
    id: OrderManagementIRPSystemId.OrderJourney,
    title: 'Order Journey',
    disabled: true,
  },
];

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
    valueFormatter: (params: ValueFormatterParams) =>
      `${params.data.lastName} ${params.data.firstName}`,
    cellRendererSelector: titleValueCellRendererSelector,
  },
  {
    field: 'candidateStatus',
    cellRenderer: TableStatusCellComponent,
    valueFormatter: (params: ValueFormatterParams) => OrderStatusText[params.value],
    width: 215,
  },
  {
    field: 'primarySkillName',
    headerName: 'Primary skill',
    width: 100,
    cellRendererSelector: titleValueCellRendererSelector,
  },
  {
    field: 'contract',
    headerName: 'Contract Employee',
    width: 160,
    valueFormatter: (params) => params.value ? 'Yes': 'No',
    cellRendererSelector: titleValueCellRendererSelector,
  },
];
