import { ApplicantStatus } from '@shared/enums/applicant-status.enum';
import { PageOfCollections } from '@shared/models/page.model';

export interface CandidateCredential {
  id?: number;
  candidateProfileId?: number;
  status?: number;
  completedDate?: string | null;
  masterName?: string;
  masterCredentialId: number;
  number?: string;
  insitute?: string;
  experience?: string;
  createdOn?: string | Date;
  createdUntil?: string | Date;
  credentialFiles?: CredentialFile[];
  expireDateApplicable?: boolean;
  orderId?: number | null;
  orderMatch?: string;
  reqForOnboard?: boolean;
  reqForSubmission?: boolean;
  comment?: string;
  credentialTypeId?: number;
  credentialTypeName?: string;
  rejectReason?: string;
  organizationId?: number | null;
  credentialNumber?: string;
  certifiedOn?: string;
  certifiedUntil?: string;
}

export interface CandidateCredentialGridItem extends CandidateCredential {
  disableCopy: boolean;
  disableEdit: boolean;
  showDisableEditTooltip: boolean;
  disableDelete: boolean;
  credentialFile: CredentialFile | null;
}

export interface CredentialFile {
  id: number;
  candidateCredentialId: number;
  name: string;
  fileId: string;
}

export interface CredentialGroupedFiles {
  credentialTypeName: string;
  files: CredentialFile[];
}

export type CandidateCredentialPage = PageOfCollections<CandidateCredential>;

export interface CandidateCredentialResponse {
  jobTitle: string;
  publicId: number;
  organizationPrefix: string;
  positionId: number;
  credentials: CandidateCredentialPage;
}

export interface CredentialRequestParams {
  pageNumber: number;
  pageSize: number;
  orderId?: number;
  organizationId?: number;
  candidateProfileId?: number;
}

export interface CredentialParams {
  isNavigatedFromOrganizationArea: boolean | null;
  candidateStatus: ApplicantStatus | null;
  orderId: number | null;
}
export interface BulkVerifyCandidateCredential{
  candidateCredentials:CandidateCredential[];
}
