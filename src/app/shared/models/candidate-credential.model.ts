import { PageOfCollections } from "@shared/models/page.model";

export type CandidateCredential = {
  id?: number;
  candidateProfileId?: number;
  status?: number;
  completedDate: string | null;
  masterName?: string;
  masterCredentialId: number;
  number: string;
  insitute: string;
  experience: string;
  createdOn: string;
  createdUntil: string;
}

export type CandidateCredentialPage = PageOfCollections<CandidateCredential>;
