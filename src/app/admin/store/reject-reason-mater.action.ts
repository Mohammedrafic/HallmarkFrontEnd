import { RejectReason } from "@shared/models/reject-reason.model";

export class GetRejectReasonsMasterByPage {
  static readonly type = '[reject reason master] Get Reject reason by Page';
  constructor(public pageNumber: number, public pageSize: number) { }
}

export class SaveRejectMasterReasons {
  static readonly type = '[reject reason master] Save Reject Reason';
  constructor(public payload: { reason: string }){}
}

export class UpdateRejectMasterReasons {
  static readonly type = '[reject reason master] Update Reject Reason';
  constructor(public payload: RejectReason) {
  }
}

export class RemoveRejectMaterReasons {
  static readonly type = '[reject reason master] Remove Reject Reason';
  constructor(public id: number){}
}

export class SaveRejectMasterReasonsError {
  static readonly type = '[reject reason master] Save Reject Reason Error';
}

export class UpdateRejectMasterReasonsSuccess {
  static readonly type = '[reject reason master] Update Reject Reason Success';
}

export class SaveRejectMasterReasonsSuccess {
  static readonly type = '[reject reason master] Save Reject Reason Success';
}
