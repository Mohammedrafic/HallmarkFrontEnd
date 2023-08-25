import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

import { Store } from '@ngxs/store';
import { map, takeUntil } from 'rxjs';
import { take } from 'rxjs/operators';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ColDef, ICellRendererParams } from '@ag-grid-community/core';

import { TakeUntilDestroy } from '@core/decorators';
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
import { AdditionalPermission, GRID_EMPTY_MESSAGE } from '@shared/components/grid/constants/grid.constants';
import { ShowToast } from 'src/app/store/app.actions';
import {
  OrderManagementService,
} from '@client/order-management/components/order-management-content/order-management.service';
import {
  OrderManagementContentComponent,
} from '@client/order-management/components/order-management-content/order-management-content.component';

import { OrderInfo } from '@client/order-management/interfaces';
import { MessageTypes } from '@shared/enums/message-types';
import { OrderManagementIRPSystemId } from '@shared/enums/order-management-tabs.enum';
import { AbstractPermission } from '@shared/helpers/permissions';

import { OrderManagementIrpCandidateSystem } from './order-management-irp-row-position.enum';
import { OrderManagementIrpRowCandidatesAdapter } from './order-management-irp-row-position.adapter';

@TakeUntilDestroy
@Component({
  selector: 'app-order-management-irp-row-position',
  templateUrl: './order-management-irp-row-position.component.html',
  styleUrls: ['./order-management-irp-row-position.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderManagementIrpRowPositionComponent extends AbstractPermission implements ICellRendererAngularComp {
  public params: ICellRendererParams;
  //todo: remove any[]
  public displayRows: IRPCandidateForPosition[] | any[] = [];
  public colDefs: Record<string, ColDef[]> = OrderManagementSubGridCells;
  public emptyMessage = GRID_EMPTY_MESSAGE;
  public isBothSystemsEnabled = false;

  public readonly vmsSystem = OrderManagementIrpCandidateSystem[OrderManagementIrpCandidateSystem.VMS];
  public readonly irpSystem = OrderManagementIrpCandidateSystem[OrderManagementIrpCandidateSystem.IRP];

  constructor(
    private cdr: ChangeDetectorRef,
    protected override store: Store,
    private orderManagementService: OrderManagementService,
    private orderManagementIrpApiService: OrderManagementIrpApiService,
  ) {
    super(store);
  }

  public agInit(params: ICellRendererParams): void {
    this.params = params;
    this.setSystemsFlag(params.context.componentParent);

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

  navigateToPositionDetails(data: OrderInfo): void {
    if (!this.userPermission[this.userPermissions.CanOrganizationViewOrders]) {
      this.store.dispatch(new ShowToast(MessageTypes.Error, AdditionalPermission));
      return;
    }

    this.orderManagementService.setOrderFromAnotherSystem({ system: OrderManagementIRPSystemId.VMS });
    this.orderManagementService.selectedOrderAfterRedirect$.next({
      orderId: Number(data.orderPublicId),
      candidateId: data.candidateProfileId as number,
      orderType: this.params.data.orderType,
      prefix: data.organizationPrefix,
    });
  }

  private setSystemsFlag(componentParent: OrderManagementContentComponent) {
    this.isBothSystemsEnabled = componentParent.isOrgVMSEnabled && componentParent.isOrgIRPEnabled;
  }
}
