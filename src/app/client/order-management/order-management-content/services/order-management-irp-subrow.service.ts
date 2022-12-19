import { Injectable } from '@angular/core';
import { GetDetailRowDataParams, GridOptions, IDetailCellRendererParams, RowHeightParams } from '@ag-grid-community/core';
import { IRPOrderManagement, IRPOrderPositionMain } from '@shared/models/order-management.model';
import { OrderManagementIrpApiService } from '@shared/services/order-management-irp-api.service';
import { take } from 'rxjs/operators';
import { tap } from 'rxjs';
import {
  OrderManagementIRPSubGridCells,
} from '@client/order-management/order-management-content/constants/order-management-irp.const';
import { TableRowDetailComponent } from '@shared/components/grid/cell-renderers/table-row-detail/table-row-detail.component';
import {
  OrderManagementContentComponent
} from '@client/order-management/components/order-management-content/order-management-content.component';

@Injectable()
export class OrderManagementIrpSubrowService {
  constructor(private orderManagementIrpApiService: OrderManagementIrpApiService) {
  }

  configureOrderGridSubRowOptions(context: { componentParent: OrderManagementContentComponent }): GridOptions {
    return {
      masterDetail: true,
      animateRows: true,
      detailCellRenderer: TableRowDetailComponent,
      isRowMaster: (dataItem: IRPOrderManagement) => !!dataItem?.acceptedCandidates || true,
      getRowHeight: (params: RowHeightParams) => {
        if (params?.node?.detail) {
          const data = params.data;

          return (data.acceptedCandidates || 1) * params.api.getSizesForCurrentTheme().rowHeight + 1;
        }

        return null;
      },
      detailCellRendererParams: (params: IDetailCellRendererParams): IDetailCellRendererParams => {
        return {
          ...params,
          detailGridOptions: {
            context: context,
            columnDefs: OrderManagementIRPSubGridCells,
          },
          getDetailRowData: (params: GetDetailRowDataParams) => {
            const orderId = params.data.id;

            this.orderManagementIrpApiService.getOrderPositions([orderId]).pipe(
              take(1),
              tap((positions: IRPOrderPositionMain[]) => {
                params.successCallback(
                  positions[0].irpOrderPositionsMainInfoDto,
                );
              })
            ).subscribe();
          },
        };
      },
    };
  }
}
