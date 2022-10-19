import { ControlTypes, ValueType } from "@shared/enums/control-types.enum";
import { AgencyStatus } from "@shared/enums/status";
import { FilterColumnsModel } from "@shared/models/filter.model";
import { valuesOnly } from "@shared/utils/enum.utils";
import { AgencyStatusesModel } from "@shared/models/agency.model";

const addAgencyStatuses = ['InProgress', 'Active'];
const agencyStatusList = [
  {
    text: 'InProgress',
    id: AgencyStatus.InProgress
  },
  {
    text: 'Inactive',
    id: AgencyStatus.Inactive
  },
  {
    text: 'Active',
    id: AgencyStatus.Active
  },
  {
    text: 'Suspended',
    id: AgencyStatus.Suspended
  },
  {
    text: 'Terminated',
    id: AgencyStatus.Terminated
  },
];

export const agencyStatusMapper = {
  [`${AgencyStatus.InProgress}`] : 'In Progress',
  [`${AgencyStatus.Inactive}`]: 'Inactive',
  [`${AgencyStatus.Active}`]: 'Active',
  [`${AgencyStatus.Suspended}`]: 'Suspended',
  [`${AgencyStatus.Terminated}`]: 'Terminated'
}

export const agencyStatusCreationOptions: AgencyStatusesModel[] = agencyStatusList.
  filter(({text}) => { return addAgencyStatuses.includes(text)}).
  map(({ text, id }) => {
    if (text === 'InProgress') {
      return ({ text: 'In Progress', id });
    }
    return ({ text, id });
  });

export const agencyStatusOptions: AgencyStatusesModel[] = Object.values(AgencyStatus)
  .filter(valuesOnly)
  .map((text, id) => {
    if (text === 'InProgress') {
      return ({ text: 'In Progress', id });
    }
    return ({ text, id });
  });

export const agencyListFilterColumns: FilterColumnsModel = {
  searchTerm: { type: ControlTypes.Text, valueType: ValueType.Text },
  businessUnitNames: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
  statuses: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
  cities: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
  contacts: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
};

