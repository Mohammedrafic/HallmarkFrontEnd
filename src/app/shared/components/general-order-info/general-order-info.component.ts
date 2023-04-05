import { Component, Input } from '@angular/core';
import { OrderType } from '@shared/enums/order-type';
import { Order } from '@shared/models/order-management.model';
import { OrderManagementService,
} from '@client/order-management/components/order-management-content/order-management.service';
import { OrderManagementAgencyService } from '@agency/order-management/order-management-agency.service';
import { OrderManagementIRPSystemId } from '@shared/enums/order-management-tabs.enum';

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

  @Input() system: OrderManagementIRPSystemId = OrderManagementIRPSystemId.VMS;

  public orderType: typeof OrderType = OrderType;

  public readonly systemType = OrderManagementIRPSystemId;

  get hideEndDate(): boolean {
    return [this.orderType.ReOrder, this.orderType.PermPlacement].includes(this.orderInformation.orderType);
  }

  constructor(
    private orderManagementService: OrderManagementService,
    private orderManagementAgencyService: OrderManagementAgencyService
  ) {}

  public activeValue(value: boolean): string {
    return Active[Number(value)];
  }

  public moveToInitialOrder(): void {
    this.orderManagementService.orderId$.next({id: this.orderInformation.extensionInitialOrderPublicId!,
      prefix: this.orderInformation.organizationPrefix!});
    this.orderManagementAgencyService.orderId$.next({id: this.orderInformation.extensionInitialOrderPublicId!,
      prefix: this.orderInformation.organizationPrefix!});
  }

  public moveToPreviousExtension(): void {
    this.orderManagementService.orderId$.next({id: this.orderInformation.extensionPublicId!,
      prefix: this.orderInformation.organizationPrefix!});
    this.orderManagementAgencyService.orderId$.next({id: this.orderInformation.extensionPublicId!,
       prefix: this.orderInformation.organizationPrefix!});
  }
}
