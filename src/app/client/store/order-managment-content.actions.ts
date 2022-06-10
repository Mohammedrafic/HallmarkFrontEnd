import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { OrderManagementFilter } from '@shared/models/order-management.model';

export class GetIncompleteOrders {
  static readonly type = '[order management] Get Incomplete Orders';
  constructor(public payload: OrderManagementFilter | object) { }
}

export class GetOrders {
  static readonly type = '[order management] Get Orders';
  constructor(public payload: OrderManagementFilter | object) { }
}

export class GetOrderById {
  static readonly type = '[order management] Get Order By Id';
  constructor(public id: number, public organizationId: number, public options: DialogNextPreviousOption) {}
}

export class GetAgencyOrderCandidatesList {
  static readonly type = '[order management] Get Order Candidates Page';
  constructor(
    public orderId: number,
    public organizationId: number,
    public pageNumber: number,
    public pageSize: number
  ) {}
}
