import { CandidatStatus } from "@shared/enums/applicant-status.enum";
import { CandidateStatus, CandidatesStatusText, FilterOrderStatusText } from "@shared/enums/status";

export const StatusesByDefault = [
  CandidatStatus['Not Applied'],
  CandidatStatus.Applied,
  CandidatStatus.Shortlisted,
  CandidatStatus.Offered,
  CandidatStatus.Accepted,
  CandidatStatus.OnBoard,
  CandidatStatus.Withdraw,
  CandidatStatus.Offboard,
  CandidatStatus.Rejected,
  CandidatStatus.Cancelled,
];

export const ReorderDefaultStatuses = [
  FilterOrderStatusText.Open,
  FilterOrderStatusText['In Progress'],
  FilterOrderStatusText.Filled,
  FilterOrderStatusText.Closed,
];

export const ReorderCandidateStatuses = [
  CandidatesStatusText['Bill Rate Pending'],
  CandidatesStatusText['Offered Bill Rate'],
  CandidatesStatusText.Onboard,
  CandidatesStatusText.Rejected,
  CandidatStatus.Cancelled,
];

export const PerDiemDefaultStatuses = [
  FilterOrderStatusText.Filled,
  FilterOrderStatusText['In Progress'],
];

export const AllOrdersDefaultStatuses = [
  FilterOrderStatusText.Filled,
  FilterOrderStatusText['In Progress'],
  FilterOrderStatusText.Closed,
  FilterOrderStatusText.Open,
  CandidateStatus.Incomplete,
];
