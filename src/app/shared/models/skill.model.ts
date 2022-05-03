import { SkillCategory } from "./skill-category.model";

export class Skill {
  id: number;
  skillCategoryId: number;
  skillAbbr: string;
  skillDescription: string;
  skillCategory?: SkillCategory;

  constructor(skill: Skill) {
    this.id = skill.id;
    this.skillCategoryId = skill.skillCategoryId;
    this.skillAbbr = skill.skillAbbr;
    this.skillDescription = skill.skillDescription;
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
  