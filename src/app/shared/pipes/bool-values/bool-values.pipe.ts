import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'boolValueToText',
})
export class BoolValuePipe implements PipeTransform {
  transform(value: boolean): string {
    if (value) {
      return 'Yes';
    }
    return 'No';
  }
}
