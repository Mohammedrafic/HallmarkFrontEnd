export class SkillCategory {
  id: number;
  name: string;

  constructor(category: SkillCategory) {
    this.id = category.id;
    this.name = category.name;
  }
}

export class SkillCategoriesPage {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  items: SkillCategory[];
  pageNumber: number;
  totalCount: number;
  totalPages: number;
}
