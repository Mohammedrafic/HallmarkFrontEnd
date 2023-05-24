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
  workcommitmentId: number;
  skillId : number;
  All : boolean;
  Primary : boolean;
  Secondary : boolean;
}

export interface TierConfig {
  regions: number[];
  locations: number[];
  departments: number[];
}
