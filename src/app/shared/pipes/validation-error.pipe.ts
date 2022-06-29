import { Pipe, PipeTransform } from '@angular/core';
import { ONLY_LETTERS, ONLY_NUMBER } from "@shared/constants";

@Pipe({
  name: 'validationError',
})
export class ValidationErrorPipe implements PipeTransform {
  transform(value: any): string {
    if(!value) {
      return '';
    }

    switch (true) {
      case 'required' in value:
        return 'Required';
      case 'maxlength' in value:
        return `The max length of ${value.maxlength.requiredLength} characters is reached, you typed in ${value.maxlength.actualLength}`;
      case 'minlength' in value:
        return `Min symbols entered should be ${value.minlength.requiredLength}`;
      case 'pattern' in value:
        if(!(new RegExp(ONLY_LETTERS).test(value.pattern.actualValue))) {
          return 'Only letters are allowed';
        } else if(!(new RegExp(ONLY_NUMBER)).test(value.pattern.actualValue)) {
          return 'Only numbers are allowed';
        }
        return '';
      default:
        return '';
    }
  }
}

