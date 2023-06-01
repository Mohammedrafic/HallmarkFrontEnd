import { SystemType } from "@shared/enums/system-type.enum";

export interface TierDTO {
  organizationTierId: number;
  regionIds: number[] | null;
  locationIds: number[] | null;
  departmentIds: number[] | null;
  name?: string;
  hours?: number;
  associateOrganizationId?: number;
  forceUpsert?: boolean;
  tierExceptionId?: number;
  includeInIRP?: boolean;
  includeInVMS?: boolean;
  systemType?: SystemType;
  WorkCommitmentIds: number;
  Skills : number;
}

export interface TierConfig {
  regions: number[];
  locations: number[];
  departments: number[];
}
