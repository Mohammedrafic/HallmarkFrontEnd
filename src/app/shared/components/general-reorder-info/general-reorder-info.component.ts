import { Component, Input } from '@angular/core';
import { Order } from '@shared/models/order-management.model';
import { OrderType } from '@shared/enums/order-type';

@Component({
  selector: 'app-general-reorder-info',
  templateUrl: './general-reorder-info.component.html',
  styleUrls: ['../general-order-info/general-order-info.component.scss'],
})
export class GeneralReorderInfoComponent {
  @Input() orderInformation: Order;

  public orderType = OrderType;

  public get getAgencyNames(): string {
    return this.orderInformation.jobDistributions?.map(({ agencyName }: any) => agencyName).join(', ') ?? '';
  }
}
