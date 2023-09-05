import { BusinessUnitType } from '@shared/enums/business-unit-type';

export const BUSINESS_UNITS_VALUES = [
  { id: BusinessUnitType.Agency, text: 'Agency' },
  { id: BusinessUnitType.Hallmark, text: 'Hallmark' },
  { id: BusinessUnitType.MSP, text: 'MSP' },
  { id: BusinessUnitType.Organization, text: 'Organization' }  
];

export const BUSINESS_UNITS_VALUES_WITH_IRP = [
  { id: BusinessUnitType.Agency, text: 'Agency' },
  { id: BusinessUnitType.Hallmark, text: 'Hallmark' },
  { id: BusinessUnitType.MSP, text: 'MSP' },
  { id: BusinessUnitType.Organization, text: 'Organization' },
  { id: BusinessUnitType.Candidates, text: 'Employees' },
];

export const BUSINESS_UNITS_VALUES_USERS_ROLES = [
  { id: BusinessUnitType.Agency, text: 'Agency' },
  { id: BusinessUnitType.Hallmark, text: 'Hallmark' },
  { id: BusinessUnitType.MSP, text: 'MSP' },
  { id: BusinessUnitType.Organization, text: 'Organization' }, 
  { id: BusinessUnitType.Employee, text: 'Employee' }, 
];