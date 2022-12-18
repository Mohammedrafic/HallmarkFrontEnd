import { Pipe, PipeTransform } from '@angular/core';

import { IrpOrderTypes, OrderTypeOptions } from '@shared/enums/order-type';

@Pipe({
  name: 'orderTypeName',
})
export class OrderTypeName implements PipeTransform {

  transform(orderTypeId: number, isIrpOrder: boolean | undefined = false): string {
    const orderTypes = isIrpOrder ? IrpOrderTypes : OrderTypeOptions;

    const foundOption = orderTypes.find(option => option.id === orderTypeId);
    return foundOption ? foundOption.name : '';
  }
}
