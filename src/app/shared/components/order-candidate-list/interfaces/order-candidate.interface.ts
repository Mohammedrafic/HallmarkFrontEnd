import { ApplicantStatus, IrpOrderCandidate, Order, OrderAvailabilityOverlap } from '@shared/models/order-management.model';

export interface CreateIrpCandidateDto {
  employeeId: number;
  orderId: number;
  actualStartDate: string | null;
  actualEndDate: string | null;
  availabilityOverlap: OrderAvailabilityOverlap | null;
}

export interface UpdateIrpCandidateDto {
  organizationId: number;
  jobId: number;
  actualStartDate: string;
  actualEndDate: string;
}

export interface CancelIrpCandidateDto {
  organizationId: number;
  jobId: number;
}

export interface CandidateDetails {
  actualStartDate: string | Date;
  actualEndDate: string | Date;
  availableStatuses: ApplicantStatus[]
}

export interface EditCandidateDialogState {
  isOpen: boolean;
  candidate: IrpOrderCandidate;
  order: Order;
}

export interface ClosePositionDto {
  jobId: number;
  reasonId: number;
  closingDate: string;
}

export interface JobDetailsDto {
  OrganizationId: number;
  JobId: number;
}
