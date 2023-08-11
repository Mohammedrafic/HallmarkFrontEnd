import { FieldType, InputAttrType } from '@core/enums';
import { DropdownOption } from '@core/interface';

import { EmployeeDTO } from '../interfaces/profile-information-dto.interface';
import { ProfileInformationFormsSourceKeys } from '../enums';

export interface ProfileInformationFormsFieldConfig {
  field: string;
  title: string;
  type: FieldType;
  gridAreaName: string;
  required: boolean;
  readonly?: boolean;
  maxLen?: number;
  pattern?: string;
  inputType?: InputAttrType;
  sourceKey?: ProfileInformationFormsSourceKeys;
  tooltipContent?: string;
  subGridClass?: string;
}

export interface ProfileInformationFormConfig {
  title: string;
  class: string;
  fields: ProfileInformationFormsFieldConfig[];
}

export interface ProfileInformationConfig {
  demographics: ProfileInformationFormConfig;
  professionalDetails: ProfileInformationFormConfig;
  contactDetails: ProfileInformationFormConfig;
}

export interface DemographicsForm {
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
}

export interface ProfessionalDetailsForm {
  primarySkillId: number;
  secondarySkills: number[];
  hireDate: string;
  employeeId: string;
}

export interface ContactDetailsForm {
  country: number;
  address1: string;
  city: string;
  state: string;
  zipCode: string;
  personalEmail: string;
  workEmail: string;
  phone1: string;
  phone2: string;
}

export interface EmployeeProfileFormSource {
  [ProfileInformationFormsSourceKeys.PrimarySkill]: DropdownOption[],
  [ProfileInformationFormsSourceKeys.SecondarySkill]: DropdownOption[],
  [ProfileInformationFormsSourceKeys.Country]: DropdownOption[],
  [ProfileInformationFormsSourceKeys.State]: string[],
}

export interface EmployeeProfileData {
  employeeDTO: EmployeeDTO;
  skills: DropdownOption[];
  countries: DropdownOption[];
  states: string[];
}
