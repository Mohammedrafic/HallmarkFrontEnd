import { PageOfCollections } from '@shared/models/page.model';

export class SpecialProjectCategory {
  id: number;
  organizationId: number;
  specialProjectCategory: string;
  isDeleted: boolean;
}

export type SpecialProjectCategoryPage = PageOfCollections<SpecialProjectCategory>;
