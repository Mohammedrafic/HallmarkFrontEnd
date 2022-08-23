import { Component, Input } from '@angular/core';
import { OrderType } from '@shared/enums/order-type';
import { Order } from "@shared/models/order-management.model";

enum Active {
  No,
  Yes,
}

@Component({
  selector: 'app-general-order-per-diem-info',
  templateUrl: './general-order-per-diem-info.component.html',
  styleUrls: ['../general-order-info/general-order-info.component.scss']
})
export class GeneralOrderPerDiemInfoComponent {
  @Input() orderInformation: Order | any;

  public orderType = OrderType;

  public activeValue(value: boolean): string {
    return value ? Active[Number(value)] : 'No';
  }
}
