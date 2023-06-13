import { CandidatStatus } from "@shared/enums/applicant-status.enum";
import { ControlTypes, ValueType } from "@shared/enums/control-types.enum";
import { OrderTypeOptions } from "@shared/enums/order-type";
import { CandidateStatus, CandidatesStatusText, FilterOrderStatusText } from "@shared/enums/status";

export const StatusesByDefault = [
  CandidatStatus['Not Applied'],
  CandidatStatus.Applied,
  CandidatStatus.Shortlisted,
  CandidatStatus.Offered,
  CandidatStatus.Accepted,
  CandidatStatus.OnBoard,
  CandidatStatus.Withdraw,
  CandidatStatus.Offboard,
  CandidatStatus.Rejected,
  CandidatStatus.Cancelled,
];

export const ReorderDefaultStatuses = [
  FilterOrderStatusText.Open,
  FilterOrderStatusText['In Progress'],
  FilterOrderStatusText.Filled,
  FilterOrderStatusText.Closed,
];

export const ReorderCandidateStatuses = [
  CandidatesStatusText['Bill Rate Pending'],
  CandidatesStatusText['Offered Bill Rate'],
  CandidatesStatusText.Onboard,
  CandidatesStatusText.Rejected,
  CandidatStatus.Cancelled,
];

export const PerDiemDefaultStatuses = [
  FilterOrderStatusText.Filled,
  FilterOrderStatusText['In Progress'],
];

export const AllOrdersDefaultStatuses = [
  FilterOrderStatusText.Filled,
  FilterOrderStatusText['In Progress'],
  FilterOrderStatusText.Closed,
  FilterOrderStatusText.Open,
  CandidateStatus.Incomplete,
];

export const initOrderManagementFilterColumns = () => ({
  orderPublicId: { type: ControlTypes.Text, valueType: ValueType.Text },
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
  orderTypes: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: OrderTypeOptions,
    valueField: 'name',
    valueId: 'id',
  },
  jobTitle: { type: ControlTypes.Text, valueType: ValueType.Text },
  billRateFrom: { type: ControlTypes.Text, valueType: ValueType.Text },
  billRateTo: { type: ControlTypes.Text, valueType: ValueType.Text },
  openPositions: { type: ControlTypes.Text, valueType: ValueType.Text },
  jobStartDate: { type: ControlTypes.Date, valueType: ValueType.Text },
  jobEndDate: { type: ControlTypes.Date, valueType: ValueType.Text },
  orderStatuses: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'statusText',
    valueId: 'status',
  },
  reorderStatuses: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'statusText',
    valueId: 'status',
  },
  candidateStatuses: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'statusText',
    valueId: 'status',
  },
  contactEmails: {
    type: ControlTypes.Autocomplete,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'fullName',
    valueId: 'email',
  },
  candidatesCountFrom: { type: ControlTypes.Text, valueType: ValueType.Text },
  candidatesCountTo: { type: ControlTypes.Text, valueType: ValueType.Text },
  agencyIds: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'name',
    valueId: 'id',
  },
  agencyType: { type: ControlTypes.Radio, dataSource: { 1: 'Yes', 2: 'No' }, default: '0' },
  templateTitle: { type: ControlTypes.Text, valueType: ValueType.Text },
  annualSalaryRangeFrom: {
    type: ControlTypes.Text,
    valueType: ValueType.Text,
  },
  annualSalaryRangeTo: {
    type: ControlTypes.Text,
    valueType: ValueType.Text,
  },
  creationDateFrom: { type: ControlTypes.Date, valueType: ValueType.Text },
  creationDateTo: { type: ControlTypes.Date, valueType: ValueType.Text },
  distributedOnFrom: { type: ControlTypes.Date, valueType: ValueType.Text },
  distributedOnTo: { type: ControlTypes.Date, valueType: ValueType.Text },
  candidateName: { type: ControlTypes.Text, valueType: ValueType.Text },
  projectTypeIds: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'projectType',
    valueId: 'id',
  },
  projectNameIds: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'projectName',
    valueId: 'id',
  },
  poNumberIds: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'poNumber',
    valueId: 'id',
  },
  shift: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'name',
    valueId: 'id',
  },
  irpOnly: {
    type: ControlTypes.Checkbox,
    valueType: ValueType.Text,
    checkBoxTitle: 'IRP Only',
  },
});
