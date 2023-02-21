import { OrientationType } from "../enums/orientation-type.enum";

export class OrientationSetting {
  id?: number;
  organizationId?: number;
  isEnabled: boolean;
  type: OrientationType;
}

export class OrientationConfigurationSkill {
  id: number;
  orientationConfigurationId: number;
  skillId: number;
  skillName: string;
}

export class OrientationConfiguration {
  id: number;
  orientationSettingId: number;
  regionId: number;
  regionName: string;
  locationId: number;
  locationName: string;
  departmentId: number;
  departmentName: string;
  completetedOrientation: number; // TODO: typo
  removeOrientation: number;
  startDate: Date;
  endDate: Date;
  skillCategories: string[];
  orientationConfigurationSkills: OrientationConfigurationSkill[];
}

export class OrientationConfigurationDTO {
  orientationConfigurationId: number;
  regionIds: number[];
  locationIds: number[];
  departmentIds: number[];
  skillIds: number[];
  completetedOrientation: number;
  removeOrientation: number;
  startDate: Date;
  endDate: Date;
}

export class OrientationConfigurationFilters {
  orderBy: string;
  pageNumber: number;
  pageSize: number;
  regionIds: number[];
  locationIds: number[];
  departmentsIds: number[];
  skillCategoryIds: number[];
  skillIds: number[];
}