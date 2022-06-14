import { DialogNextPreviousOption } from "@shared/components/dialog-next-previous/dialog-next-previous.component";
import { OrderApplicantsApplyData } from "@shared/models/order-applicants.model";

export class GetAgencyOrdersPage {
  static readonly type = '[agency order management] Get Agency Orders Page';
  constructor(public pageNumber: number, public pageSize: number) {}
}
export class GetOrderById {
  static readonly type = '[agency order management] Get Order By Id';
  constructor(public id: number, public organizationId: number, public options: DialogNextPreviousOption) {}
}

export class GetAgencyOrderCandidatesList {
  static readonly type = '[agency order management] Get Agency Order Candidates Page';
  constructor(
    public orderId: number,
    public organizationId: number,
    public pageNumber: number,
    public pageSize: number
  ) {}
}

export class GetAgencyOrderGeneralInformation {
  static readonly type = '[agency order management] Get Agency Order General Information';
  constructor(
    public id: number,
    public organizationId: number
  ) {}
}

export class GetOrderApplicantsData {
  static readonly type = '[agency order management] Get Order Applicants Initial Data';
  constructor(
    public orderId: number,
    public organizationId: number,
    public candidateId: number
  ) {}
}

export class ApplyOrderApplicants {
  static readonly type = '[agency order management] Apply Order Applicants';
  constructor(public payload: OrderApplicantsApplyData) {}
}

export class ApplyOrderApplicantsSucceeded {
  static readonly type = '[agency order management] Apply Order Applicants Succeeded';
  constructor() {}
}

export class ReloadOrderCandidatesLists {
  static readonly type = '[agency order management] Reload Order and Candidates Lists';
  constructor() {}
}

