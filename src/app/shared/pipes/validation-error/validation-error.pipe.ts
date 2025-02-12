import { Pipe, PipeTransform } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

import {
  ONLY_LETTERS,
  ONLY_NUMBER,
  ONLY_NUMBER_AND_DOT,
  ALPHANUMERICS_AND_SYMBOLS,
  ALPHANUMERIC,
  MIN_DIGITS_LENGTH_ONLY_NINE,
  NUMBER_AND_ONE_DECIMAL,
  NUMBER_AND_TWO_DECIMAL,
} from '@shared/constants';

@Pipe({
  name: 'validationError',
})
export class ValidationErrorPipe implements PipeTransform {
  transform(value: ValidationErrors | null | undefined): string {
    if (!value) {
      return '';
    }

    switch (true) {
      case 'required' in value:
        return 'Required';
      case 'maxlength' in value:
        return `The max length of ${value['maxlength'].requiredLength} characters is reached, you typed in ${value['maxlength'].actualLength}`;
      case 'minlength' in value:
        return `Min symbols entered should be ${value['minlength'].requiredLength}`;
      case 'email' in value:
        return 'Please enter a valid email address';
      case 'min' in value:
        return `The minimum value should be ${value['min'].min}`;
      case 'duplicateDate' in value:
        return 'Payee with such date already exists';
      case 'invalidEmails' in value:
        return `Please correct e-mail format: ${value['invalidEmails'].join()}`;
      case 'pattern' in value:
        if (this.isWrongValue(ONLY_LETTERS, value)) {
          return 'Only letters are allowed';
        }
        if (this.isWrongValue(ONLY_NUMBER, value) || this.isWrongValue(ONLY_NUMBER_AND_DOT, value)|| this.isWrongValue(NUMBER_AND_TWO_DECIMAL , value)) {
          return 'Only numbers are allowed';
        }
        if (this.isWrongValue(ALPHANUMERICS_AND_SYMBOLS, value)) {
          return 'At least 3 alphanumerics, and such symbols !@#$%^&*()/\|?",.:;[]{}~-_<> are allowed';
        }
        if(this.isWrongValue(ALPHANUMERIC, value)) {
          return 'Only alphanumeric symbols are allowed';
        }
        if(this.isWrongValue(MIN_DIGITS_LENGTH_ONLY_NINE, value)){
          return `Min digits entered should be 9`;
        }

        if (this.isWrongValue(NUMBER_AND_ONE_DECIMAL, value)) {
          return 'Please fill in a correct value';
        }
        return '';
      case 'max' in value:
        return `The maximum value should be ${value['max'].max}`;
      case 'notMatchPattern' in value:
        return value['message'];
      default:
        return '';
    }
  }

  private isWrongValue(regex: RegExp, value: ValidationErrors): boolean {
    return value['pattern'].requiredPattern === regex.toString() && !new RegExp(regex).test(value['pattern'].actualValue);
  }
}
