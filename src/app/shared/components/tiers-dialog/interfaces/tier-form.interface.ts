export interface TierDTO {
  organizationTierId: number;
  name: string;
  hours: number;
  priority?: number;
  regionIds: number[];
  locationIds: number[];
  departmentIds: number[];
  forceUpsert?: boolean;
}
