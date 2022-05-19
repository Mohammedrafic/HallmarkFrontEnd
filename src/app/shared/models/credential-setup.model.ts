import { PageOfCollections } from '@shared/models/page.model';
import { GetCredentialSetup } from '../../organization-management/store/organization-management.actions';

export class CredentialSetup {
  id: number;
  organizationId: number;
  masterCredentialId: number;
  skillGroupId: number;
  description?: string;
  regionId: number;
  isActive: boolean;  // TODO: clarify with BE
  expiryDateApplied?: boolean;  // TODO: not present on API
  optional?: boolean; // TODO: not present on API
  reqSubmission: boolean;
  reqOnboard: boolean;
  inactiveDate: string;
  comments: string;
}

export class CredentialSetupGetGroup {
  credentialTypeId: number;
  organizationId: number;
  skillGroupId: number;
  regionId: number;
  pageNumber: number;
  pageSize: number;
}

export type CredentialSetupPage = PageOfCollections<CredentialSetup>;
