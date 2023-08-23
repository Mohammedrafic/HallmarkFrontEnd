import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { OrderApplicantsApplyData } from '@shared/models/order-applicants.model';
import { AcceptJobDTO, AgencyOrderFilters } from '@shared/models/order-management.model';
import { RejectReasonPayload } from '@shared/models/reject-reason.model';
import { ExportPayload } from '@shared/models/export.model';
import { AgencyOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';

export class GetAgencyOrdersPage {
  static readonly type = '[agency order management] Get Agency Orders Page';
  constructor(public pageNumber: number, public pageSize: number, public filters: AgencyOrderFilters) {}
}

export class GetOrderById {
  static readonly type = '[agency order management] Get Order By Id';
  constructor(public id: number, public organizationId: number, public options?: DialogNextPreviousOption) {}
}

export class GetAgencyOrderCandidatesList {
  static readonly type = '[agency order management] Get Agency Order Candidates Page';
  constructor(
    public orderId: number,
    public organizationId: number,
    public pageNumber: number,
    public pageSize: number,
    public excludeDeployed?: boolean,
    public searchTerm?: string,
  ) {}
}

export class GetCandidateJob {
  static readonly type = '[agency order management] Get Agency Candidate Job';
  constructor(public organizationId: number, public jobId: number) {}
}

export class ClearAgencyCandidateJob {
  static readonly type = '[agency order management] Clear Agency Candidate Job';
}

export class UpdateAgencyCandidateJob {
  static readonly type = '[agency order management] Update Agency Candidate Job';
  constructor(public payload: AcceptJobDTO) {}
}

export class GetRejectReasonsForAgency {
  static readonly type = '[agency order management] Get All Reject Reasons';
  constructor() {}
}

export class RejectCandidateJob {
  static readonly type = '[agency order management] Reject Candidate Job';
  constructor(public payload: RejectReasonPayload) {}
}

export class RejectCandidateForAgencySuccess {
  static readonly type = '[agency order management] Reject Candidate Success';
  constructor() {}
}

export class GetOrderApplicantsData {
  static readonly type = '[agency order management] Get Order Applicants Initial Data';
  constructor(public orderId: number, public organizationId: number, public candidateId: number) {}
}

export class ApplyOrderApplicants {
  static readonly type = '[agency order management] Apply Order Applicants';
  constructor(public payload: OrderApplicantsApplyData) {}
}

export class ApplyOrderApplicantsSucceed {
  static readonly type = '[agency order management] Apply Order Applicants Succeed';
  constructor() {}
}

export class ReloadOrderCandidatesLists {
  static readonly type = '[agency order management] Reload Order and Candidates Lists';
  constructor() {}
}

export class GetAgencyFilterOptions {
  static readonly type = '[agency order management] Get Agency Filte rOptions';
  constructor() {}
}

export class GetOrganizationStructure {
  static readonly type = '[agency order management] Get Organization Structure';
  constructor(public organizationIds: number[]) {}
}
export class ExportAgencyOrders {
  static readonly type = '[order management] Export Agency Orders list';
  constructor(public payload: ExportPayload, public tab: AgencyOrderManagementTabs) {}
}

export class SetOrdersTab {
  static readonly type = '[order management] Set Orders Type';
  constructor(public tabName: AgencyOrderManagementTabs) {}
}

export class ClearOrders {
  static readonly type = '[agency order management] Clear Orders';
  constructor() {}
}

export class GetAgencyHistoricalData {
  static readonly type = '[agency order management] Get Historical Data';
  constructor(public organizationId: number, public candidateJobId: number) {}
}

export class ClearAgencyHistoricalData {
  static readonly type = '[agency order management] Clear Historical Data';
}

export class GetAgencyExtensions {
  static readonly type = '[agency order management] Get Extensions';
  constructor(public id: number, public orderId: number, public organizationId: number) {}
}

export class GetDeployedCandidateOrderInfo {
  static readonly type = '[agency order management] Get Deployed Candidate Order Info';
  constructor(public orderId: number, public candidateProfileId: number, public organizationId: number) {}
}

export class ClearDeployedCandidateOrderInfo {
  static readonly type = '[agency order management] Clear Deployed Candidate Order Info';
}

export class ClearAgencyOrderCandidatesList {
  static readonly type = '[agency order management] Clear Agency Order Candidates List';
}

export class ClearOrganizationStructure {
  static readonly type = '[agency order management] Clear Organization Structure';
}

export class GetAgencyAvailableSteps {
  static readonly type = '[agency order management] Get agency available steps';

  constructor(public readonly organizationId: number, public readonly jobId: number) {}
}
