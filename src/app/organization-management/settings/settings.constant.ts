import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { SettingsFilterColsConfig } from './settings.interface';

export const AssociatedLink: string = '/client/associate-list';
export const tierSettingsKey: string = 'TieringLogic';

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
};

export const SettingsAppliedToPermissions: string[] = [
  'AllowDocumentUpload',
  'AllowAgencyToBidOnCandidateBillRateBeyondOrderBillRate',
  'AutoLockOrder',
  'IsReOrder',
  'SSNRequiredToAcceptPosition',
  'DateOfBirthRequiredToAcceptPosition',
  'SetDefaultCommentsScopeToExternal',
  'CandidatePayRate',
];

export const DisabledSettingsByDefault = [
  'IsReOrder',
  'AllowDocumentUpload',
  'NetPaymentTerms',
  'NoOfDaysAllowedForTimesheetEdit',
  'EnableChat',
  'CandidateAppliedInLastNDays',
  'CandidatePayRate'
];
