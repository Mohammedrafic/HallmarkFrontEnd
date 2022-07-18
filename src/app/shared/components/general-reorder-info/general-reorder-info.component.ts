import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Order } from '@shared/models/order-management.model';
import { OrderType } from '@shared/enums/order-type';
import { Store } from '@ngxs/store';
import { GetSelectedOrderById } from '@client/store/order-managment-content.actions';

@Component({
  selector: 'app-general-reorder-info',
  templateUrl: './general-reorder-info.component.html',
  styleUrls: ['../general-order-info/general-order-info.component.scss'],
})
export class GeneralReorderInfoComponent implements OnChanges {
  @Input() orderInformation: Order;

  public orderType = OrderType;
  public agencies: { name: string; tooltip: string };

  constructor(private store: Store) {}

  public ngOnChanges(changes: SimpleChanges): void {
    const { orderInformation } = changes;

    if (orderInformation && !orderInformation?.isFirstChange()) {
      this.agencies = this.getAgencyNames();
    }
  }

  public getAgencyNames(): { name: string; tooltip: string } {
    const numberOfAgency = this.orderInformation.jobDistributions?.length;
    const agenciesWithSeparator = this.orderInformation.jobDistributions
      ?.map(({ agencyName }: any) => agencyName)
      .join(', ');
    switch (true) {
      case numberOfAgency === 1 && agenciesWithSeparator:
        return { name: this.orderInformation.jobDistributions[0].agencyName!, tooltip: '' };
      case numberOfAgency === 2:
        return { name: agenciesWithSeparator, tooltip: '' };
      case numberOfAgency >= 3:
        return { name: `Multiple Agencies ${numberOfAgency}`, tooltip: agenciesWithSeparator };
      default:
        return { name: 'All', tooltip: '' };
    }
  }

  public moveToPerDiem(perDiemId: number): void {
    this.store.dispatch(new GetSelectedOrderById(perDiemId));
  }
}
