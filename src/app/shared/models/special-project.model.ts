import { PageOfCollections } from '@shared/models/page.model';

export class SpecialProject {
  id: number;
  category?: string;
  name?: string;
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

export type SpecialProjectPage = PageOfCollections<SpecialProject>;
