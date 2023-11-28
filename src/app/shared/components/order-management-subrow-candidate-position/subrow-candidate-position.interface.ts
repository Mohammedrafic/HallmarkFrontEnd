export interface OrderManagementChildCandidate {
  positionId: string;
  orderStatus: string;
  system: number | string;
  candidateName: string;
  candidateStatus: string;
  actualStartDate: string | null;
  actualEndDate: string | null;
  candidateBillRate: string;
  organizationPrefix: string;
  orderId: number;
  orderPublicId?: number;
  candidateId: number;
  firstName: string;
  jobId: number;
  lastName: string;
  middleName: string;
  organizationId: number;
  statusName: string;
  agencyName: string;
  guaranteedWorkWeek?: number | string| null;
}
