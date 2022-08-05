import { PageOfCollections } from '@shared/models/page.model';

export class PurchaseOrder {
  id: number;
  poName?: string;
  poDescription?: string;
  regionId: number;
  regionName: string;
  locationId: number;
  locationName: string;
  departmentId: number;
  departmentName: string;
  skillId: number;
  skillName: string;
  budget?: number;
  startDate?: Date;
  endDate?: Date;
}

export type PurchaseOrderPage = PageOfCollections<PurchaseOrder>;
