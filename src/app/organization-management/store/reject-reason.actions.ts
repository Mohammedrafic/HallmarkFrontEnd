import { UnavailabilityValue } from '@organization-management/reasons/interfaces';
import { PenaltyPayload } from "@shared/models/penalty.model";
import { RejectReason, RejectReasonWithRedflag, RejectReasonwithSystem } from "@shared/models/reject-reason.model";

export class GetRejectReasonsByPage {
  static readonly type = '[reject reason] Get Reject reason by Page';
  constructor(public pageNumber: number, public pageSize: number) { }
}

export class SaveRejectReasons {
  static readonly type = '[reject reason] Save Reject Reason';
  constructor(public payload: RejectReason){}
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
  constructor(
    public pageNumber?: number,
    public pageSize?: number,
    public orderBy?: string,
    public getAll?: boolean,
    public excludeDefaultReasons?: boolean,
  ) { }
}

export class SaveClosureReasons {
  static readonly type = '[reject reason] Save Closure Reason';
  constructor(public payload: RejectReasonwithSystem){}
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
  constructor(
    public pageNumber?: number,
    public pageSize?: number,
    public orderBy?: string,
    public lastSelectedBusinessUnitId?: number,
    public excludeOpenPositionReason = false,
  ) { }
}

export class SaveOrderRequisition {
  static readonly type = '[reject reason] Save Order Requisition';
  constructor(public payload: RejectReasonwithSystem){}
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

export class SavePenaltyError {
  static readonly type = '[reject reason] Save Penalty Error';
}

export class SavePenaltySuccess {
  static readonly type = '[reject reason] Save Penalty Success';
}

export class ShowOverridePenaltyDialog {
  static readonly type = '[reject reason] Show Override Penalty Dialog';
}

export class SaveNewUnavailabilityReason {
  static readonly type = '[reject reason] Save new unavailability reason';

  constructor(public readonly payload: UnavailabilityValue) {}
}

export class GetUnavailabilityReasons {
  static readonly type = '[reject reason] Get Unavailability reasons';

  constructor(public readonly page: number, public pageSize: number) {}
}

export class SaveUnavailabilityReason {
  static readonly type = '[reject reason] Save Unavailability reason';

  constructor(public payload: UnavailabilityValue) {}
}

export class RemoveUnavailabilityReason {
  static readonly type = '[reject reason] Remove Unavailability reason';

  constructor(public readonly id: number) {}
}

export class GetInternalTransferReasons {
  static readonly type = '[reject reason] Get Internal Transfer reason by Page';
  constructor(public pageNumber: number, public pageSize: number) { }
}

export class SaveInternalTransferReasons {
  static readonly type = '[reject reason] Save InternalTransfer Reason';
  constructor(public payload: RejectReason){}
}

export class RemoveInternalTransferReasons {
  static readonly type = '[reject reason] Remove InternalTransfer Reason';
  constructor(public id: number){}
}

export class UpdateInternalTransferReasons {
  static readonly type = '[reject reason] Update InternalTransfer Reason';
  constructor(public payload: RejectReason) {
  }
}

export class UpdateInternalTransferReasonsSuccess {
  static readonly type = '[reject reason] Update Internal Transfer Reason Success';
}

export class UpdateInternalTransferReasonsError {
  static readonly type = '[reject reason] Update Internal Transfer Reason Error';
}


export class GetTerminationReasons {
  static readonly type = '[reject reason] Get Termination reason by Page';
  constructor(public pageNumber: number, public pageSize: number) { }
}
export class GetSourcingReasons {
  static readonly type = '[reject reason] Get GetSourcingReasons reason by Page';
  constructor() { }
}

export class SaveTerminationReasons {
  static readonly type = '[reject reason] Save Termination Reason';
  constructor(public payload: RejectReason){}
}

export class RemoveTerminationReasons {
  static readonly type = '[reject reason] Remove Termination Reason';
  constructor(public id: number){}
}

export class UpdateTerminationReasons {
  static readonly type = '[reject reason] Update Termination Reason';
  constructor(public payload: RejectReason) {
  }
}

export class UpdateTerminationReasonsSuccess {
  static readonly type = '[reject reason] Update Termination Reason Success';
}

export class SaveTerminatedReasonError {
  static readonly type = '[reject reason] Save Manual Invoice Reason Error';
}

export class GetCategoryNoteReasons {
  static readonly type = '[reject reason] Get CategoryNote reason by Page';
  constructor(public pageNumber: number, public pageSize: number) { }
}

export class SaveCategoryNoteReasons {
  static readonly type = '[reject reason] Save CategoryNote Reason';
  constructor(public payload: RejectReasonWithRedflag){}
}

export class RemoveCategoryNoteReasons {
  static readonly type = '[reject reason] Remove CategoryNote Reason';
  constructor(public id: number){}
}

export class UpdateCategoryNoteReasons {
  static readonly type = '[reject reason] Update CategoryNote Reason';
  constructor(public payload: RejectReasonWithRedflag) {
  }
}

export class UpdateCategoryNoteReasonsSuccess {
  static readonly type = '[reject reason] Update CategoryNote Reason Success';
}

export class UpdateCategoryNoteReasonsError {
  static readonly type = '[reject reason] Save CategoryNote Reason Error';
}

//Recuriter-reasons

export class GetRecuriterReasonsByPage {
  static readonly type = '[recuriter reason] Get Recuriter reason by Page';
  constructor(public pageNumber: number, public pageSize: number) { }
}

export class SaveRecuriterReasons {
  static readonly type = '[recuriter reason] Save Recuriter Reason';
  constructor(public payload: RejectReason){}
}

export class RemoveRecuriterReasons {
  static readonly type = '[recuriter reason] Remove Recuriter Reason';
  constructor(public id: number){}
}

export class UpdateRecuriterReasons {
  static readonly type = '[recuriter reason] Update Recuriter Reason';
  constructor(public payload: RejectReason) {
  }
}

export class SaveRecuriterReasonsError {
  static readonly type = '[recuriter reason] Save Recuriter Reason Error';
}

export class UpdateRecuriterReasonsSuccess {
  static readonly type = '[recuriter reason] Update Recuriter Reason Success';
}

export class SaveRecuriterReasonsSuccess {
  static readonly type = '[recuriter reason] Save Recuriter Reason Success';
}



//Sourcing-reasons

export class GetSourcingReasonsByPage {
  static readonly type = '[sourcing reason] Get Sourcing reason by Page';
  constructor(public pageNumber: number, public pageSize: number) { }
}

export class SaveSourcingReasons {
  static readonly type = '[sourcing reason] Save Sourcing Reason';
  constructor(public payload: RejectReason){}
}

export class RemoveSourcingReasons {
  static readonly type = '[sourcing reason] Remove Sourcing Reason';
  constructor(public id: number){}
}

export class UpdateSourcingReasons {
  static readonly type = '[sourcing reason] Update Sourcing Reason';
  constructor(public payload: RejectReason) {
  }
}

export class SaveSourcingReasonsError {
  static readonly type = '[sourcing reason] Save Sourcing Reason Error';
}

export class UpdateSourcingReasonsSuccess {
  static readonly type = '[sourcing reason] Update Sourcing Reason Success';
}

export class SaveSourcingReasonsSuccess {
  static readonly type = '[sourcing reason] Save Sourcing Reason Success';
}

export class GetSourcingConfig {
  static readonly type = '[reject reason] Get GetSourcing Config';
  constructor() { }
}