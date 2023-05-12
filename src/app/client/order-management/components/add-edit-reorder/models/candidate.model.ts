export interface CandidateModel {
  candidateId: number;
  candidateName: string;
  agencyId: number;
  agencyName: string;
  status: string;
  id: number;
  name: string;
}

export interface AgencyModel {
  agencyId: number;
  agencyName: string;
  id: number;
  name: string;
  hasActiveCandidate: boolean;
}
