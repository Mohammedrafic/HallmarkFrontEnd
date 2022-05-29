import { PageOfCollections } from '@shared/models/page.model';

export class CredentialSetup {
  id: number;
  masterCredentialId: number;
  skillGroupId: number;
  description?: string;
  isActive: boolean;
  reqSubmission: boolean;
  reqOnboard: boolean;
  inactiveDate: string;
  comments: string;
}

export class CredentialSetupGetGroup {
  credentialTypeId: number;
  skillGroupId: number;
  pageNumber: number;
  pageSize: number;
}

export type CredentialSetupPage = PageOfCollections<CredentialSetup>;
