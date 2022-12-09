import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { ExportColumn } from '@shared/models/export.model';
import { SkillsFilterData } from './skills.interface';

export const VmsSkillsColsExport: ExportColumn[] = [
  { text:'Skill Category', column: 'SkillCategory_Name' },
  { text:'Skill ABBR', column: 'SkillAbbr' },
  { text:'Skill Description', column: 'SkillDescription' },
  { text:'GL Number', column: 'GLNumber' },
  { text:'Allow Onboard', column: 'AllowOnboard' },
  { text:'Inactivate Date', column: 'InactiveDate' },
];

export const InactivateColFormat = {
  type:'date', format: 'MM/dd/yyyy',
};


export const SkillsFilterConfig: SkillsFilterData = {
  skillCategories: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Text,
    dataSource: [],
    valueField: 'name',
  },
  skillAbbrs: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Text,
    dataSource: [],
  },
  skillDescriptions: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Text,
    dataSource: [],
  },
  glNumbers: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Text,
    dataSource: [],
  },
  allowOnboard: {
    type: ControlTypes.Checkbox,
    valueType: ValueType.Text,
    checkBoxTitle: 'Allow Onboard',
    dataSource: [null],
  },
};