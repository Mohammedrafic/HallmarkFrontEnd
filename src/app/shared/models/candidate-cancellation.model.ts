import { JobCancellationReason, PenaltyCriteria } from "@shared/enums/candidate-cancellation";

export type CandidateCancellation = {
  jobId: number;
  organizationId: number;
  jobCancellationDto: JobCancellation;
  candidatePayRate: string | null;
}

export type JobCancellation = {
  jobCancellationReason: JobCancellationReason;
  penaltyCriteria: PenaltyCriteria;
  rate: number;
  hours: number;
}
