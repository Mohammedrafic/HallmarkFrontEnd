import { ButtonModel } from '@shared/models/buttons-group.model';
import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';
import { OrderManagementIRPSystemId, OrderManagementIRPTabs } from '@shared/enums/order-management-tabs.enum';
import {
  ColDef,
  GetDetailRowDataParams,
  GridOptions,
  IDetailCellRendererParams,
  RowHeightParams,
} from '@ag-grid-community/core';
import { OrderManagement } from '@shared/models/order-management.model';
import { ValueFormatterParams } from '@ag-grid-community/core/dist/cjs/es5/entities/colDef';
import { TableStatusCellComponent } from '@shared/components/table-status-cell/table-status-cell.component';
import {
  TableRowDetailsComponent,
} from '@shared/components/grid/cell-renderers/table-row-details/table-row-details.component';
import { titleValueCellRendererSelector } from '../../../modules/invoices/constants';
import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';
import { MoreMenuType } from '@client/order-management/order-management-content/order-management-content.constants';
import { OrderStatus } from '@shared/enums/order-management';
import { OrderType } from '@shared/enums/order-type';

export const systemGroupConfig: ButtonModel[] = [
  {
    id: OrderManagementIRPSystemId.All,
    title: 'All',
    disabled: true,
  },
  {
    id: OrderManagementIRPSystemId.IRP,
    title: 'IRP',
    active: true,
  },
  {
    id: OrderManagementIRPSystemId.VMS,
    title: 'VMS',
    disabled: true,
  },
  {
    id: OrderManagementIRPSystemId.OrderJourney,
    title: 'Order Journey',
    disabled: true,
  },
];

export const irpTabsConfig: TabsListConfig[] = [
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

export const vmsTabsConfig: TabsListConfig[] = [
  {
    title: OrderManagementIRPTabs.AllOrders,
  },
  {
    title: OrderManagementIRPTabs.PerDiem,
  },
  {
    title: OrderManagementIRPTabs.PermPlacement,
  },
  {
    title: OrderManagementIRPTabs.ReOrders,
  },
  {
    title: OrderManagementIRPTabs.Incomplete,
  },
];

export const openInProgressFilledStatuses = ['open', 'in progress', 'filled', 'custom step'];

export const MapSystemWithTabs: Map<OrderManagementIRPSystemId, TabsListConfig[]> =
  new Map<OrderManagementIRPSystemId, TabsListConfig[]>()
    .set(OrderManagementIRPSystemId.IRP, irpTabsConfig)
    .set(OrderManagementIRPSystemId.VMS, vmsTabsConfig);

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

export const defaultOrderCol: ColDef = {
  sortable: true,
  filter: false,
  resizable: true,
};

export const firstColumnWidth = {
  width: 210,
  minWidth: 210,
  maxWidth: 210,
};

export const prepareMenuItems = (order: OrderManagement, threeDotsMenuOptions: Record<string, ItemModel[]> = {}) => {
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

export const orderGridSubRowOptions: GridOptions = {
  masterDetail: true,
  detailCellRenderer: TableRowDetailsComponent,
  animateRows: true,
  embedFullWidthRows: true,
  isRowMaster: (dataItem: OrderManagement) => !!dataItem?.children?.length,
  getRowHeight: (params: RowHeightParams) => {
    if (params?.node?.detail) {
      const data = params.data;

      return data.children?.length * params.api.getSizesForCurrentTheme().rowHeight + 1;
    }

    return null;
  },
  detailCellRendererParams: (params: IDetailCellRendererParams): IDetailCellRendererParams => {
    return {
      ...params,
      detailGridOptions: {
        columnDefs: [
          firstColumnWidth,
          {
            field: 'name',
            headerName: 'Employee',
            width: 160,
            minWidth: 160,
            maxWidth: 200,
            valueFormatter: (params: ValueFormatterParams) =>
              `${params.data.lastName} ${params.data.firstName}`,
            cellRendererSelector: titleValueCellRendererSelector,
          },
          {
            field: 'orientation',
            headerName: 'Orientation',
            minWidth: 100,
            width: 100,
            cellRendererSelector: titleValueCellRendererSelector,
          },
          {
            field: 'statusName',
            cellRenderer: TableStatusCellComponent,
            width: 215,
          },
          {
            field: 'skill',
            headerName: 'Primary skill',
            minWidth: 100,
            width: 100,
            cellRendererSelector: titleValueCellRendererSelector,
          },
          {
            field: 'contract',
            headerName: 'Contract Employee',
            minWidth: 100,
            width: 100,
            cellRendererSelector: titleValueCellRendererSelector,
          },
        ],
      },
      getDetailRowData: (params: GetDetailRowDataParams) => params.successCallback(
        params.data.children,
      ),
    };
  },
};
