import { ApplicantStatus } from "@shared/enums/applicant-status.enum";
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
  orderMatch?: string;
  reqForOnboard?: boolean;
  reqForSubmission?: boolean;
  comment?: string;
  credentialTypeId?: number;
  credentialTypeName?: string
  rejectReason?: string;
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

export type CandidateCredentialResponse = {
  jobTitle: string;
  publicId: number;
  organizationPrefix: string;
  positionId: number;
  credentials: CandidateCredentialPage
}

export type CredentialParams = {
  isNavigatedFromOrganizationArea: boolean;
  candidateStatus: ApplicantStatus;
  orderId: number;
}
