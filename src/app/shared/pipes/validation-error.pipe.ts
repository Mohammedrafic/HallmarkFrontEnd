import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'validationError',
})
export class ValidationErrorPipe implements PipeTransform {
  transform(value: any): string {
    let error: string = '';

    //TODO: refactor(use switch case)
    if (value) {
      if (!!value['required']) {
        error = 'Required';
      }
      if (!!value['maxlength']) {
        error = `The max length of ${value.maxlength.requiredLength} characters is reached, you typed in ${value.maxlength.actualLength}`;
      }
      if(!!value['minlength']) {
        error = `Min symbols entered should be ${value.minlength.requiredLength}`;
      }
      if(!!value['pattern']) {
        if(value.pattern.requiredPattern === '/^[a-zA-Z\\s]*$/') {
          error = 'Only letters are allowed';
        }
      }
    }
    return error;
  }
}

