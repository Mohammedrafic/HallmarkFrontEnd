import { ControlTypes } from '@shared/enums/control-types.enum';
import { SkillCategory } from '@shared/models/skill-category.model';
import { Skill } from '@shared/models/skill.model';
import { Column, ValueType } from '@syncfusion/ej2-angular-grids';

export interface SkillsForm {
  id: number;
  isDefault: boolean,
  masterSkillId: number;
  skillCategoryId: number;
  skillAbbr: string;
  skillDescription: string;
  glNumber: string;
  allowOnboard: boolean;
  inactiveDate: string;
}

export interface SkillsFilterItem<T> {
  type: ControlTypes;
  valueType: ValueType;
  dataSource: T[];
  valueField?: string;
  checkBoxTitle?: string;
}

export interface SkillsFilterData {
  skillCategories: SkillsFilterItem<SkillCategory>;
  skillAbbrs: SkillsFilterItem<string>;
  skillDescriptions: SkillsFilterItem<string>;
  glNumbers: SkillsFilterItem<string>;
  allowOnboard: SkillsFilterItem<unknown>;
}

export type SkillGridEventData = Skill & {
  foreignKey: string;
  foreignKeyData: string;
  index: string;
  column: Column;
 }
