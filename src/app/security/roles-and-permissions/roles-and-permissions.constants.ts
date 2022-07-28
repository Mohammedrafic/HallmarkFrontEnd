import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { ControlTypes, ValueType } from "@shared/enums/control-types.enum";
import { FilterColumnsModel } from "@shared/models/filter.model";
import { valuesOnly } from '@shared/utils/enum.utils';

export const BUSINESS_UNITS_VALUES = Object.values(BusinessUnitType)
  .filter(valuesOnly)
  .map((text, id) => ({ text, id: id + 1 }));

export const OPRION_FIELDS = {
  text: 'text',
  value: 'id',
};

export const DISABLED_GROUP = [BusinessUnitType.Agency, BusinessUnitType.Organization];

export const BUSSINES_DATA_FIELDS = {
  text: 'name',
  value: 'id',
};

export const rolesFilterColumns: FilterColumnsModel = {
  permissionsIds: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'name',
    valueId: 'id',
  },
};
