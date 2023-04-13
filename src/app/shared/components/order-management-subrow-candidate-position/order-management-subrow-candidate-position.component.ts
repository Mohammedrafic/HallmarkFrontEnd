import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';

import { ColDef } from '@ag-grid-community/core';

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
import { OrderManagementIrpCandidateSystem,
} from '../grid/cell-renderers/order-management-irp-row-position/order-management-irp-row-position.enum';

@Component({
  selector: 'app-order-management-subrow-candidate-position',
  templateUrl: './order-management-subrow-candidate-position.component.html',
  styleUrls: ['./order-management-subrow-candidate-position.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderManagementSubrowCandidatePositionComponent {
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
    private cd: ChangeDetectorRef
  ) { }

  public trackByField(index: number, config: ColDef): string {
    return config.field as string;
  }

  public emitOpenPosition(): void {
    this.openPosition.emit(this.initJobData);
  }
}
