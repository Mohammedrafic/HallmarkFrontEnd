export interface CandidateModel {
  candidateId: number;
  candidateName: string;
  agencyId: number;
  agencyName: string;
  status: string;
  id: number;
  name: string;
  hasActiveCandidate?: boolean;
  actualEndDate?: string | null;
  actualStartDate?: string | null;
}

export interface AgencyModel {
  agencyId: number;
  agencyName: string;
  id: number;
  name: string;
  hasActiveCandidate: boolean;
}
