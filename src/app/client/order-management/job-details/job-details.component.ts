import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { Select, Store } from '@ngxs/store';
import { OrderType } from '@shared/enums/order-type';
import { ReasonForRequisition } from '@shared/enums/reason-for-requisition';
import { OrderManagement } from '@shared/models/order-management.model';
import { Order } from '@shared/models/organization.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-job-details',
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.scss']
})
export class JobDetailsComponent implements OnInit, OnDestroy {
  private unsubscribe$: Subject<void> = new Subject();

  public order: Order;
  @Input() set currentOrder(value: Order) {
    this.order = value;
    this.init();
  }

  public reasonForRequisition = ReasonForRequisition
  public orderType = OrderType;

  constructor(private store: Store) {
   
  }

  ngOnInit(): void {
    
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public init() : void {

  }
}
