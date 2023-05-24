import { PageOfCollections } from '@shared/models/page.model';

export class SpecialProject {
  id: number;
  name: string;
  organizationId: number;
  projectTypeId?: number;
  projectBudget: number;
  startDate: Date;
  endDate: Date;
  isDeleted: boolean;
  includeInIRP:boolean;
  includeInVMS:boolean;
}

export type SpecialProjectPage = PageOfCollections<SpecialProject>;

