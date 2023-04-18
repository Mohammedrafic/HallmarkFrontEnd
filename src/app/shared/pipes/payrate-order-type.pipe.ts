import { Pipe, PipeTransform } from '@angular/core';

import { IrpOrderTypes, OrderTypeOptions, PayrateOrderType } from '@shared/enums/order-type';

@Pipe({
  name: 'PayorderTypeName',
})
export class PayOrderTypeName implements PipeTransform {

  transform(orderTypeId: number, isIrpOrder: boolean | undefined = false): string {
    const foundOption = PayrateOrderType.find(option => option.id === orderTypeId);
    
    return foundOption ? foundOption.name : '';
  }
}
