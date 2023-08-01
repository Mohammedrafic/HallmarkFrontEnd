import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { QuickOrderConditions } from '../interfaces';

export const optionFields: FieldSettingsModel = { text: 'name', value: 'id' };
export const skillsFields: FieldSettingsModel = { text: 'skillDescription', value: 'masterSkillId' };
export const organizationFields: FieldSettingsModel = { text: 'name', value: 'organizationId' };
export const associateAgencyFields: FieldSettingsModel = { text: 'agencyName', value: 'agencyId' };
export const specialProjectCategoriesFields: FieldSettingsModel = { text: 'projectType', value: 'id' };
export const projectNameFields: FieldSettingsModel = { text: 'projectName', value: 'id' };
export const poNumberFields: FieldSettingsModel = { text: 'poNumber', value: 'id' };
export const reasonForRequisitionFields: FieldSettingsModel = { text: 'reason', value: 'id' };

export const PermPlacementList = ['orderPlacementFee', 'annualSalaryRangeFrom', 'annualSalaryRangeTo'];
export const GeneralOrderList = ['hourlyRate', 'jobEndDate', 'duration', 'joiningBonus', 'compBonus'];
export const CommonList = ['hourlyRate', 'openPositions', 'jobStartDate', 'jobEndDate', 'shift', 'shiftStartTime', 'shiftEndTime'];

export const QuickOrderCondition: QuickOrderConditions = {
  isSpecialProjectFieldsRequired: true,
  isPermPlacementOrder: false,
  isContactToPermOrder: false,
  isEditContactTitle: false,
  isLTAOrder: true,
  isOpenPerDiem: false,
  isRegionsDropDownEnabled: false,
  isLocationsDropDownEnabled: false,
  isDepartmentsDropDownEnabled: false,
  isJobEndDateControlEnabled: false,
  agencyControlEnabled: false,
  isShiftTimeRequired: true,
  isFormDirty: false,
};

