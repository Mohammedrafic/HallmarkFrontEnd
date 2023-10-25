import { ControlTypes, ValueType } from "@shared/enums/control-types.enum";
import { AgencyStatus, AgencyStatuses } from "@shared/enums/status";
import { FilterColumnsModel } from "@shared/models/filter.model";
import { valuesOnly } from "@shared/utils/enum.utils";
import { AgencyStatusesModel } from "@shared/models/agency.model";
import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';

const addAgencyStatuses = ['InProgress', 'Active'];
const agencyStatusList = [
  {
    text: 'Active',
    id: AgencyStatus.Active
  },
  {
    text: 'Inactive',
    id: AgencyStatus.Inactive
  },
  {
    text: 'InProgress',
    id: AgencyStatus.InProgress
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

export const agencyStatusOptions: AgencyStatusesModel[] = AgencyStatuses
export const agencyListFilterColumns: FilterColumnsModel = {
  searchTerm: { type: ControlTypes.Text, valueType: ValueType.Text },
  businessUnitNames: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
  statuses: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
  cities: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
  contacts: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
};

export const MSPMenuOptions = (
  isMSP: boolean
): Record<string, ItemModel[]> => ({
  mSPMenuOption: [
    { text: MSPMenuType[0], id: '0' },
    { text: MSPMenuType[1], id: '1', disabled: isMSP },
    { text: MSPMenuType[2], id: '2', disabled: true },//re add after implementation - disabled: !isMSP
    { text: MSPMenuType[3], id: '3', disabled: true },// remove - disabled: true  after implementations.
  ]
});

export enum MSPMenuType {
  'Edit',
  'Convert to MSP',
  'Unlink from MSP',
  'History'
}

