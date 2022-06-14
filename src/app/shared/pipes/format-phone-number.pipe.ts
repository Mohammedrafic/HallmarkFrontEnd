import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatPhoneNumber'
})
export class FormatPhoneNumberPipe implements PipeTransform {

  transform(phoneNumber: string): string {
    if (phoneNumber.length > 5) {
      return phoneNumber.replace(/(\d{3})(\d{3})(\d+)/, '$1-$2-$3');
    } else {
      return phoneNumber;
    }
  }
}
