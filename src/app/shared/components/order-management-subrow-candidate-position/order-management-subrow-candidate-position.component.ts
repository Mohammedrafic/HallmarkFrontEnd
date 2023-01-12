import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';

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

@Component({
  selector: 'app-order-management-subrow-candidate-position',
  templateUrl: './order-management-subrow-candidate-position.component.html',
  styleUrls: ['./order-management-subrow-candidate-position.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderManagementSubrowCandidatePositionComponent {
  @Input() public selected: boolean;
  @Input() set candidatePosition(candidates: OrderManagementChild) {
    this.candidate = SubrowCandidatePositionAdapter.prepareTableData(candidates);
    this.colDefs = OrderManagementSubGridCells(candidates.system as number);
    this.cd.markForCheck();
  }

  public colDefs: ColDef[] = [];
  //todo: remove any
  public candidate: OrderManagementChildCandidate | any;

  constructor(
    private cd: ChangeDetectorRef
  ) { }

  public trackByField(index: number, config: ColDef): string {
    return config.field as string;
  }
}
