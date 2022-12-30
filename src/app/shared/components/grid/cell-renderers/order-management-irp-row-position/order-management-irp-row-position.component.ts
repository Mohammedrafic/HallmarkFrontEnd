import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

import { takeUntil } from 'rxjs';
import { take } from 'rxjs/operators';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ColDef, ICellRendererParams } from '@ag-grid-community/core';
import { TakeUntilDestroy } from '@core/decorators';
import { Destroyable } from '@core/helpers';
import { IRPOrderPositionDisplay, IRPOrderPositionMain } from '@shared/models/order-management.model';
import { OrderManagementIrpApiService } from '@shared/services/order-management-irp-api.service';
import {
  OrderManagementIrpRowPositionAdapter,
} from '@shared/components/grid/cell-renderers/order-management-irp-row-position/order-management-irp-row-position.adapter';
import { OrderManagementIRPSubGridCells } from '@client/order-management/constants';
import { GRID_EMPTY_MESSAGE } from '@shared/components/grid/constants/grid.constants';

@TakeUntilDestroy
@Component({
  selector: 'app-order-management-irp-row-position',
  templateUrl: './order-management-irp-row-position.component.html',
  styleUrls: ['./order-management-irp-row-position.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderManagementIrpRowPositionComponent extends Destroyable implements ICellRendererAngularComp {
  public params: ICellRendererParams;
  public displayRows: IRPOrderPositionDisplay[] | any[] = [];
  public colDefs: ColDef[] = OrderManagementIRPSubGridCells;
  public emptyMessage = GRID_EMPTY_MESSAGE;

  constructor(
    private cdr: ChangeDetectorRef,
    private orderManagementIrpApiService: OrderManagementIrpApiService,
  ) {
    super();
  }

  public agInit(params: ICellRendererParams): void {
    this.params = params;

    this.orderManagementIrpApiService.getOrderPositions([params.data.id]).pipe(
      take(1),
      takeUntil(this.componentDestroy()),
    ).subscribe((positions: IRPOrderPositionMain[]) => {
      this.displayRows = OrderManagementIrpRowPositionAdapter.prepareTableData(positions[0].irpOrderPositionsMainInfoDto);
      this.cdr.detectChanges();
    });
  }

  public selectRow(event: MouseEvent, childRow: IRPOrderPositionDisplay): void  {
    event.stopImmediatePropagation();
    // TODO implement position select through the context
    //  -> this.params.context.componentParent."method from parent Component"()
  }

  public refresh(): boolean {
    return true;
  }
}
