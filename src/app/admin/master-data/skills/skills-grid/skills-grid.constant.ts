import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { FilterConfig } from './skills-grid.interface';

export const SkillsFilterConfig: FilterConfig = {
  searchTerm: { type: ControlTypes.Text, valueType: ValueType.Text },
  skillCategoryIds: { type: ControlTypes.Multiselect,
    valueType: ValueType.Id, dataSource: [], valueField: 'name', valueId: 'id' },
  skillAbbreviations: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
  skillDescriptions: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
};
