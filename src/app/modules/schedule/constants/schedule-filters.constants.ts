import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';

import { ScheduleFiltersConfig } from '../interface';

export const SkillsFieldsOptions = {
  text: 'skillDescription',
  value: 'id',
};

export const ScheduleFiltersColumns: ScheduleFiltersConfig = {
  regionIds: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'text',
    valueId: 'value',
    filterTitle: 'Region',
  },
  locationIds: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'text',
    valueId: 'value',
    filterTitle: 'Location',
  },
  departmentsIds: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'text',
    valueId: 'value',
    filterTitle: 'Department',
  },
  skillIds: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'text',
    valueId: 'value',
    filterTitle: 'Skill',
  },
};
