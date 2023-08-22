export interface EmployeeDTO {
  id: number;
  employeeId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
  primarySkillId: number;
  secondarySkills: number[];
  classification: number;
  hireDate: string;
  fte: number;
  profileStatus: number;
  hrCompanyCodeId: number;
  internalTransferId: number;
  orientationConfigurationId: number;
  organizationOrientationDate: string;
  isContract: boolean;
  contractStartDate: string;
  contractEndDate: string;
  holdStartDate: string;
  holdEndDate: string;
  isOnHoldSetManually: boolean;
  terminationDate: string;
  terminationReasonId: number;
  address1: string;
  country: number;
  state: string;
  city: string;
  zipCode: string;
  personalEmail: string;
  workEmail: string;
  phone1: string;
  phone2: string;
  professionalSummary: string;
  photoId: string;
  generalNotes: GeneralNote[];
  createReplacement: boolean;
  employeeSourceId: string;
  sourceId: number;
  recruiterId: number;
}

export interface GeneralNote {
  id: number;
  categoryId: number;
  date: string;
  note: string;
  createdBy: string;
  createdByName: string;
}

export interface AssignedSkillDTO {
  id: number;
  masterSkillId: number;
  categoryId: number;
  categoryName: string;
  skillAbbr: string;
  skillCode: string;
  skillDescription: string;
  includeInIRP: boolean;
  includeInVMS: boolean;
  assignedToVMS: boolean;
  assignedToIRP: boolean;
}
