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
  credentialFiles?: CredentialFile[];
  expireDateApplicable?: boolean;
  orderId: number | null;
}

export type CredentialFile = {
  id: number;
  candidateCredentialId: number;
  name: string;
  fileId: string;
}

export type CredentialGroupedFiles = {
  credentialTypeName: string;
  files: CredentialFile[];
}

export type CandidateCredentialPage = PageOfCollections<CandidateCredential>;
