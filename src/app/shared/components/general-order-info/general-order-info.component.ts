import { Component, Input } from '@angular/core';
import { OrderType } from '@shared/enums/order-type';
import { Order } from '@shared/models/order-management.model';
import { OrderManagementService } from '@client/order-management/order-management-content/order-management.service';
import { OrderManagementAgencyService } from '@agency/order-management/order-management-agency.service';

enum Active {
  No,
  Yes,
}

@Component({
  selector: 'app-general-order-info',
  templateUrl: './general-order-info.component.html',
  styleUrls: ['./general-order-info.component.scss'],
})
export class GeneralOrderInfoComponent {
  @Input() orderInformation: Order;

  public orderType = OrderType;

  get hideEndDate(): boolean {
    return [this.orderType.ReOrder, this.orderType.PermPlacement].includes(this.orderInformation.orderType);
  }

  get dateFieldName(): string {
    return this.orderInformation.orderType === this.orderType.ReOrder ? 'Date' : 'Start Date';
  }

  constructor(
    private orderManagementService: OrderManagementService,
    private orderManagementAgencyService: OrderManagementAgencyService
  ) {}

  public activeValue(value: boolean): string {
    return Active[Number(value)];
  }

  public moveToInitialOrder(): void {
    this.orderManagementService.orderId$.next(this.orderInformation.extensionInitialOrderId!);
    this.orderManagementAgencyService.orderId$.next(this.orderInformation.extensionInitialOrderId!);
  }

  public moveToPreviousExtension(): void {
    this.orderManagementService.orderId$.next(this.orderInformation.extensionFromId!);
  }
}
