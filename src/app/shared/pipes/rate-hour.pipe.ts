import { Pipe, PipeTransform } from '@angular/core';
import { BillRateOption, BillRateType, BillRateUnit } from '@shared/models/bill-rate.model';

@Pipe({
  name: 'rateHourPipe'
})
export class RateHourPipe implements PipeTransform {

  transform(value: string, billRateConfigId: number, billRateType: BillRateType, billRateOptions: BillRateOption[]): string {
    const foundBillRateOption = billRateOptions?.find(option => option.id === billRateConfigId);

    if (foundBillRateOption?.unit === BillRateUnit.Hours) {
      return value;
    }

    value = value.toString();
    if (value) {
      const splitRateHourValue = value.split('.');
      if (splitRateHourValue.length === 2 && splitRateHourValue[1].length === 2) {
        return value;
      } else if (splitRateHourValue.length === 2 && splitRateHourValue[1].length === 1) {
        return value + '0';
      } else if (splitRateHourValue.length === 1 && splitRateHourValue[0].length === 8) {
        return value + '.0';
      } else if (splitRateHourValue.length === 1 && splitRateHourValue[0].length < 8) {
        return value + '.00';
      }
    }

    return value;
  }
}
