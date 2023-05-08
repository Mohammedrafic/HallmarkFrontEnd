import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { SystemType } from '@shared/enums/system-type.enum';
import { ButtonModel } from '@shared/models/buttons-group.model';
import { SettingsFilterColsConfig } from './settings.interface';

export const AssociatedLink: string = '/client/associate-list';
export const tierSettingsKey: string = 'TieringLogic';
export const billingSettingsKey: string = 'BillingContactEmails';
export const invoiceGeneratingSettingsKey: string = 'InvoiceAutoGeneration';

export const SettingsSystemFilterCols = {
  includeInIRP: {
    type: ControlTypes.Checkbox,
    valueType: ValueType.Text,
    checkBoxTitle: 'IRP',
    dataSource: [],
  },
  includeInVMS: {
    type: ControlTypes.Checkbox,
    valueType: ValueType.Text,
    checkBoxTitle: 'VMS',
    dataSource: [],
  },
};

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
  'MandateCandidateAddress',
  'MandateCandidatePhone1',
  'CreateReplacementPerDiemOrder',
  'OTHours',
];

export const DisabledSettingsByDefault = [
  'IsReOrder',
  'AllowDocumentUpload',
  'NetPaymentTerms',
  'NoOfDaysAllowedForTimesheetEdit',
  'EnableChat',
  'CandidateAppliedInLastNDays',
  'CandidatePayRate',
  'MandateCandidateAddress',
  'MandateCandidatePhone1',
  'CreateReplacementPerDiemOrder',
];

export const GetSettingSystemButtons = (isIRP: boolean): ButtonModel[] => {
  return [
    {
      id: SystemType.IRP,
      title: SystemType[SystemType.IRP],
      active: isIRP,
    },
    {
      id: SystemType.VMS,
      title: SystemType[SystemType.VMS],
      active: !isIRP,
    },
  ];
};
