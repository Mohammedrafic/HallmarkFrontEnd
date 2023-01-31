import { formatDate } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'localDateTime'
})
export class LocalDateTimePipe implements PipeTransform {
  transform(value: string, format: string): string {
    const timeZone = value.slice(-6).split(':').join('');
    return formatDate(value, format, 'en-US', timeZone);
  }
}
