import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { SystemType } from '@shared/enums/system-type.enum';
import { ButtonModel } from '@shared/models/buttons-group.model';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { SettingsFilterColsConfig } from '../../shared/models/settings.interface';
import { OrganizationSettingKeys } from '@shared/constants';

export const AssociatedLink = '/client/associate-list';
export const TierSettingsKey = 'TieringLogic';
export const BillingSettingsKey = 'BillingContactEmails';
export const InvoiceGeneratingSettingsKey = 'InvoiceAutoGeneration';
export const DepartmentSkillRequired = OrganizationSettingKeys[OrganizationSettingKeys.DepartmentSkillRequired];

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
  'PayPeriod',
  'OnHoldDefault',
  'DepartmentSkillRequired',
  'CreatePartialOrder',
  'CreateUserWhenEmployeeCreated',
  'CreateEmployeeWhenUserCreated',
  'OvertimeCalculation',
  'AutomatedDistributionToVMS',
  'Sourcing'
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
  'PayPeriod',
  'OnHoldDefault',
  'LockIRPCandidateAvailability',
  'DepartmentSkillRequired',
  'SetDefaultCommentsScopeToExternal',
  'CreateUserWhenEmployeeCreated',
  'CreateEmployeeWhenUserCreated',
  'OvertimeCalculation',
  'Sourcing'
];

export const GetSettingSystemButtons = (isIRP: boolean, showOnlyActive: boolean): ButtonModel[] => {
  const buttons = [
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

  if (showOnlyActive) {
    return buttons.filter((item) => item.active);
  }

  return buttons;
};

export const DropdownCheckboxValueDataSource = [
  {
    key: 'Apply',
    value: 'Apply',
  },
  {
    key: 'Accept',
    value: 'Accept',
  },
];

export const OptionFields: FieldSettingsModel = {
  text: 'name',
  value: 'id',
};

export const DepartmentFields: FieldSettingsModel = {
  text: 'departmentName',
  value: 'departmentId',
};

export const TextOptionFields: FieldSettingsModel = {
  text: 'text',
  value: 'id',
};

export const DropdownFields: FieldSettingsModel = {
  text: 'value',
  value: 'key',
};

export const OrganizationSystems = {
  IRP: false,
  VMS: false,
  IRPAndVMS: false,
};
