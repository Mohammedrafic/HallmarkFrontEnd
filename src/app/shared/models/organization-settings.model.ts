export class OrganizationSettingsGet {
  settingKey: string;
  name: string;
  controlType: number;
  value: any;
  valueOptions: OrganizationSettingValueOptions[];
  organizationId: number;
  overridableByOrganization: boolean;
  overridableByRegion: boolean;
  overridableByLocation: boolean;
  overridableByDepartment: boolean;
  orderPosition: number;
  validations: OrganizationSettingValidation[];
  children?: OrganizationSettingChild[];
}

export class OrganizationSettingChild {
  settingKey: string;
  value: any;
  organizationId: number;
  regionId?: number;
  regionName?: string;
  locationId?: number;
  locationName?: string;
  departmentId?: number;
  departmentName?: string;
}

export class OrganizationSettingsPost {
  hierarchyLevel: number;
  hierarchyId: number;
  settingKey: string;
  value: string;
}

export class OrganizationSettingsDropDownOption {
  value: string;
  text: string;
}

export class OrganizationSettingValidation {
  key: number;
  value: string | null;
}

export class OrganizationSettingValueOptions {
  key: string;
  value: string;
}
