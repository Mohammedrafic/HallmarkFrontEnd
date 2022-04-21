import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'validationError'
})
export class ValidationErrorPipe implements PipeTransform {

 transform(value: any): string {
    let error: string = '';
    if (value) {
      if (value['required'] == true) {
        error = 'Required';
      }
    }
    return error;
  }
}
