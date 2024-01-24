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

export const AllCandidateStatuses = [
  CandidatesStatusText['Bill Rate Pending'],
  CandidatesStatusText['Offered Bill Rate'],
];

export const filterClearedToStartList: { text: string; value: any }[] = [
  { text: 'Cleared to Start - Yes', value: 'yes' },
  { text: 'Cleared to Start - No', value: 'no' }
];

export const filterOrderLockList: { text: string; value: any }[] = [
  { text: 'All', value: 'all' },
  { text: 'Locked', value: 'true' },
  { text: 'Unlocked', value: 'false' }
];
export const filterOrderDistributionList: { text: string; value: any }[] = [
  { text: 'All', value: 0 },
  { text: 'VMS and IRP', value: 1 },
  { text: 'VMS only', value: 2 }
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
  reOrderDate: { type: ControlTypes.Date, valueType: ValueType.Text },
  candidateStatuses: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'filterStatus',
    valueId: 'filterStatus',
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
  firstNamePattern: { type: ControlTypes.Text, valueType: ValueType.Text },
  lastNamePattern: { type: ControlTypes.Text, valueType: ValueType.Text },
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
  shiftIds: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'name',
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
  showDeletedOrders: {
    type: ControlTypes.Checkbox,
    valueType: ValueType.Text,
    checkBoxTitle: 'Show Deleted Orders',
  },
  orderLocked: {
    type: ControlTypes.Dropdown,
    valueType: ValueType.Id,
    dataSource: filterOrderLockList,
    valueField: 'name',
    valueId: 'id',
  },
  clearedToStart: {
    type: ControlTypes.Dropdown,
    valueType: ValueType.Id,
    dataSource: filterClearedToStartList,
    valueField: 'name',
    valueId: 'id',
  },
  orderDistributionType: {
    type: ControlTypes.Dropdown,
    valueType: ValueType.Id,
    dataSource: filterOrderDistributionList,
    valueField: 'name',
    valueId: 'id',
  },
});
