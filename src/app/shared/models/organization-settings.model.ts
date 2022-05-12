export class OrganizationSettingsGet {
  settingKey: string;
  name: string;
  controlType: number;
  value: any;
  valueOptions: string | null;
  organizationId: number;
  regionId: number | null;
  regionName: string | null;
  locationId: number | null;
  locationName: string | null;
  departmentId: number | null;
  departmentName: string | null;
  overridableByOrganization: boolean;
  overridableByRegion: boolean;
  overridableByLocation: boolean;
  overridableByDepartment: boolean;
  orderPosition: number;
}

export class OrganizationSettingsPost {
  hierarchyLevel: number;
  hierarchyId: number;
  settingKey: string;
  value: string;
}
