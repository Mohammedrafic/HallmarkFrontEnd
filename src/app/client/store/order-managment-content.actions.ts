import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { AcceptJobDTO, OrderManagementFilter } from '@shared/models/order-management.model';
import { OrderType } from '@shared/enums/order-type';
import { CreateOrderDto, EditOrderDto } from '@shared/models/order-management.model';

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

export class GetSelectedOrderById {
  static readonly type = '[order management] Get Selected Order By Id';
  constructor(public payload: number) {}
}

export class GetOrganizationStatesWithKeyCode {
  static readonly type = '[order management] Get Organizations States With Key Code';
  constructor() { }
}

export class GetWorkflows {
  static readonly type = '[order management] Get Workflows';
  constructor(public departmentId: number, public skillId: number) { }
}

export class GetProjectTypes {
  static readonly type = '[order management] Get Project Types';
  constructor() { }
}
export class GetOrganisationCandidateJob {
  static readonly type = '[order management] Get Organisation Candidate Job';
  constructor(
    public organizationId: number,
    public jobId: number
  ) {}
}

export class UpdateOrganisationCandidateJob {
  static readonly type = '[order management] Update Organisation Candidate Job';
  constructor(
    public payload: AcceptJobDTO
  ) {}
}

export class GetAvailableSteps {
  static readonly type = '[order management] Get AvailableSteps';
  constructor(public organizationId: number, public jobId: number) {}
}

export class GetProjectNames {
  static readonly type = '[order management] Get Project Names';
  constructor() { }
}

export class GetMasterShifts {
  static readonly type = '[order management] Get Master Shifts';
  constructor() { }
}

export class GetAssociateAgencies {
  static readonly type = '[order management] Get Associate Agencies';
  constructor() { }
}

export class GetPredefinedBillRates {
  static readonly type = '[order management] Get Predefined Bill Rates';
  constructor(public orderType: OrderType, public departmentId: number, public skillId: number) { }
}

export class SaveOrder {
  static readonly type = '[order management] Save Order';
  constructor(public order: CreateOrderDto, public documents: Blob[]) { }
}

export class SaveOrderSucceeded {
  static readonly type = '[order management] Save Order Succeeded';
  constructor() { }
}

export class EditOrder {
  static readonly type = '[order management] Edit Order';
  constructor(public order: EditOrderDto, public documents: Blob[]) { }
}

export class DeleteOrder {
  static readonly type = '[order management] Delete Order';
  constructor(public id: number) { }
}

export class DeleteOrderSucceeded {
  static readonly type = '[order management] Delete Order Succeeded';
  constructor() { }
}

export class ReloadOrganisationOrderCandidatesLists {
  static readonly type = '[agency order management] Reload Order and Candidates Lists on Organisation';
  constructor() {}
}
