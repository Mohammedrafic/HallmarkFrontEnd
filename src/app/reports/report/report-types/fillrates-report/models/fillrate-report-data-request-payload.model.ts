import { OrderType } from '@shared/enums/order-type';
import { ApplicantStatus } from '@shared/enums/applicant-status.enum';
import { BasePaginatedRequestPayloadModel } from '@shared/models/base-paginated-request-payload.model';

export interface FillrateReportDataRequestPayloadModel extends BasePaginatedRequestPayloadModel {
  candidatesStatuses: ApplicantStatus[];
  departmentsIds: number[];
  locationIds: number[];
  orderTypes: OrderType[];
  regionIds: number[];
  skillIds: number[];
}
