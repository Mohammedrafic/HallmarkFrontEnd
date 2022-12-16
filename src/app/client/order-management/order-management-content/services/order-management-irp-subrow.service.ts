import { Injectable } from '@angular/core';
import { GetDetailRowDataParams, GridOptions, IDetailCellRendererParams, RowHeightParams } from '@ag-grid-community/core';
import { IRPOrderManagement, IRPOrderPositionMain } from '@shared/models/order-management.model';
import { OrderManagementIrpApiService } from '@shared/services/order-management-irp-api.service';
import { take } from 'rxjs/operators';
import { Destroyable } from '@core/helpers';
import { takeUntil } from 'rxjs';
import {
  orderManagementIRPSubGridCells,
} from '@client/order-management/order-management-content/constants/order-management-irp.const';
import {
  OrderManagementContentComponent,
} from '@client/order-management/order-management-content/order-management-content.component';
import { TableRowDetailComponent } from '@shared/components/grid/cell-renderers/table-row-detail/table-row-detail.component';

@Injectable()
export class OrderManagementIrpSubrowService extends Destroyable {
  constructor(private orderManagementIrpApiService: OrderManagementIrpApiService) {
    super();
  }

  orderGridSubRowOptions(context: { componentParent: OrderManagementContentComponent }): GridOptions {
    return {
      masterDetail: true,
      animateRows: true,
      detailCellRenderer: TableRowDetailComponent,
      isRowMaster: (dataItem: IRPOrderManagement) => !!dataItem?.acceptedCandidates,
      getRowHeight: (params: RowHeightParams) => {
        if (params?.node?.detail) {
          const data = params.data;

          return data.acceptedCandidates * params.api.getSizesForCurrentTheme().rowHeight + 1;
        }

        return null;
      },
      detailCellRendererParams: (params: IDetailCellRendererParams): IDetailCellRendererParams => {
        return {
          ...params,
          detailGridOptions: {
            context: context,
            columnDefs: orderManagementIRPSubGridCells,
          },
          getDetailRowData: (params: GetDetailRowDataParams) => {
            const orderId = params.data.id;

            this.orderManagementIrpApiService.getOrderPositions([orderId]).pipe(
              take(1),
              takeUntil(this.componentDestroy()),
            ).subscribe((positions: IRPOrderPositionMain[]) => {
              params.successCallback(
                positions[0].irpOrderPositionsMainInfoDto,
              );
            });
          },
        };
      },
    };
  }
}
