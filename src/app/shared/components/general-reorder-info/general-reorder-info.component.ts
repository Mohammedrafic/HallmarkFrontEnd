import { Component, Input } from '@angular/core';
import { Order, RegularRatesData } from '@shared/models/order-management.model';
import { OrderType } from '@shared/enums/order-type';
import { Select, Store } from '@ngxs/store';
import { AppState } from '../../../store/app.state';
import { OrderManagementService,
} from '@client/order-management/components/order-management-content/order-management.service';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { OrderManagementAgencyService } from '@agency/order-management/order-management-agency.service';
import { Observable } from 'rxjs';
import { IsOrganizationAgencyAreaStateModel } from '@shared/models/is-organization-agency-area-state.model';
import { OrderManagementIRPSystemId } from '@shared/enums/order-management-tabs.enum';
import { getAgencyNameList } from '@shared/components/general-reorder-info/general-reoder-info.helper';
import { BillRate } from '@shared/models';

@Component({
  selector: 'app-general-reorder-info',
  templateUrl: './general-reorder-info.component.html',
  styleUrls: ['../general-order-info/general-order-info.component.scss'],
})
export class GeneralReorderInfoComponent extends DestroyableDirective {
  @Input() public set order(order: Order) {
    this.orderInformation = order;
    this.setRegularRates(order.billRates, order.jobStartDate);
    this.agencies = getAgencyNameList(this.orderInformation);
  }

  @Input() system: OrderManagementIRPSystemId = OrderManagementIRPSystemId.VMS;

  @Select(AppState.isOrganizationAgencyArea)
  public isOrganizationOrAgencyArea$: Observable<IsOrganizationAgencyAreaStateModel>;

  public orderType = OrderType;
  public agencies: { name: string; tooltip: string };
  public orderPerDiemId: number;
  public readonly systemType = OrderManagementIRPSystemId;
  public regularRates: RegularRatesData = {
    regular: null,
    regularLocal: null,
  };
  public orderInformation: Order;

  constructor(
    private store: Store,
    private orderManagementService: OrderManagementService,
    private orderManagementAgencyService: OrderManagementAgencyService
  ) {
    super();
  }

  public moveToPerDiem(): void {
    const { isAgencyArea } = this.store.selectSnapshot(AppState.isOrganizationAgencyArea);

    if (isAgencyArea) {
      this.orderManagementAgencyService.orderPerDiemId$
      .next({id: this.orderInformation.reOrderFrom?.publicId!, prefix: this.orderInformation.organizationPrefix!});
    } else {
      this.orderManagementService.orderPerDiemId$
      .next({id: this.orderInformation.reOrderFrom?.publicId!, prefix: this.orderInformation.organizationPrefix!});
    }
  }

  private setRegularRates(rates: BillRate[], jobStartDate: Date | string): void {
    this.regularRates = this.orderManagementService.setRegularRates(rates, jobStartDate);
  }
}
