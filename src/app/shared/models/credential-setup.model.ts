import { PageOfCollections } from '@shared/models/page.model';

export class CredentialSetup {
  id: number;
  masterCredentialId: number;
  skillGroupId: number;
  description?: string;
  regionId: number;
  isActive: boolean;  // TODO: clarify with BE
  optional?: boolean; // TODO: not present on API
  reqSubmission: boolean;
  reqOnboard: boolean;
  inactiveDate: string;
  comments: string;
}

export class CredentialSetupGetGroup {
  credentialTypeId: number;
  skillGroupId: number;
  regionId: number;
  pageNumber: number;
  pageSize: number;
}

export type CredentialSetupPage = PageOfCollections<CredentialSetup>;
