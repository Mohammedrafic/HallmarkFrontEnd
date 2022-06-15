import { Component, Input } from '@angular/core';
import { OrderType } from '@shared/enums/order-type';
import { Order } from "@shared/models/order-management.model";

enum Active {
  No,
  Yes,
}

@Component({
  selector: 'app-general-order-info',
  templateUrl: './general-order-info.component.html',
  styleUrls: ['./general-order-info.component.scss']
})
export class GeneralOrderInfoComponent {
  @Input() orderInformation: Order;

  public orderType = OrderType;

  public activeValue(value: boolean): string {
    return Active[Number(value)];
  }
}
