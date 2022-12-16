import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { JobClassification } from '@shared/enums/job-classification';

export const OptionFields: FieldSettingsModel = { text: 'name', value: 'id' };
export const DepartmentFields: FieldSettingsModel = { text: 'departmentName', value: 'departmentId' };
export const ReasonRequisitionFields: FieldSettingsModel = { text: 'reason', value: 'id' };
export const AssociateAgencyFields: FieldSettingsModel = { text: 'agencyName', value: 'agencyId' };
export const OrganizationStateWithKeyCodeFields: FieldSettingsModel = { text: 'title', value: 'keyCode' };
export const SpecialProjectCategoriesFields: FieldSettingsModel = { text: 'projectType', value: 'id' };
export const ProjectNameFields: FieldSettingsModel = { text: 'projectName', value: 'id' };
export const PoNumberFields: FieldSettingsModel = { text: 'poNumber', value: 'id' };
export const SkillFields: FieldSettingsModel = { text: 'name', value: 'masterSkillId' };
export const JobClassifications = [
  { id: JobClassification.Alumni, name: 'Alumni' },
  { id: JobClassification.International, name: 'International' },
  { id: JobClassification.Interns, name: 'Interns' },
  { id: JobClassification.Locums, name: 'Locums' },
  { id: JobClassification.Students, name: 'Students' },
  { id: JobClassification.Volunteers, name: 'Volunteers' },
];
export const ListOfPermPlacementControls = ['orderPlacementFee', 'annualSalaryRangeFrom', 'annualSalaryRangeTo'];
export const ListOfGeneralOrderControls = ['hourlyRate', 'jobEndDate', 'duration', 'joiningBonus', 'compBonus'];
export const ControlsForDisable = ['regionId', 'locationId', 'departmentId', 'skillId'];
export const OrderTypeControls = ['orderType'];
export const JobDistributionControls = ['jobDistribution', 'agency', 'jobDistributions'];
export const ExtensionControls = ['jobDistribution', 'agency', 'classifications'];
export const GeneralInfoControls = [
  'departmentId',
  'hourlyRate',
  'skillId',
  'duration',
  'jobStartDate',
  'jobEndDate',
  'shift',
  'shiftStartTime',
  'shiftEndTime',
];
export const LocationField = 'location';
export const DepartmentField = 'department';
export const SkillsField = 'skills';
export const RegionField = 'region';
