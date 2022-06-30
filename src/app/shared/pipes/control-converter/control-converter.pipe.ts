import { Pipe, PipeTransform } from '@angular/core';
import { FormControl } from '@angular/forms';

@Pipe({
  name: 'controlConverter'
})
export class ControlConverterPipe implements PipeTransform {
  transform(value: any): FormControl {
    return value as FormControl;
  }
}
