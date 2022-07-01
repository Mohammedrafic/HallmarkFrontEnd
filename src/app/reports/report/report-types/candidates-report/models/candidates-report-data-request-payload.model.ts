import { BasePaginatedRequestPayloadModel } from '@shared/models/base-paginated-request-payload.model';

export interface CandidatesReportDataRequestPayloadModel extends BasePaginatedRequestPayloadModel {
  agencies: number[];
  applicantStatus: number[];
  candidateName: string;
  skills: number[];
}
