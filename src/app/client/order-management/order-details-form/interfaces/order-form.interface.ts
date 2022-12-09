import { Time } from '@angular/common';
import { AbstractControl, ValidatorFn } from '@angular/forms';

export interface JobDistributionsList {
  id: number;
  orderId: number;
  jobDistributionOption: number;
  agencyId: number[],
}

export interface JobDistributionDTO {
  jobDistribution: number;
  agency: number[],
  jobDistributions: JobDistributionsList[],
}

export interface OrderTypeDTO {
  orderType: string;
}

export interface GeneralInformationDTO {
  title: string;
  regionId: string;
  locationId: string;
  departmentId: string;
  skillId: string;
  hourlyRate: string;
  openPositions: number;
  minYrsRequired: number;
  joiningBonus: number;
  compBonus: number;
  duration: string;
  jobStartDate: Date;
  jobEndDate: Date;
  shift: string;
  shiftStartTime: Time;
  shiftEndTime: Time;
}

export interface JobDescriptionDTO {
  classifications: number[];
  onCallRequired: boolean;
  asapStart: boolean;
  criticalOrder: boolean;
  jobDescription: string;
  unitDescription: string;
  orderRequisitionReasonId: number;
  orderRequisitionReasonName: string;
}

export interface SpecialProjectDTO {
  projectTypeId: string;
  projectNameId: string;
  poNumberId: string;
}

export interface SpecialProject {
  id: number | null;
  projectType?: string;
  projectName?: string;
  poNumber?: string;
}

export interface ControlsConfig {
  orderTypeControl: AbstractControl;
  departmentIdControl: AbstractControl;
  hourlyRateControl: AbstractControl;
  skillIdControl: AbstractControl;
  durationControl: AbstractControl;
  jobStartDateControl: AbstractControl;
  jobEndDateControl: AbstractControl;
  shiftControl: AbstractControl;
  shiftStartTimeControl: AbstractControl;
  shiftEndTimeControl: AbstractControl;
  jobDistributionControl: AbstractControl;
  agencyControl: AbstractControl;
  jobDistributionsControl: AbstractControl;
}

export interface ValidatorsConfig {
  name: string;
  validators: null | ValidatorFn | ValidatorFn[];
}

export interface ExtensionsControlConfig {
  agencyControl: AbstractControl;
  jobDistributionsControl: AbstractControl;
  openPositionsControl: AbstractControl;
  classificationsControl: AbstractControl;
}
