import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import {
  AcceptJobDTO,
  CreateOrderDto,
  EditOrderDto,
  OrderFilter,
  OrderManagementFilter,
} from '@shared/models/order-management.model';
import { OrderType } from '@shared/enums/order-type';
import { RejectReasonPayload } from '@shared/models/reject-reason.model';
import { ExportPayload } from '@shared/models/export.model';
import { OrganizationOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';
import { Comment } from '@shared/models/comment.model';

export class GetOrders {
  static readonly type = '[order management] Get Orders';
  constructor(public payload: OrderManagementFilter | object, public isIncomplete?: boolean | undefined) {}
}

export class ClearOrders {
  static readonly type = '[order management] Clear Orders';
  constructor() {}
}

export class GetOrderById {
  static readonly type = '[order management] Get Order By Id';
  constructor(public id: number, public organizationId: number, public options?: DialogNextPreviousOption) {}
}

export class SetLock {
  static readonly type = '[order management] Set Lock';
  constructor(
    public id: number,
    public lockStatus: boolean,
    public filters: OrderFilter = {},
    public updateOpened = false
  ) {}
}

export class LockUpdatedSuccessfully {
  static readonly type = '[order management] Lock Updated Successfully';
  constructor() {}
}

export class GetAgencyOrderCandidatesList {
  static readonly type = '[order management] Get Order Candidates Page';
  constructor(
    public orderId: number,
    public organizationId: number,
    public pageNumber: number,
    public pageSize: number,
    public excludeDeployed?: boolean
  ) {}
}

export class GetSelectedOrderById {
  static readonly type = '[order management] Get Selected Order By Id';
  constructor(public payload: number) {}
}

export class GetOrganizationStatesWithKeyCode {
  static readonly type = '[order management] Get Organizations States With Key Code';
  constructor() {}
}

export class GetWorkflows {
  static readonly type = '[order management] Get Workflows';
  constructor(public departmentId: number, public skillId: number) {}
}

export class GetProjectTypes {
  static readonly type = '[order management] Get Project Types';
  constructor() {}
}
export class GetOrganisationCandidateJob {
  static readonly type = '[order management] Get Organisation Candidate Job';
  constructor(public organizationId: number, public jobId: number) {}
}

export class UpdateOrganisationCandidateJob {
  static readonly type = '[order management] Update Organisation Candidate Job';
  constructor(public payload: AcceptJobDTO) {}
}

export class UpdateOrganisationCandidateJobSucceed {
  static readonly type = '[order management] Update Organisation Candidate Job Succeed';
  constructor() {}
}

export class GetAvailableSteps {
  static readonly type = '[order management] Get AvailableSteps';
  constructor(public organizationId: number, public jobId: number) {}
}

export class GetProjectSpecialData {
  static readonly type = '[order management] Get Project Special Data';
  constructor() {}
}

export class GetSuggestedDetails {
  static readonly type = '[order management] Get Suggested Details';
  constructor(public locationId: number) {}
}

export class GetProjectNames {
  static readonly type = '[order management] Get Project Names';
  constructor() {}
}

export class GetAssociateAgencies {
  static readonly type = '[order management] Get Associate Agencies';
  constructor() {}
}

export class SetPredefinedBillRatesData {
  static readonly type = '[order management] Set Predefined Bill Rates Data';
  constructor(public orderType: OrderType, public departmentId: number, public skillId: number) {}
}

export class GetPredefinedBillRates {
  static readonly type = '[order management] Get Predefined Bill Rates';
  constructor() {}
}

export class ClearPredefinedBillRates {
  static readonly type = '[order management] Clear Predefined Bill Rates';
  constructor() {}
}

export class SetIsDirtyOrderForm {
  static readonly type = '[order management] Set Is Dirty Order Form';
  constructor(public isDirtyOrderForm: boolean) {}
}

export class SaveOrder {
  static readonly type = '[order management] Save Order';
  constructor(public order: CreateOrderDto, public documents: Blob[], public comments?: Comment[] | undefined) {}
}

export class SaveOrderSucceeded {
  static readonly type = '[order management] Save Order Succeeded';
  constructor() {}
}

export class EditOrder {
  static readonly type = '[order management] Edit Order';
  constructor(public order: EditOrderDto, public documents: Blob[]) {}
}

export class DeleteOrder {
  static readonly type = '[order management] Delete Order';
  constructor(public id: number) {}
}

export class DeleteOrderSucceeded {
  static readonly type = '[order management] Delete Order Succeeded';
  constructor() {}
}

export class ReloadOrganisationOrderCandidatesLists {
  static readonly type = '[agency order management] Reload Order and Candidates Lists on Organisation';
  constructor() {}
}

export class ClearSelectedOrder {
  static readonly type = '[order management] Clear selected order';
  constructor() {}
}

export class GetRejectReasonsForOrganisation {
  static readonly type = '[organizationManagement] Get All Reject Reasons';
  constructor() {}
}

export class RejectCandidateForOrganisationSuccess {
  static readonly type = '[organizationManagement] Reject Candidate Success';
  constructor() {}
}

export class RejectCandidateJob {
  static readonly type = '[organizationManagement] Reject Candidate Job';
  constructor(public payload: RejectReasonPayload) {}
}

export class ApproveOrder {
  static readonly type = '[order management] Approve Order';
  constructor(public id: number) {}
}

export class GetOrderFilterDataSources {
  static readonly type = '[order management] Get Order Filter Data Sources';
  constructor() {}
}

export class GetHistoricalData {
  static readonly type = '[order management] Get Historical Data';
  constructor(public organizationId: number, public candidateJobId: number) {}
}

export class ClearHistoricalData {
  static readonly type = '[order management] Clear Historical Data';
}

export class ExportOrders {
  static readonly type = '[order management] Export Organization list';
  constructor(public payload: ExportPayload, public tab: OrganizationOrderManagementTabs) {}
}

export class ClearSuggestions {
  static readonly type = '[order management] Clear Suggestions';
  constructor() {}
}

export class DuplicateOrder {
  static readonly type = '[order management] Duplicate Order';
  constructor(public payload: number) {}
}

export class DuplicateOrderSuccess {
  static readonly type = '[order management] Duplicate Order Success';
  constructor(public payload: number) {}
}

export class SelectNavigationTab {
  static readonly type = '[order management] Select Navigation Tab';
  constructor(
    public pending: OrganizationOrderManagementTabs | null,
    public active?: OrganizationOrderManagementTabs | null,
    public current?: OrganizationOrderManagementTabs
  ) {}
}

export class GetContactDetails {
  static readonly type = '[order management] Get Contact Details';
  constructor(public departmentId: number) {}
}

export class GetExtensions {
  static readonly type = '[order management] Get Extensions';
  constructor(public id: number) {}
}
