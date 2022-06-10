import { Component, Input } from '@angular/core';
import { Order } from "@shared/models/organization.model";

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

  constructor() {
  }

  public activeValue(value: boolean): string {
    return Active[Number(value)];
  }
}
