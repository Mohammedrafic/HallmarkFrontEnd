import { Pipe, PipeTransform } from '@angular/core';

import { GridValuesHelper } from '@core/helpers';

@Pipe({
  name: 'numericalConverter'
})
export class NumericalConverterPipe implements PipeTransform {
  transform(value: number): string {
    return GridValuesHelper.formatAbsNumber(value, '1.2-2');
  }
}
