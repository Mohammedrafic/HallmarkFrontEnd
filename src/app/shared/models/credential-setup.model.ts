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
  credentialTypeName?: string; // used only on UI
}

export class CredentialSetupGetGroupPage {
  credentialTypeId: number;
  skillGroupId: number;
  pageNumber: number;
  pageSize: number;
}

export class CredentialSetupMappingPost {
  organizationId: number;
  regionIds: number[];
  locationIds: number[];
  departmentIds: number[];
  skillGroupIds: number[];
  credentials: CredentialSetupDetails[];
}

export class CredentialSetupDetails {
  masterCredentialId: number;
  optional: boolean;
  reqSubmission: boolean;
  reqOnboard: boolean;
  inactiveDate: string;
  comments: string;
}

export class CredentialSetupFilterDto {
  regionId: number | null;
  locationId: number | null;
  departmentId: number | null;
  skillGroupId: number | null;
  skillId: number | null;
  pageNumber: number;
  pageSize: number;
}

export class CredentialSetupFilterData {
  mappingId: number;
  regionName: string;
  regionId: number;
  locationName: string;
  locationId: number;
  departmentName: string;
  departmentId: number;
  skillGroupName: string;
  skillGroupId: number;
}

export type CredentialSetupPage = PageOfCollections<CredentialSetup>;
