import { ControlTypes, ValueType } from "@shared/enums/control-types.enum";
import { AgencyStatus } from "@shared/enums/status";
import { FilterColumnsModel } from "@shared/models/filter.model";
import { valuesOnly } from "@shared/utils/enum.utils";

export const agencyStatusOptions = Object.values(AgencyStatus)
  .filter(valuesOnly)
  .map((text, id) => ({ text, id }));

export const agencyListFilterColumns: FilterColumnsModel = {
  searchTerm: { type: ControlTypes.Text, valueType: ValueType.Text },
  businessUnitNames: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
  statuses: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
  cities: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
  contacts: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
};

