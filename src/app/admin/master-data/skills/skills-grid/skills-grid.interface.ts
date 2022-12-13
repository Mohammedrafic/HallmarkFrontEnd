import { ValueType } from '@syncfusion/ej2-angular-grids';

import { ControlTypes } from '@shared/enums/control-types.enum';
import { SkillCategory } from '@shared/models/skill-category.model';


export interface SkillsFilterConfigItem<T> {
  type: ControlTypes;
  valueType: ValueType;
  valueField?: string;
  valueId?: string;
  dataSource?: T,
}

export interface FilterConfig {
  searchTerm: SkillsFilterConfigItem<string>;
  skillCategoryIds: SkillsFilterConfigItem<SkillCategory[]>;
  skillAbbreviations: SkillsFilterConfigItem<string[]>;
  skillDescriptions: SkillsFilterConfigItem<string[]>;
}


export interface MasterSkillsForm {
  id: number;
  isDefault: boolean;
  skillCategoryId: string;
  skillAbbr: string;
  skillDescription: string;
}

export interface MasterSkillsFilterForm {
  searchTerm: string;
  skillCategoryIds: string[];
  skillAbbreviations: string[];
  skillDescriptions: string[];
}
