import { SystemType } from "@shared/enums/system-type.enum";

export interface TierDTO {
  organizationTierId: number;
  regionIds: number[];
  locationIds: number[];
  departmentIds: number[];
  name?: string;
  hours?: number;
  associateOrganizationId?: number;
  forceUpsert?: boolean;
  tierExceptionId?: number;
  includeInIRP?: boolean;
  includeInVMS?: boolean;
  systemType?: SystemType;
}

export interface TierConfig {
  regions: number[];
  locations: number[];
  departments: number[];
}
