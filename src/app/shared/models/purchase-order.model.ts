import { PageOfCollections } from '@shared/models/page.model';

export class PurchaseOrder {
  id: number;
  organizationId: number;
  poName?: string;
  poNumber?: string;
  // regionId: number;
  // regionName: string;
  // locationId: number;
  // locationName: string;
  // departmentId: number;
  // departmentName: string;
  // skillId: number;
  projectBudget: number;
  startDate?: Date;
  endDate?: Date;
  isDeleted: boolean;
}

export type PurchaseOrderPage = PageOfCollections<PurchaseOrder>;
