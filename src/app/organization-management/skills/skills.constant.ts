import { FieldType } from '@core/enums';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { ExportColumn } from '@shared/models/export.model';
import { SkillsSourceNames } from './skills.enum';
import { SkillsFilterData, SkillsFormConfig } from './skills.interface';

export const VmsSkillsColsExport: ExportColumn[] = [
  { text: 'Skill Category', column: 'SkillCategory_Name' },
  { text: 'Skill Code', column: 'SkillCode'},
  { text: 'Skill Description', column: 'SkillDescription' },
  { text: 'GL Number', column: 'GLNumber' },
  { text: 'Allow Onboard', column: 'AllowOnboard' },
  { text: 'Inactivate Date', column: 'InactiveDate' },
];

export const IrpSkillsColsExport: ExportColumn[] = [
  { text: 'Skill Category', column: 'SkillCategory_Name' },
  { text: 'Skill Code', column: 'SkillCode'},
  { text: 'Skill Description', column: 'SkillDescription' },
  { text: 'GL Number', column: 'GLNumber' },
  { text: 'Allow Onboard', column: 'AllowOnboard' },
  { text: 'Inactivate Date', column: 'InactiveDate' },
  { text: 'System', column: 'System'},
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
  includeInIRP: {
    type: ControlTypes.Checkbox,
    valueType: ValueType.Text,
    checkBoxTitle: 'IRP',
    dataSource: [null],
  },
  includeInVMS: {
    type: ControlTypes.Checkbox,
    valueType: ValueType.Text,
    checkBoxTitle: 'VMS',
    dataSource: [null],
  },
  skillCode: {
    type: ControlTypes.Text,
    valueType: ValueType.Text,
    dataSource: [],
  },
};

export const VmsSkillsDialogConfig: SkillsFormConfig[] = [
  {
    field: 'skillCategoryId',
    title: 'Skill Category',
    fieldType: FieldType.Dropdown,
    sourceKey: SkillsSourceNames.Category,
    required: true,
  },
  {
    field: 'skillCode',
    title: 'Skill Code',
    fieldType: FieldType.Input,
    maxLen: 200,
    required: false,
  },
  {
    field: 'skillDescription',
    title: 'Skill Description',
    fieldType: FieldType.Input,
    maxLen: 100,
    required: true,
  },
  {
    field: 'glNumber',
    title: 'GL Number',
    fieldType: FieldType.Input,
    maxLen: 100,
    required: false,
  },
  {
    field: 'inactiveDate',
    title: 'Inactive Date',
    fieldType: FieldType.Date,
    required: false,
  },
  {
    field: 'allowOnboard',
    title: 'Allow Onboard',
    fieldType: FieldType.CheckBox,
    required: false,
  },
];

export const IrpSkillsDialogConfig: SkillsFormConfig[] = [
  {
    field: '',
    title: 'System Configuration',
    fieldType: FieldType.CheckBoxGroup,
    required: true,
    checkBoxes: [
      {
        field: 'includeInIRP',
        title: 'IRP',
      },
      {
        field: 'includeInVMS',
        title: 'VMS',
      },
    ],
  },
  {
    field: 'skillCategoryId',
    title: 'Skill Category',
    fieldType: FieldType.Dropdown,
    sourceKey: SkillsSourceNames.Category,
    required: true,
  },
  {
    field: 'skillCode',
    title: 'Skill Code',
    fieldType: FieldType.Input,
    maxLen: 200,
    required: false,
  },
  {
    field: 'skillDescription',
    title: 'Skill Description',
    fieldType: FieldType.Input,
    maxLen: 100,
    required: true,
  },
  {
    field: 'glNumber',
    title: 'GL Number',
    fieldType: FieldType.Input,
    maxLen: 100,
    required: false,
  },
  {
    field: 'inactiveDate',
    title: 'Inactive Date',
    fieldType: FieldType.Date,
    required: false,
  },
  {
    field: 'allowOnboard',
    title: 'Allow Onboard',
    fieldType: FieldType.CheckBox,
    required: false,
  },
];
