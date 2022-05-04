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
  glNumber?: string;
  allowOnboard?: boolean;
  inactiveDate?: string | null;

  constructor(skill: Skill, organizationId?: number) {
    this.id = skill.id;
    this.skillCategoryId = skill.skillCategoryId;
    this.skillAbbr = skill.skillAbbr;
    this.skillDescription = skill.skillDescription;

    if (organizationId) {
      this.organizationId = organizationId;
      this.inactiveDate = skill.inactiveDate || null;
      this.allowOnboard = skill.allowOnboard || false;
      this.glNumber = skill.glNumber;
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
  