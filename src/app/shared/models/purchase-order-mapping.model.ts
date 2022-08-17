import { PageOfCollections } from '@shared/models/page.model';
import { MasterSkillByOrganization } from './skill.model';

export class PurchaseOrderMapping {
  id: number;
  businessUnitId: number;
  regionId: number;
  regionName: string;
  locationId: number;
  locationName: string;
  departmentId: number;
  departmentName: string;
  skills: MasterSkillByOrganization[];
  skillName: string;
  orderPoNumberId: number;
  orderPoNumber: string;
  orderPoName:string
}

export type PurchaseOrderMappingPage = PageOfCollections<PurchaseOrderMapping>;

export class SavePurchaseOrderMappingDto {
  Id: number;
  OrderPoNumberId: number;
  regionIds: number[];
  locationIds: number[];
  departmentIds: number[];
  skillIds: number[];
  forceUpsert?: boolean;
}

export class PurchaseOrderNames {
  id: number;
  name: string;
}

export class PurchaseOrderMappingFilters {
  pageNumber?: number;
  pageSize?: number;
  regionIds?: number[];
  locationIds?: number[];
  departmentIds?: number[];
  skillIds?: number[];
  getAll?: boolean;
}


