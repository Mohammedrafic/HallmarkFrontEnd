import { FieldType, InputAttrType } from '@core/enums';
import { PhoneMask } from '@shared/constants';

import { ProfileInformationFormsKeys, ProfileInformationFormsSourceKeys } from '../enums';
import {
  EmployeeProfileFormSource,
  ProfileInformationConfig,
  ProfileInformationFormsFieldConfig,
} from '../interfaces/profile-information-form.interface';

const demographicsFormFields: ProfileInformationFormsFieldConfig[] = [
  {
    field: 'firstName',
    title: 'First Name',
    required: true,
    type: FieldType.Input,
    readonly: true,
    gridAreaName: 'firstName',
    inputType: InputAttrType.Text,
  },
  {
    field: 'middleName',
    title: 'Middle Name',
    required: false,
    type: FieldType.Input,
    readonly: true,
    gridAreaName: 'middleName',
    inputType: InputAttrType.Text,
  },
  {
    field: 'lastName',
    title: 'Last Name',
    required: true,
    type: FieldType.Input,
    readonly: true,
    gridAreaName: 'lastName',
    inputType: InputAttrType.Text,
  },
  {
    field: 'dob',
    title: 'DOB',
    required: false,
    type: FieldType.Calendar,
    readonly: true,
    gridAreaName: 'dob',
  },
];

const professionalDetailsFormFields: ProfileInformationFormsFieldConfig[] = [
  {
    field: 'primarySkillId',
    title: 'Primary Skill',
    required: true,
    type: FieldType.Dropdown,
    readonly: true,
    gridAreaName: 'primarySkillId',
    tooltipContent: '',
    sourceKey: ProfileInformationFormsSourceKeys.PrimarySkill,
  },
  {
    field: 'secondarySkills',
    title: 'Secondary Skill',
    required: false,
    type: FieldType.MultiSelectDropdown,
    readonly: true,
    gridAreaName: 'secondarySkills',
    tooltipContent: '',
    sourceKey: ProfileInformationFormsSourceKeys.SecondarySkill,
  },
  {
    field: 'hireDate',
    title: 'Hire Date',
    required: false,
    type: FieldType.Calendar,
    readonly: true,
    gridAreaName: 'hireDate',
  },
  {
    field: 'employeeId',
    title: 'Employee ID',
    required: true,
    type: FieldType.Input,
    readonly: true,
    gridAreaName: 'employeeId',
    inputType: InputAttrType.Text,
    tooltipContent: '',
  },
];

const contactDetailsFormFields: ProfileInformationFormsFieldConfig[] = [
  {
    field: 'country',
    title: 'Country',
    required: true,
    type: FieldType.Dropdown,
    readonly: true,
    gridAreaName: 'country',
    sourceKey: ProfileInformationFormsSourceKeys.Country,
  },
  {
    field: 'address1',
    title: 'Address 1',
    required: false,
    type: FieldType.Input,
    readonly: true,
    gridAreaName: 'address1',
    inputType: InputAttrType.Text,
  },
  {
    field: 'city',
    title: 'City',
    required: true,
    type: FieldType.Input,
    readonly: true,
    gridAreaName: 'city',
    subGridClass: 'location',
    inputType: InputAttrType.Text,
  },
  {
    field: 'state',
    title: 'State',
    required: true,
    type: FieldType.Dropdown,
    readonly: true,
    gridAreaName: 'state',
    subGridClass: 'location',
    sourceKey: ProfileInformationFormsSourceKeys.State,
  },
  {
    field: 'zipCode',
    title: 'ZIP Code',
    required: true,
    type: FieldType.Input,
    readonly: true,
    gridAreaName: 'zipCode',
    subGridClass: 'location',
    inputType: InputAttrType.Text,
  },
  {
    field: 'personalEmail',
    title: 'Personal Email',
    required: true,
    type: FieldType.Input,
    readonly: true,
    gridAreaName: 'personalEmail',
    inputType: InputAttrType.Mail,
  },
  {
    field: 'workEmail',
    title: 'Work Email',
    required: false,
    type: FieldType.Input,
    readonly: true,
    gridAreaName: 'workEmail',
    inputType: InputAttrType.Mail,
  },
  {
    field: 'phone1',
    title: 'Phone 1',
    required: true,
    type: FieldType.Input,
    readonly: true,
    gridAreaName: 'phone1',
    inputType: InputAttrType.Tel,
    mask: PhoneMask,
  },
  {
    field: 'phone2',
    title: 'Phone 2',
    required: false,
    type: FieldType.Input,
    readonly: true,
    gridAreaName: 'phone2',
    inputType: InputAttrType.Tel,
    mask: PhoneMask,
  },
];

export const ProfileInformationConf: ProfileInformationConfig = {
  [ProfileInformationFormsKeys.Demographics]: {
    title: 'Demographics',
    fields: demographicsFormFields,
    class: 'demographics',
  },
  [ProfileInformationFormsKeys.ProfessionalDetails]: {
    title: 'Professional Details',
    fields: professionalDetailsFormFields,
    class: 'professional-details',
  },
  [ProfileInformationFormsKeys.ContactDetails]: {
    title: 'Employee Contact Details',
    fields: contactDetailsFormFields,
    class: 'contact-details',
  },
};

export const EmployeeProfileFormSourceMap: EmployeeProfileFormSource =  {
  [ProfileInformationFormsSourceKeys.PrimarySkill]: [],
  [ProfileInformationFormsSourceKeys.SecondarySkill]: [],
  [ProfileInformationFormsSourceKeys.Country]: [],
  [ProfileInformationFormsSourceKeys.State]: [],
};


