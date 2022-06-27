import { CredentialSkillGroup } from '@shared/models/skill-group.model';

export class CredentialSetupGet {
  masterCredentialId: number;
  mappingId?: number;
  credentialType: string;
  description: string;
  isActive: boolean;
  reqSubmission: boolean;
  reqOnboard: boolean;
  inactiveDate: string | null;
  comments?: string;
}

export class CredentialSetupPost {
  mappingId: number;
  masterCredentialId: number;
  isActive: boolean;
  reqSubmission: boolean;
  reqOnboard: boolean;
  inactiveDate: string;
  comments: string;
}

export class CredentialSetupMappingPost {
  credentionSetupMappingId?: number;
  regionIds?: number[];
  locationIds?: number[];
  departmentIds?: number[];
  skillGroupIds?: number[];
  credentials: CredentialSetupDetails[];
  forceUpsert?: boolean;
}

export class CredentialSetupDetails {
  masterCredentialId: number;
  optional: boolean;
  reqSubmission: boolean;
  reqOnboard: boolean;
  inactiveDate: string | null;
  comments?: string;
}

export class SaveUpdatedCredentialSetupDetailIds {
  createdIds: number[];
}

export class CredentialSetupFilterDto {
  regionId?: number;
  locationId?: number;
  departmentId?: number;
  skillGroupId?: number;
  skillId?: number;
  pageNumber?: number;
  pageSize?: number;
}

export class CredentialSetupFilterGet {
  mappingId: number;
  regionName?: string;
  regionId?: number;
  locationName?: string;
  locationId?: number;
  departmentName?: string;
  departmentId?: number;
  skillGroups?: CredentialSkillGroup[];
}
