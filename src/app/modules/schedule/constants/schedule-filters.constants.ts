import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';

import { ScheduleFiltersColumnsDataModel } from '../interface';

export const SkillsFieldsOptions = {
  text: 'skillDescription',
  value: 'id',
};

export const ScheduleFiltersColumns: ScheduleFiltersColumnsDataModel = {
  regionIds: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'name',
    valueId: 'id',
  },
  locationIds: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'name',
    valueId: 'id',
  },
  departmentsIds: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'name',
    valueId: 'id',
  },
  skillIds: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'skillDescription',
    valueId: 'id',
  },
};
