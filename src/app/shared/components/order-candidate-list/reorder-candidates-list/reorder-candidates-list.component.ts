import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Subject} from 'rxjs';

import { OrderCandidatesList } from '@shared/models/order-management.model';
import { AbstractOrderCandidateListComponent } from '../abstract-order-candidate-list.component';

@Component({
  selector: 'app-reorder-candidates-list',
  templateUrl: './reorder-candidates-list.component.html',
  styleUrls: ['./reorder-candidates-list.component.scss'],
})
export class ReorderCandidatesListComponent extends AbstractOrderCandidateListComponent implements OnInit {
  public templateState$: Subject<any> = new Subject();
  public candidate: OrderCandidatesList;

  constructor(protected override store: Store, protected override router: Router) {
    super(store, router);
  }

  public onEdit(data: OrderCandidatesList, event: MouseEvent): void {
    this.candidate = { ...data };
    this.addActiveCssClass(event);

    if (this.order && this.candidate) {
      

      if (this.isAgency) {
      } else if (this.isOrganization) {
      }

      // this.openDialog('');
    }
  }

  private openDialog(template: any): void {
    this.templateState$.next(template);
    this.openDetails.next(true);
  }
}

