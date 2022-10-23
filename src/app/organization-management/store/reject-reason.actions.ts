import { PenaltyPayload } from "@shared/models/penalty.model";
import { RejectReason } from "@shared/models/reject-reason.model";

export class GetRejectReasonsByPage {
  static readonly type = '[reject reason] Get Reject reason by Page';
  constructor(public pageNumber: number, public pageSize: number) { }
}

export class SaveRejectReasons {
  static readonly type = '[reject reason] Save Reject Reason';
  constructor(public payload: { reason: string }){}
}

export class RemoveRejectReasons {
  static readonly type = '[reject reason] Remove Reject Reason';
  constructor(public id: number){}
}

export class UpdateRejectReasons {
  static readonly type = '[reject reason] Update Reject Reason';
  constructor(public payload: RejectReason) {
  }
}

export class SaveRejectReasonsError {
  static readonly type = '[reject reason] Save Reject Reason Error';
}

export class UpdateRejectReasonsSuccess {
  static readonly type = '[reject reason] Update Reject Reason Success';
}

export class SaveRejectReasonsSuccess {
  static readonly type = '[reject reason] Save Reject Reason Success';
}

export class UpdateClosureReasonsSuccess {
  static readonly type = '[reject reason] Update Closure Reason Success';
}

export class RemoveClosureReasons {
  static readonly type = '[reject reason] Remove Closure Reason';
  constructor(public id: number){}
}

export class GetClosureReasonsByPage {
  static readonly type = '[reject reason] Get Closure reason by Page';
  constructor(public pageNumber?: number, public pageSize?: number, public orderBy?: string, public getAll?: boolean) { }
}

export class SaveClosureReasons {
  static readonly type = '[reject reason] Save Closure Reason';
  constructor(public payload: RejectReason){}
}

export class SaveClosureReasonsError {
  static readonly type = '[reject reason] Save Closure Reason Error';
}

export class CreateManualInvoiceRejectReason {
  static readonly type = '[reject reason] Save Manual Invoice Reason';
  constructor(public payload: RejectReason){}
}

export class UpdateManualInvoiceRejectReasonSuccess {
  static readonly type = '[reject reason] Manual Invoice Reason Success';
}

export class UpdateManualInvoiceRejectReason {
  static readonly type = '[reject reason] Update Manual Invoice Reason';
  constructor(public payload: RejectReason) {
  }
}

export class RemoveManualInvoiceRejectReason {
  static readonly type = '[reject reason] Remove Manual Invoice Reason';
  constructor(public id: number){}
}

export class GetManualInvoiceRejectReasonsByPage {
  static readonly type = '[reject reason] Get Manual Invoice reasons by Page';
  constructor(
    public pageNumber?: number,
    public pageSize?: number,
    public orderBy?: string,
    public getAll?: boolean
  ) { }
}

export class SaveManualInvoiceRejectReasonError {
  static readonly type = '[reject reason] Save Manual Invoice Reason Error';
}


export class UpdateOrderRequisitionSuccess {
  static readonly type = '[reject reason] Update Order Requisition Success';
}

export class RemoveOrderRequisition {
  static readonly type = '[reject reason] Remove Order Requisition';
  constructor(public id: number){}
}

export class GetOrderRequisitionByPage {
  static readonly type = '[reject reason] Get Order Requisition by Page';
  constructor(public pageNumber?: number, public pageSize?: number, public orderBy?: string, public lastSelectedBusinessUnitId?: number) { }
}

export class SaveOrderRequisition {
  static readonly type = '[reject reason] Save Order Requisition';
  constructor(public payload: RejectReason){}
}

export class SaveOrderRequisitionError {
  static readonly type = '[reject reason] Save Order Requisition Error';
}

export class GetPenaltiesByPage {
  static readonly type = '[reject reason] Get Reject Penalties by Page';
  constructor(public pageNumber: number, public pageSize: number) { }
}

export class SavePenalty {
  static readonly type = '[reject reason] Save Penalty';
  constructor(public payload: PenaltyPayload){}
}

export class RemovePenalty {
  static readonly type = '[reject reason] Remove Penalty';
  constructor(public id: number){}
}

export class UpdatePenalty {
  static readonly type = '[reject reason] Update Penalty';
  constructor(public payload: PenaltyPayload) {
  }
}

export class SavePenaltyError {
  static readonly type = '[reject reason] Save Penalty Error';
}

export class SavePenaltySuccess {
  static readonly type = '[reject reason] Save Penalty Success';
}

export class ShowOverridePenaltyDialog {
  static readonly type = '[reject reason] Show Override Penalty Dialog';
}
