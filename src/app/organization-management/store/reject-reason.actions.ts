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
