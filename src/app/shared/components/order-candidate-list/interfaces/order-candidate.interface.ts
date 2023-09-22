import { ApplicantStatus, IrpOrderCandidate, Order, OrderAvailabilityOverlap } from '@shared/models/order-management.model';
import { CandidatStatus } from '@shared/enums/applicant-status.enum';

export interface CreateIrpCandidateDto {
  employeeId: number;
  orderId: number;
  actualStartDate: string | null;
  actualEndDate: string | null;
  availabilityOverlap: OrderAvailabilityOverlap | null;
  availableStartDate:string | null;
  workflowStepType:CandidatStatus | null;
 }

export interface CreateOfferedIrpCandidateDto {
  employeeId: number;
  orderId: number;
  offeredStartDate: string | null;
  offeredEndDate: string | null;
  availabilityOverlap: OrderAvailabilityOverlap | null;
  availableStartDate:string | null;
  workflowStepType:CandidatStatus | null;
}

export interface UpdateIrpCandidateDto {
  organizationId: number;
  jobId: number;
  actualStartDate: string | null;
  actualEndDate: string | null;
  availableStartDate:string | null;
  workflowStepType:CandidatStatus | null;
  orderId:number | null;
  offeredStartDate?: string | null;
  offeredEndDate?: string | null;
}

export interface UpdateOfferedIrpCandidateDto {
  organizationId: number;
  jobId: number;
  offeredStartDate: string | null;
  offeredEndDate: string | null;
  availableStartDate:string | null;
  workflowStepType:CandidatStatus | null;
  orderId: number | null;
}

export interface CancelIrpCandidateDto {
  organizationId: number;
  jobId: number;
  createReplacement: boolean;
  actualEndDate: string | null
}

export interface CandidateDetails {
  actualStartDate: string | Date;
  actualEndDate: string | Date;
  availableStatuses: ApplicantStatus[];
  commentContainerId : number;
  offeredStartDate: string | Date | null;
  offeredEndDate: string | Date | null;
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
  createReplacement: boolean;
}

export interface JobDetailsDto {
  OrganizationId: number;
  JobId: number;
}

export interface IrpEmployeeToggleState {
  isAvailable: boolean;
  includeDeployed: boolean;
}
