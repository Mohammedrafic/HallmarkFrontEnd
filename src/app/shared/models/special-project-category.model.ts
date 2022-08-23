import { PageOfCollections } from '@shared/models/page.model';

export class SpecialProjectCategory {
  id: number;
  organizationId: number;
  specialProjectCategory: string;
 }

export type SpecialProjectCategoryPage = PageOfCollections<SpecialProjectCategory>;
