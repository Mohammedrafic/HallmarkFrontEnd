import { ProfileStatuses } from '@client/candidates/candidate-profile/candidate-profile.constants';
import { ControlTypes, ValueType } from '../../../../enums/control-types.enum';
import { CandidateStatusOptions } from '../../../../enums/status';
import { CandidateListFiltersColumn } from '../../types/candidate-list.model';

export const filterColumns: CandidateListFiltersColumn = {
  regionsNames: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'name',
    valueId: 'name',
  },
  skillsIds: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'name',
    valueId: 'id',
  },
  profileStatuses: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: CandidateStatusOptions,
    valueField: 'name',
    valueId: 'id',
  },
  candidateName: { type: ControlTypes.Text, valueType: ValueType.Text },
};

export const IRPFilterColumns: CandidateListFiltersColumn = {
  profileStatuses: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: ProfileStatuses,
    valueField: 'name',
    valueId: 'id',
  },
  candidateName: { type: ControlTypes.Text, valueType: ValueType.Text },
  candidateId: { type: ControlTypes.Text, valueType: ValueType.Text },
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
  primarySkillIds: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'name',
    valueId: 'id',
  },
  secondarySkillIds: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'name',
    valueId: 'id',
  },
  hireDate: { type: ControlTypes.Date, valueType: ValueType.Text },
};

export const VMSCandidates = [
  {
    fieldName: 'actions',
    visible: false,
  },
  {
    fieldName: 'employeeId',
    visible: false,
  },
  {
    fieldName: 'lastName',
    visible: true,
  },
  {
    fieldName: 'profileStatus',
    visible: true,
  },
  {
    fieldName: 'primarySkillName',
    visible: false,
  },
  {
    fieldName: 'locationName',
    visible: false,
  },
  {
    fieldName: 'departmentName',
    visible: false,
  },
  {
    fieldName: 'candidateProfileSkills',
    visible: true,
  },
  {
    fieldName: 'lastAssignmentEndDate',
    visible: true,
  },
  {
    fieldName: 'candidateStatus',
    visible: true,
  },
  {
    fieldName: 'candidateProfileRegions',
    visible: true,
  },
  {
    fieldName: 'hireDate',
    visible: false,
  },
  {
    fieldName: 'orgOrientation',
    visible: false,
  },
];

export const IRPCandidates = [
  {
    fieldName: 'actions',
    visible: true,
  },
  {
    fieldName: 'employeeId',
    visible: true,
  },
  {
    fieldName: 'lastName',
    visible: true,
  },
  {
    fieldName: 'profileStatus',
    visible: true,
  },
  {
    fieldName: 'primarySkillName',
    visible: true,
  },
  {
    fieldName: 'locationName',
    visible: true,
  },
  {
    fieldName: 'departmentName',
    visible: true,
  },
  {
    fieldName: 'candidateProfileSkills',
    visible: true,
  },
  {
    fieldName: 'lastAssignmentEndDate',
    visible: false,
  },
  {
    fieldName: 'candidateStatus',
    visible: false,
  },
  {
    fieldName: 'candidateProfileRegions',
    visible: false,
  },
  {
    fieldName: 'hireDate',
    visible: true,
  },
  {
    fieldName: 'orgOrientation',
    visible: true,
  },
];
