import { PageOfCollections } from '@shared/models/page.model';

export class PurchaseOrder {
  id: number;
  organizationId: number;
  poName?: string;
  poNumber?: string;
  projectBudget: number;
  startDate?: Date;
  endDate?: Date;
  isDeleted: boolean;
}

export type PurchaseOrderPage = PageOfCollections<PurchaseOrder>;


