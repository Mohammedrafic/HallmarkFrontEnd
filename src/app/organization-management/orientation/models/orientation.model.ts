import { ICellRendererParams } from "@ag-grid-community/core";
import { PageOfCollections } from "@shared/models/page.model";
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
  regions: { id: number, name: string }[];
  locations: { id: number, name: string }[];
  departments: { departmentId: number, departmentName: string }[];
  completedOrientation: number;
  removeOrientation: number;
  startDate: Date;
  endDate: Date;
  skillCategories: { id: number, name: string }[];
  orientationConfigurationSkills: OrientationConfigurationSkill[];
}

export class OrientationConfigurationDTO {
  orientationConfigurationId?: number;
  regionIds: number[];
  locationIds: number[];
  departmentIds: number[];
  skillIds: number[];
  completedOrientation: number;
  removeOrientation: number;
  startDate: Date;
  endDate: Date;
}

export class HistoricalOrientationConfigurationDTO {
  ids: number[];
  endDate: Date;
}

export class OrientationConfigurationFilters {
  orderBy?: string;
  pageNumber: number;
  pageSize: number;
  regionIds?: number[];
  locationIds?: number[];
  departmentsIds?: number[];
  skillCategoryIds?: number[];
  skillIds?: number[];
}

export type OrientationConfigurationPage = PageOfCollections<OrientationConfiguration>;

export interface OrientationGridColumns extends ICellRendererParams {
  edit?: (commitment: OrientationConfiguration) => OrientationConfiguration;
  delete?: (commitment: OrientationConfiguration) => OrientationConfiguration;
  gridActionsParams: { disableControls: boolean };
}