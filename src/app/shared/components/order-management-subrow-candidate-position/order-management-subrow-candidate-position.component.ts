import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';

import { ColDef } from '@ag-grid-community/core';
import { Store } from '@ngxs/store';

import { OrderManagementChild } from '@shared/models/order-management.model';
import {
  OrderManagementSubGridCells,
} from '@shared/components/order-management-subrow-candidate-position/subrow-candidate-position.const';
import {
  SubrowCandidatePositionAdapter,
} from '@shared/components/order-management-subrow-candidate-position/subrow-candidate-position.adapter';
import {
  OrderManagementChildCandidate,
} from '@shared/components/order-management-subrow-candidate-position/subrow-candidate-position.interface';
import { ShowToast } from 'src/app/store/app.actions';
import {
  OrderManagementService,
} from '@client/order-management/components/order-management-content/order-management.service';
import { OrderInfo } from '@client/order-management/interfaces';
import { AdditionalPermission } from '@shared/components/grid/constants/grid.constants';
import { MessageTypes } from '@shared/enums/message-types';
import { OrderManagementIRPSystemId } from '@shared/enums/order-management-tabs.enum';
import { AbstractPermission } from '@shared/helpers/permissions';
import { OrderManagementIrpCandidateSystem,
} from '../grid/cell-renderers/order-management-irp-row-position/order-management-irp-row-position.enum';

@Component({
  selector: 'app-order-management-subrow-candidate-position',
  templateUrl: './order-management-subrow-candidate-position.component.html',
  styleUrls: ['./order-management-subrow-candidate-position.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderManagementSubrowCandidatePositionComponent extends AbstractPermission {
  @Input() public isBothSystemsEnabled: boolean;
  @Input() public selected: boolean;
  @Input() set candidatePosition(candidate: OrderManagementChild) {
    this.vmsPosition = candidate.system === OrderManagementIrpCandidateSystem.VMS;
    this.initJobData = candidate;
    this.candidate = SubrowCandidatePositionAdapter.prepareTableData(candidate);
    this.colDefs = OrderManagementSubGridCells(candidate.system as number);
    this.cd.markForCheck();
  }

  @Output() openPosition: EventEmitter<OrderManagementChild> = new EventEmitter();

  public colDefs: ColDef[] = [];
  //todo: remove any
  public candidate: OrderManagementChildCandidate | any;

  public vmsPosition = false;

  private initJobData: OrderManagementChild;

  constructor(
    private cd: ChangeDetectorRef,
    protected override store: Store,
    private orderManagementService: OrderManagementService,
  ) {
    super(store);
  }

  public trackByField(index: number, config: ColDef): string {
    return config.field as string;
  }

  public emitOpenPosition(): void {
    this.openPosition.emit(this.initJobData);
  }

  public navigateToPositionDetails(data: OrderInfo): void {
    if (!this.userPermission[this.userPermissions.CanOrganizationViewOrdersIRP]) {
      this.store.dispatch(new ShowToast(MessageTypes.Error, AdditionalPermission));
      return;
    }

    this.orderManagementService.setOrderFromAnotherSystem({
      system: OrderManagementIRPSystemId.IRP,
      orderId: `${data.organizationPrefix }-${data.orderPublicId}`,
    });
  }
}
