import { Pipe, PipeTransform } from '@angular/core';
import { OrderTypeOptions } from '@shared/enums/order-type';

@Pipe({
  name: 'orderTypeName'
})
export class OrderTypeName implements PipeTransform {

  transform(orderTypeId: number): string {
    const foundOption = OrderTypeOptions.find(option => option.id === orderTypeId);
    return foundOption ? foundOption.name : '';
  }
}
