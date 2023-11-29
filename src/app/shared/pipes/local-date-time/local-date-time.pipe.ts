import { formatDate } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

import { DateTimeHelper } from '@core/helpers';

@Pipe({
  name: 'localDateTime',
})
export class LocalDateTimePipe implements PipeTransform {
  transform(value: string, format: string): string {
    const timeZone = DateTimeHelper.getISOTimeZone(value); 
    return formatDate(value, format, 'en-US', timeZone);
  }
}
