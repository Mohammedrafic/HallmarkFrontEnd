import { PageOfCollections } from '@shared/models/page.model';
import { MasterSkillByOrganization } from './skill.model';

export class SpecialProjectMapping {
  id: number;
  businessUnitId: number;
  regionId: number;
  regionName: string;
  locationId: number;
  locationName: string;
  departmentId: number;
  departmentName: string;
  skills: MasterSkillByOrganization[];
  skillNames: string;
  orderProjectName: string;
  orderSpecialProjectCategoryId: number;
  orderSpecialProjectCategoryName: string;
  orderSpecialProjectId: number;
  prePopulateInOrders: boolean;
  includeInIRP:boolean;
  includeInVMS:boolean;
}

export type SpecialProjectMappingPage = PageOfCollections<SpecialProjectMapping>;

export class SaveSpecialProjectMappingDto {
  Id: number;
  orderProjectNameId: number;
  regionIds: number[];
  locationIds: number[];
  departmentIds: number[];
  skillIds: number[];
  forceUpsert?: boolean;
  prePopulateInOrders: boolean;
  includeInIRP:boolean;
  includeInVMS:boolean;
}

export class ProjectNames {
  id: number;
  name: string;
  projectTypeId: number
}

export class SpecialProjectMappingFilters {
  pageNumber?: number;
  pageSize?: number;
  regionIds?: number[];
  locationIds?: number[];
  departmentIds?: number[];
  skillIds?: number[];
  getAll?: boolean
}


