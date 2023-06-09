import { SkillCategory } from './skill-category.model';

export class Skill {
  id: number;
  organizationId?: number;
  masterSkillId?: number;
  masterSkill?: Skill;
  skillCategoryId: number;
  categoryId?: number;
  skillAbbr: string;
  skillDescription: string;
  skillCategory?: SkillCategory;
  glNumber?: string | null;
  allowOnboard?: boolean;
  inactiveDate?: string | null;
  includeInIRP?: boolean;
  includeInVMS?: boolean;
  isDefault?: boolean;
  foreignKey?: string;
  skillCode?: string;
  name?: string;
  assignedToVMS?: boolean;
  assignedToIRP?: boolean;

  constructor(skill: Skill, assigned = false) {
    this.id = skill.id || 0;
    this.skillCategoryId = skill.skillCategoryId;
    this.skillAbbr = skill.skillAbbr;
    this.skillDescription = skill.skillDescription;
    this.isDefault = skill.isDefault;
    this.includeInIRP = skill.includeInIRP || false;
    this.includeInVMS = skill.includeInVMS || false;
    this.skillCode = skill.skillCode;

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
  includeInIRP?: boolean;
  includeInVMS?: boolean;
  skillCode?: string[];
}

export class MasterSkillFilters {
  searchTerm?: string;
  skillCategoryIds?: number[];
  skillAbbreviations?: string[];
  skillDescriptions?: string[];
  orderBy?: string;
  pageSize?: number;
  pageNumber?: number;
}

export class MasterSkillByOrganization {
  id: number;
  name: string;
  masterSkillId?: number;
  categoryName?: string;
  skillAbbr?: string;
  skillDescription?: string;
}

export class MasterSkillDataSources {
  skillCategories: SkillCategory[];
  skillAbbreviations: string[];
  skillDescriptions: string[];
}

export interface ListOfSkills {
  id: number;
  name: string;
  masterSkillId?: number;
}

export type AssignedSkillTreeItem = {
  id: string;
  pid: string;
  cid: number;
  name: string;
  skillDescription: string;
  isAssignable: boolean;
  hasChild: boolean;
};

export interface AssignedSkillTree {
  treeItems: AssignedSkillTreeItem[];
  assignedSkillIds: string[];
}

export interface AssignedSkillsByOrganization {
  id: number;
  masterSkillId: number;
  categoryName: string;
  skillAbbr: string;
  skillDescription: string;
  name: string;
  includeInIRP: boolean;
  includeInVMS: boolean;
}

export interface IrpPrimarySkill {
  id: number;
  businessUnitId: number;
  skillAbbr: string;
  skillDescription: string;
  isDefault: boolean;
}

export interface MasterSkill {
  id: number;
  name: string;
  description: string;
  abbr: string;
  organizationId: number;
  skillCategoryId: number;
  skillCode: string;
  skillCategoryName: string;
  includeInIRP: boolean;
  includeInVMS: boolean;
}
