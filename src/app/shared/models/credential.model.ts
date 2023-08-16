import { CredentialType } from "./credential-type.model";
import { PageOfCollections } from "./page.model";

export class Credential {
  id?: number;
  credentialTypeId: number;
  credentialTypeName?: string;
  name: string;
  expireDateApplicable: boolean;
  comment?: string;
  isMasterCredential?: boolean;
  irpComment?: string;
  system?: string;
  includeInIRP?: boolean;
  includeInVMS?: boolean;
  reqSubmission?: boolean;
  reqOnboard?: boolean;
  optional?: boolean;

  constructor(credential: Credential) {
    if (credential.id) {
      this.id = credential.id;
    }

    this.credentialTypeId = credential.credentialTypeId;
    this.name = credential.name;
    this.comment = credential.comment;
    this.expireDateApplicable = credential.expireDateApplicable;
    this.includeInIRP = credential.includeInIRP;
    this.includeInVMS = credential.includeInVMS;
    this.irpComment = credential.irpComment;
    this.reqOnboard = credential.reqOnboard;
    this.reqSubmission = credential.reqSubmission;
    this.optional = credential.optional;
  }
}

export type CredentialPage = PageOfCollections<Credential>;

export interface CredentialFilter {
  searchTerm?: string;
  credentialTypeIds?: number[];
  credentialIds?: number[];
  expireDateApplicable?: boolean;
  orderBy?: string;
  pageSize?: number;
  pageNumber?: number;
  includeInIRP?: boolean;
  includeInVMS?: boolean;
}

export class CredentialDataSource {
  id: number;
  name: string;
  expireDateApplicable: boolean;
}

export interface CredentialFilterDataSources {
  credentialTypes: CredentialType[];
  credentials: CredentialDataSource[];
}

export type AssignedCredentialTreeItem = {
  id: string;
  pid: string;
  cid: number;
  name: string;
  isAssignable: boolean;
  hasChild: boolean;
};

export type AssignedCredentialTree = AssignedCredentialTreeItem[];

export type AssignedCredentialTreeData = {
  treeItems: AssignedCredentialTree;
  assignedCredentialIds: string[];
};

export interface MissingCredentialsRequestBody {
  orderId: number;
  candidateProfileId: number;
  validateForDate: string;
}

export interface MissingCredential {
  id: number;
  orderId: number;
  credentialId: number;
  credentialName: string;
  credentialTypeId: number;
  credentialType: string;
  reqForSubmission: boolean;
  reqForOnboard: boolean;
  optional: boolean;
  comment: string;
}

export interface MissingCredentialsResponse {
  submissionPercentage: number;
  submissionRequiredPercentage: number;
  onboardingPercentage: number;
  missingCredentials: MissingCredential[];
}
export interface CredentialTypeFilter{
  id:number;
  name:string;
}
