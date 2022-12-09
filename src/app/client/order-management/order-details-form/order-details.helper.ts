import { FormGroup } from '@angular/forms';
import { ControlsConfig, ValidatorsConfig } from '@client/order-management/order-details-form/interfaces';
import { Order } from '@shared/models/order-management.model';

export const generateControlsConfig = (controlNames: string[], form: FormGroup) => {
  return controlNames.reduce((acc: ControlsConfig, controlName: string) => {
    return {
      ...acc,
      [`${controlName}Control`]: form.get(controlName),
    };
  },{} as ControlsConfig);
};

export const setValidatorsToForm = (form: FormGroup, config: ValidatorsConfig[]): void  => {
  config.forEach((control: ValidatorsConfig) => {
    form.controls[control.name].setValidators(control.validators);
  });
};

export const clearValidatorsToForm = (form: FormGroup, config: ValidatorsConfig[]): void => {
  config.forEach((control: ValidatorsConfig) => {
    form.controls[control.name].clearValidators();
  });
};

export const updateValidationToForm = (form: FormGroup, config: ValidatorsConfig[]): void => {
  config.forEach((control: ValidatorsConfig) => {
    form.controls[control.name].updateValueAndValidity();
  });
};

export const valueMapperForGeneralInformation = (order: Order) => ({
  orderPlacementFee: order?.orderPlacementFee,
    annualSalaryRangeFrom: order?.annualSalaryRangeFrom
    ? parseFloat(order.annualSalaryRangeFrom.toString()).toFixed(2) : '',
    annualSalaryRangeTo: order?.annualSalaryRangeTo
    ? parseFloat(order.annualSalaryRangeTo.toString()).toFixed(2) : '',
});
