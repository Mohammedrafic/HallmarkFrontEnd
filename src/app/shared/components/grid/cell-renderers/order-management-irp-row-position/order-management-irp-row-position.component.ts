import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

import { map, takeUntil } from 'rxjs';
import { take } from 'rxjs/operators';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ColDef, ICellRendererParams } from '@ag-grid-community/core';

import { TakeUntilDestroy } from '@core/decorators';
import { Destroyable } from '@core/helpers';
import {
  IRPCandidateForPosition,
  IRPOrderPosition,
  IRPOrderPositionDisplay,
  IRPOrderPositionMain,
} from '@shared/models/order-management.model';
import { OrderManagementIrpApiService } from '@shared/services/order-management-irp-api.service';
import {
  OrderManagementSubGridCells,
} from '@client/order-management/constants';
import { GRID_EMPTY_MESSAGE } from '@shared/components/grid/constants/grid.constants';
import {
  OrderManagementIrpRowCandidatesAdapter,
} from '@shared/components/grid/cell-renderers/order-management-irp-row-position/order-management-irp-row-position.adapter';

@TakeUntilDestroy
@Component({
  selector: 'app-order-management-irp-row-position',
  templateUrl: './order-management-irp-row-position.component.html',
  styleUrls: ['./order-management-irp-row-position.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderManagementIrpRowPositionComponent extends Destroyable implements ICellRendererAngularComp {
  public params: ICellRendererParams;
  //todo: remove any[]
  public displayRows: IRPCandidateForPosition[] | any[] = [];
  public colDefs: Record<string, ColDef[]> = OrderManagementSubGridCells;
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
      map((position: IRPOrderPositionMain[]) => OrderManagementIrpRowCandidatesAdapter.prepareTableData(position)),
      takeUntil(this.componentDestroy()),
    ).subscribe((candidatePositions: IRPCandidateForPosition[]) => {
      this.displayRows = candidatePositions;
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

  public trackBySystem(index: number, config: IRPCandidateForPosition): string {
    return config.system;
  }

  public trackById(index: number, config: IRPOrderPosition): string {
    return config.positionId;
  }

  public trackByField(index: number, config: ColDef): string {
    return config.field as string;
  }
}
