import { Validators } from '@angular/forms';
import {  NUMBER_AND_ONE_DECIMAL, ONLY_NUMBER_AND_DOT } from '@shared/constants';

export const ValidatorsListForNumberWithDots = [
  Validators.maxLength(10),
  Validators.pattern(ONLY_NUMBER_AND_DOT),
];
export const ValidatorsListForNumber = [
  Validators.maxLength(10),
  Validators.pattern(NUMBER_AND_ONE_DECIMAL),
];
export const GeneralInformationControlsConfigForPerDiem = [
  {
    name: 'hourlyRate',
    validators: null,
  },
  {
    name: 'openPositions',
    validators: null,
  },
  {
    name: 'minYrsRequired',
    validators: null,
  },
  {
    name: 'joiningBonus',
    validators: null,
  },
  {
    name: 'compBonus',
    validators: null,
  },
  {
    name: 'duration',
    validators: null,
  },
  {
    name: 'jobStartDate',
    validators: null,
  },
  {
    name: 'jobEndDate',
    validators: null,
  },
  {
    name: 'shift',
    validators: null,
  },
  {
    name: 'shiftStartTime',
    validators: null,
  },
  {
    name: 'shiftEndTime',
    validators: null,
  },
];

export const GeneralInformationControlsConfig = [
  {
    name: 'hourlyRate',
    validators: [
      Validators.required,
      ...ValidatorsListForNumberWithDots,
    ],
  },
  {
    name: 'openPositions',
    validators: [
      Validators.required,
      ...ValidatorsListForNumber,
      Validators.min(1),
    ],
  },
  {
    name: 'minYrsRequired',
    validators: ValidatorsListForNumber,
  },
  {
    name: 'joiningBonus',
    validators: ValidatorsListForNumberWithDots,
  },
  {
    name: 'compBonus',
    validators: ValidatorsListForNumberWithDots,
  },
  {
    name: 'duration',
    validators: Validators.required,
  },
  {
    name: 'jobStartDate',
    validators: Validators.required,
  },
  {
    name: 'jobEndDate',
    validators: Validators.required,
  },
  {
    name: 'shift',
    validators: Validators.required,
  },
];

export const SpecialProjectControlsConfig = [
  {
    name: 'projectTypeId',
    validators: Validators.required,
  },
  {
    name: 'projectNameId',
    validators: Validators.required,
  },
  {
    name: 'poNumberId',
    validators: Validators.required,
  },
];
