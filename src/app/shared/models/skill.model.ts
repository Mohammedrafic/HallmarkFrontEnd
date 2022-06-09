import { SkillCategory } from "./skill-category.model";

export class Skill {
  id: number;
  organizationId?: number;
  masterSkillId?: number;
  masterSkill?: Skill;
  skillCategoryId: number;
  skillAbbr: string;
  skillDescription: string;
  skillCategory?: SkillCategory;
  glNumber?: string | null;
  allowOnboard?: boolean;
  inactiveDate?: string | null;
  isDefault?: boolean;
  foreignKey?: string;

  constructor(skill: Skill, assigned: boolean = false) {
    this.id = skill.id || 0;
    this.skillCategoryId = skill.skillCategoryId;
    this.skillAbbr = skill.skillAbbr;
    this.skillDescription = skill.skillDescription;
    this.isDefault = skill.isDefault;

    if (assigned) {
      this.inactiveDate = skill.inactiveDate || null;
      this.allowOnboard = skill.allowOnboard || false;
      this.glNumber = skill.glNumber || null;
      this.masterSkillId = skill.masterSkillId;
    }
  }
}

export class SkillsPage {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  items: Skill[];
  pageNumber: number;
  totalCount: number;
  totalPages: number;
}

export class SkillDataSource {
  skillABBRs: string[];
  skillDescriptions: string[];
  glNumbers: string[];
}

export class SkillFilters {
  skillCategories?: string[];
  skillDescriptions?: string[];
  skillAbbrs?: string[];
  glNumbers?: any[];
  allowOnboard?: boolean | null;
  pageNumber?: number;
  pageSize?: number;
  orderBy?: string;
}

export class MasterSkillByOrganization {
  id: number;
  name: string;
}
