export class OrganizationSettingsGet {
  settingKey: string;
  settingValueId?: number;
  name: string;
  controlType: number;
  value: any;
  valueOptions: OrganizationSettingValueOptions[];
  overridableByOrganization: boolean;
  overridableByRegion: boolean;
  overridableByLocation: boolean;
  overridableByDepartment: boolean;
  orderPosition: number;
  validations: OrganizationSettingValidation[];
  children?: OrganizationSettingChild[];
  irpValue: string;
  includeInIRP: boolean;
  includeInVMS: boolean;
  separateValuesInSystems: boolean;
  systemType?: string | null;
  displayValue: string;
  parsedValue?: any;
}

export class OrganizationSettingChild {
  settingValueId?: number;
  settingKey: string;
  value: any;
  regionId?: number;
  regionName?: string;
  locationId?: number;
  locationName?: string;
  departmentId?: number;
  departmentName?: string;
  isIRPConfigurationValue: boolean;
  systemType?: string | null;
  displayValue: string;
  parsedValue?: any;
}

export class OrganizationSettingsPost {
  settingValueId?: number;
  hierarchyLevel: number;
  hierarchyId: number;
  settingKey: string;
  value: string;
  locationId?: number[];
  regionId?: number[];
  isIRPConfigurationValue: boolean;
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

export class OrganizationSettingFilter {
  regionIds?: number[];
  locationIds?: number[];
  departmentIds?: number[];
  attributes?: string[];
  includeInIRP?: boolean;
  includeInVMS?: boolean;
}
