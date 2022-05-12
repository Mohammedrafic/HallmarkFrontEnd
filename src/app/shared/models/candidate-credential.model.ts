import { PageOfCollections } from "@shared/models/page.model";

export type CandidateCredential = {
  id: number;
  masterCredentialId: number;
  masterName: string;
  number: string;
  insitute: string;
  experience: string;
  createdOn: string;
  createdUntil: string;
}

export type CandidateCredentialPage = PageOfCollections<CandidateCredential>;
