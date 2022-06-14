import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'validationError',
})
export class ValidationErrorPipe implements PipeTransform {
  transform(value: any): string {
    let error: string = '';

    if (value) {
      if (!!value['required']) {
        error = 'Required';
      }
      if (!!value['maxlength']) {
        error = `The max length of ${value.maxlength.requiredLength} characters is reached, you typed in ${value.maxlength.actualLength}`;
      }
    }
    return error;
  }
}

