import { ProfileStatuses } from '@client/candidates/candidate-profile/candidate-profile.constants';
import { ExportColumn } from '@shared/models/export.model';
import { ControlTypes, ValueType } from '../../../../enums/control-types.enum';
import { CandidateStatusOptions } from '../../../../enums/status';
import { CandidateListFilters, CandidateListFiltersColumn } from '../../types/candidate-list.model';

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
  credType : {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [
      {id : 3, name : "Licenses"},
      {id : 1, name : "Certifications"},
      {id : 2, name : "Checklists"}
    ],
    valueField: 'name',
    valueId: 'id',
  }
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
  credType: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [
      {id : 3, name : "Licenses"},
      {id : 1, name : "Certifications"},
      {id : 2, name : "Checklists"}
    ],
    valueField: 'name',
    valueId: 'id',
  },
  hireDate: { type: ControlTypes.Date, valueType: ValueType.Text },
  startDate: { type: ControlTypes.Date, valueType: ValueType.Text },
  endDate: { type: ControlTypes.Date, valueType: ValueType.Text },
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
    fieldName: 'startDate',
    visible: false,
  },
  {
    fieldName: 'endDate',
    visible: false,
  },
  {
    fieldName: 'credType',
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
    fieldName: 'startDate',
    visible: false,
  },
  {
    fieldName: 'endDate',
    visible: false,
  },
  {
    fieldName: 'credType',
    visible: false,
  },
  {
    fieldName: 'orgOrientation',
    visible: true,
  },
];

export const CandidatesTableFilters: CandidateListFilters = {
  candidateName: null,
  profileStatuses: [],
  regionsNames: [],
  skillsIds: [],
  tab: 0,
  expiry : {
    endDate : undefined,
    startDate : undefined,
    type : [],
  },
  endDate : null,
  startDate : null,
  credType : [],
};


export const CandidatesExportCols: ExportColumn[] = [
  { text: 'Name', column: 'Name' },
  { text: 'Profile Status', column: 'ProfileStatus' },
  { text: 'Candidate Status', column: 'CandidateStatus' },
  { text: 'Skills', column: 'Skill' },
  { text: 'Current Assignment End Date', column: 'CurrentAssignmentEndDate' },
  { text: 'Region', column: 'Region' },
];

export const IrpCandidateExportCols: ExportColumn[] = [
  { text: 'Emp Id', column: 'EmpId' },
  { text: 'Emp Name', column: 'EmpName' },
  { text: 'Profile Status', column: 'ProfileStatus' },
  { text: 'Primary Skill', column: 'PrimarySkill' },
  { text: 'Secondary Skill', column: 'SecondarySkill' },
  { text: 'Location', column: 'Location' },
  { text: 'Department', column: 'Department' },
  { text: 'Work Commitment', column: 'WorkCommitment' },
  { text: 'Hire Date', column: 'HireDate' },
];
