import { Component, OnInit } from '@angular/core';
import { Select } from "@ngxs/store";
import { OrderManagementState } from "@agency/store/order-management.state";
import { Observable, takeWhile } from "rxjs";
import { AgencyOrder, OrderCandidatesListPage } from "@shared/models/order-management.model";
import { Order } from "@shared/models/organization.model";

@Component({
  selector: 'app-candidates-order',
  templateUrl: './order-candidates.component.html',
  styleUrls: ['./order-candidates.component.scss']
})
export class OrderCandidatesComponent implements OnInit {
  public orderCandidatePage: OrderCandidatesListPage;
  public orderCandidateInformation: Order;
  public orderCandidates: AgencyOrder;

  @Select(OrderManagementState.orderCandidatePage)
  public orderCandidatePage$: Observable<OrderCandidatesListPage>;

  @Select(OrderManagementState.orderCandidatesInformation)
  public orderCandidatesInformation$: Observable<Order>;

  private isAlive = true;

  ngOnInit(): void {
    this.subscribeOnOrderCandidates();
  }

  private subscribeOnOrderCandidates(): void {
    this.orderCandidatesInformation$.pipe(takeWhile(() => this.isAlive)).subscribe((order) => {
      this.orderCandidateInformation = order;
      this.orderCandidates = {
        orderId: order.id,
        organizationId: order.organizationId as number
      }
    });

    this.orderCandidatePage$.pipe(takeWhile(() => this.isAlive)).subscribe((order) => {
      this.orderCandidatePage = order;
    });
  }
}
