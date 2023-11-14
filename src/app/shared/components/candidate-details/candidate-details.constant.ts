import { OrderType } from '@shared/enums/order-type';
import { ApplicantStatus } from '@shared/enums/applicant-status.enum';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';

export const OrderTypeOptionsForCandidates = [
  { id: OrderType.ContractToPerm, name: 'Contract To Perm' },
  { id: OrderType.PermPlacement, name: 'Perm. Placement' },
  { id: OrderType.ReOrder, name: 'Re-Order' },
  { id: OrderType.LongTermAssignment, name: 'LTA' },
];

export const ApplicantStatusOptionsForCandidates = [
  { id: ApplicantStatus.Applied, name: 'Applied' },
  { id: ApplicantStatus.Shortlisted, name: 'Shortlisted' },
  { id: ApplicantStatus.Accepted, name: 'Accepted' },
  { id: ApplicantStatus.Cancelled, name: 'Cancelled' },
  { id: ApplicantStatus.Rejected, name: 'Rejected' },
  { id: ApplicantStatus.Withdraw, name: 'Withdraw' },
  { id: ApplicantStatus.Offboard, name: 'Offboard' },
  { id: ApplicantStatus.OnBoarded, name: 'Onboard' },
];

export const FilterColumnsDefinition = {
  regionsIds: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'name',
    valueId: 'id',
  },
  candidateNames: {
    type: ControlTypes.Autocomplete,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'fullName',
    valueId: 'id',
  },
  orderId: {
    type: ControlTypes.Text,
    valueType: ValueType.Text,

  },
  agencyIds: {
    type: ControlTypes.Dropdown,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'agencyName',
    valueId: 'agencyId',
  },
  applicantStatuses: {
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
  orderTypes: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'name',
    valueId: 'id',
  },
  startDate: { type: ControlTypes.Date, valueType: ValueType.Text },
  endDate: { type: ControlTypes.Date, valueType: ValueType.Text },
  skillsIds: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'skillDescription',
    valueId: 'masterSkillId',
  },

  departmentIds: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'name',
    valueId: 'id',
  },
  organizationIds:{
    type: ControlTypes.Dropdown,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'name',
    valueId: 'id',  
  },
};
