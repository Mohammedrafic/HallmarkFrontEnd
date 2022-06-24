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
  comments?: string;
}

export class SaveUpdatedCredentialSetupDetailIds {
  createdIds: number[];
}

export class CredentialSetupFilterDto {
  regionId: number | null;
  locationId: number | null;
  departmentId: number | null;
  skillGroupId: number | null;
  skillId: number | null;
  pageNumber?: number;
  pageSize?: number;
}

export class CredentialSetupFilterGet {
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
