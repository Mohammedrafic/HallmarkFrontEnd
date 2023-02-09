import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { OrderManagementIRPSystemId } from '@shared/enums/order-management-tabs.enum';

import { OrderType } from '@shared/enums/order-type';
import { Order } from "@shared/models/order-management.model";

enum Active {
  No,
  Yes,
}

@Component({
  selector: 'app-general-order-per-diem-info',
  templateUrl: './general-order-per-diem-info.component.html',
  styleUrls: ['../general-order-info/general-order-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralOrderPerDiemInfoComponent {
  @Input() orderInformation: Order | any;

  @Input() system: OrderManagementIRPSystemId = OrderManagementIRPSystemId.VMS;

  public orderType = OrderType;

  public readonly systemType = OrderManagementIRPSystemId;

  public activeValue(value: boolean): string {
    return value ? Active[Number(value)] : 'No';
  }
}
