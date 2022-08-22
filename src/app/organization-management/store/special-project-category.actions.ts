import { SpecialProjectCategory } from "src/app/shared/models/special-project-category.model";

export class GetSpecialProjectCategories {
  static readonly type = '[SpecialProjectCategory] Get Special Project Categories';
  constructor() { }
}

export class SaveSpecialProjectCategory {
  static readonly type = '[SpecialProjectCategory] Save Special Project Category';
  constructor(public specialProjectCategory: SpecialProjectCategory) { }
}

export class SaveSpecialProjectCategorySucceeded {
  static readonly type = '[SpecialProjectCategory] Save Special Project Category Succeeded';
  constructor() { }
}

export class SetIsDirtySpecialProjectCategoryForm {
  static readonly type = '[SpecialProjectCategory] Set Is Dirty Special Project Category Form';
  constructor(public isDirtySpecialProjectForm: boolean) { }
}

export class DeletSpecialProjectCategory {
  static readonly type = '[SpecialProjectCategory] Delete Special Project Category';
  constructor(public id: number) { }
}

export class DeletSpecialProjectCategorySucceeded {
  static readonly type = '[SpecialProjectCategory] Delete Special Project Category Succeeded';
  constructor() { }
}

export class GetSpecialProjectCategoryById {
  static readonly type = '[SpecialProjectCategory] Get Special Project Category by Id';
  constructor(public id: number) { }
}

