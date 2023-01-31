import { formatDate } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'localDateTime'
})
export class LocalDateTimePipe implements PipeTransform {
  transform(value: string, format: string): string {
    //get timezone from string. example: "2023-01-30T09:43:32.2300926-05:00" => "-0500"
    const timeZone = value.slice(-6).split(':').join(''); 
    return formatDate(value, format, 'en-US', timeZone);
  }
}
