import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { FilterConfig, MasterSkillExportColumn } from './skills-grid.interface';

export const SkillsFilterConfig: FilterConfig = {
  searchTerm: { type: ControlTypes.Text, valueType: ValueType.Text },
  skillCategoryIds: { type: ControlTypes.Multiselect,
    valueType: ValueType.Id, dataSource: [], valueField: 'name', valueId: 'id' },
  skillAbbreviations: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
  skillDescriptions: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
};

export const MasterSkillExportCols: MasterSkillExportColumn[] = [
  { text:'Skill Category', column: 'SkillCategoryName'},
  { text:'Skill Description', column: 'SkillDescription'},
];

export const AbbrExportColumn: MasterSkillExportColumn = { text:'Skill ABBR', column: 'SkillAbbr'};
