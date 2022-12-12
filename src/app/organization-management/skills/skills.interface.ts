import { Column, ValueType } from '@syncfusion/ej2-angular-grids';

import { FieldType, InputAttrType } from '@core/enums';
import { ControlTypes } from '@shared/enums/control-types.enum';
import { SkillCategory } from '@shared/models/skill-category.model';
import { Skill } from '@shared/models/skill.model';
import { SkillsSourceNames } from './skills.enum';
import { DropdownOption } from '@core/interface';

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

 export interface SkillCheckBoxGroup {
  field: string;
  title: string;
 }

 export interface SkillsFormConfig {
  field: string;
  title: string;
  fieldType: FieldType;
  sourceKey?: SkillsSourceNames;
  required: boolean;
  maxLen?: number;
  pattern?: string;
  inputType?: InputAttrType;
  checkBoxes?: SkillCheckBoxGroup[];
}

export interface SkillSources {
  [SkillsSourceNames.Category]: DropdownOption[];
}
