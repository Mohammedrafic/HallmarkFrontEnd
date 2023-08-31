import { ColDef } from '@ag-grid-community/core';

import {
  OrderManagementIRPSystemId,
  OrderManagementIRPTabsIndex,
} from '@shared/enums/order-management-tabs.enum';
import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';
import {
  GridCellsSystemAll,
  GridCellsSystemIRPTabAll,
  GridCellsSystemIRPTabLta,
  GridCellsSystemIRPTabPerDiem,
} from '@client/order-management/constants';
import { GridCellsSystemIRPTabOrderTemplate } from '../constants/order-grid-cells-system-irp-tab-ordertemplate.const';

export class OrderManagementIrpGridHelper {
  static prepareColDefs(
    systemId: OrderManagementIRPSystemId,
    activeTab: OrderManagementIRPTabsIndex | null = null,
    threeDotsMenuOptions: Record<string, ItemModel[]> = {},
    ...restArguments: boolean[]
  ): ColDef[] {
    const isSystemIRP = systemId === OrderManagementIRPSystemId.IRP;

    if (systemId === OrderManagementIRPSystemId.All) {
      return GridCellsSystemAll(...restArguments);
    }

    if (isSystemIRP && (activeTab === OrderManagementIRPTabsIndex.AllOrders
      || activeTab === OrderManagementIRPTabsIndex.Incomplete)
    ) {
      return GridCellsSystemIRPTabAll(
        threeDotsMenuOptions,
        activeTab === OrderManagementIRPTabsIndex.Incomplete,
        ...restArguments
      );
    }

    if (isSystemIRP && activeTab === OrderManagementIRPTabsIndex.PerDiem) {
      return GridCellsSystemIRPTabPerDiem(threeDotsMenuOptions, ...restArguments);
    }

    if (isSystemIRP && activeTab === OrderManagementIRPTabsIndex.Lta) {
      return GridCellsSystemIRPTabLta(threeDotsMenuOptions, ...restArguments);
    }
    if (isSystemIRP && (activeTab === OrderManagementIRPTabsIndex.OrderTemplates)
    ) {
      return GridCellsSystemIRPTabOrderTemplate(
        threeDotsMenuOptions,
        activeTab === OrderManagementIRPTabsIndex.OrderTemplates,
        ...restArguments
      );
    }

    return [];
  }
}
