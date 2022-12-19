import {
  OrderManagementContentComponent,
} from '@client/order-management/components/order-management-content/order-management-content.component';
import { GridOptions, RowHeightParams } from '@ag-grid-community/core';
import { IRPOrderManagement } from '@shared/models/order-management.model';
import {
  OrderManagementIrpRowPositionComponent,
} from '@shared/components/grid/cell-renderers/order-management-irp-row-position/order-management-irp-row-position.component';

export class OrderManagementIrpSubrowHelper {
  static configureOrderGridSubRowOptions(context: { componentParent: OrderManagementContentComponent }): GridOptions {
    return {
      masterDetail: true,
      animateRows: true,
      detailCellRenderer: OrderManagementIrpRowPositionComponent,
      context: context,
      isRowMaster: (dataItem: IRPOrderManagement) => !!dataItem?.acceptedCandidates,
      getRowHeight: (params: RowHeightParams) => {
        if (params?.node?.detail) {
          const data = params.data;

          return data.acceptedCandidates * params.api.getSizesForCurrentTheme().rowHeight + 1;
        }

        return null;
      },
    };
  }
}
