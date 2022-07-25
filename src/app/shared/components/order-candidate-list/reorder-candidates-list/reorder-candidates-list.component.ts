import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Subject} from 'rxjs';

import { OrderCandidatesList } from '@shared/models/order-management.model';
import { AbstractOrderCandidateListComponent } from '../abstract-order-candidate-list.component';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';

@Component({
  selector: 'app-reorder-candidates-list',
  templateUrl: './reorder-candidates-list.component.html',
  styleUrls: ['./reorder-candidates-list.component.scss'],
})
export class ReorderCandidatesListComponent extends AbstractOrderCandidateListComponent implements OnInit {
  public candidate: OrderCandidatesList;
  public dialogNextPreviousOption: DialogNextPreviousOption = { next: false, previous: false };

  private selectedIndex: number;

  constructor(protected override store: Store, protected override router: Router) {
    super(store, router);
  }

  public onEdit(data: OrderCandidatesList & {index: string}, event: MouseEvent): void {
    this.candidate = { ...data };
    this.addActiveCssClass(event);
    this.selectedIndex = Number(data.index)

    if (this.order && this.candidate) {
      

      if (this.isAgency) {
        
      } else if (this.isOrganization) {
      }

      this.dialogNextPreviousOption = this.getDialogNextPreviousOption(this.candidate);
      this.openDetails.next(true);
    }
  }

  private getDialogNextPreviousOption(selectedOrder: OrderCandidatesList): DialogNextPreviousOption {
    const gridData = this.grid.dataSource as OrderCandidatesList[];
    const first = gridData[0];
    const last = gridData[gridData.length - 1];
    return {
      previous: first.candidateId !== selectedOrder.candidateId,
      next: last.candidateId !== selectedOrder.candidateId,
    };
  }

  public onNextPreviousOrderEvent(next: boolean): void {
    const nextIndex = next ? this.selectedIndex + 1 : this.selectedIndex  - 1;
    const nextCandidate = (this.grid.dataSource as OrderCandidatesList[])[nextIndex];
    this.candidate = nextCandidate;
    this.selectedIndex = nextIndex;
    this.dialogNextPreviousOption = this.getDialogNextPreviousOption(this.candidate);
  }
}

