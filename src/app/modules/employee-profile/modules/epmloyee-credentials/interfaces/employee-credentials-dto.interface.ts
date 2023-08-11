import { DepartmentMatchStatus } from '@shared/components/credentials-grid/department-match-cell/department-match-cell-enum';
import { CredentialStatus } from '@shared/enums/status';
import { CredentialFile } from '@shared/models/candidate-credential.model';
import { CredentialType } from '@shared/models/credential-type.model';
import { PageOfCollections } from '@shared/models/page.model';

export interface PageSettings {
  pageNumber: number;
  pageSize: number;
}

export interface EmployeeCredentialsRequestParams extends PageSettings {
  candidateProfileId: number;
}

export interface EmployeeCredential {
  id: number;
  masterCredentialId: number;
  candidateProfileId: number;
  credential: string;
  status: CredentialStatus;
  credentialNumber: string;
  certifiedOn: string;
  certifiedUntil: string;
  completedDate: string;
  comment: string;
  rejectReason: string;
  expireDateApplicable: boolean;
  departmentMatch: DepartmentMatchStatus;
  credentialType: CredentialType;
  files: CredentialFile[];
}

export type EmployeeCredentialsPage = PageOfCollections<EmployeeCredential>;
