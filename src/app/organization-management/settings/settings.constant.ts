import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { SettingsFilterColsConfig } from './settings.interface';

export const SettingsFilterCols: SettingsFilterColsConfig = {
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
  departmentIds: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'name',
    valueId: 'id',
  },
  attributes: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Text,
    dataSource: [],
  },
}