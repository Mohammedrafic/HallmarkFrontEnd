import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Order } from '@shared/models/order-management.model';
import { OrderType } from '@shared/enums/order-type';
import { Store } from '@ngxs/store';
import { GetSelectedOrderById } from '@client/store/order-managment-content.actions';
import { AppState } from '../../../store/app.state';

@Component({
  selector: 'app-general-reorder-info',
  templateUrl: './general-reorder-info.component.html',
  styleUrls: ['../general-order-info/general-order-info.component.scss'],
})
export class GeneralReorderInfoComponent implements OnChanges {
  @Input() orderInformation: Order;

  public orderType = OrderType;
  public agencies: { name: string; tooltip: string };
  public orderPerDiemId: number;

  constructor(private store: Store) {}

  public ngOnChanges(changes: SimpleChanges): void {
    const { orderInformation } = changes;

    if (orderInformation) {
      this.agencies = this.getAgencyNames();
      this.orderPerDiemId = this.getOrderPerDiemId(orderInformation.currentValue);
    }
  }

  public getAgencyNames(): { name: string; tooltip: string } {
    const numberOfAgency = this.orderInformation.jobDistributions?.length;
    const agenciesWithSeparator = this.orderInformation.jobDistributions
      ?.map(({ agencyName }: any) => agencyName)
      .join(', ');
    switch (true) {
      case numberOfAgency === 1 && this.orderInformation.jobDistributions[0].agencyId !== null:
        return { name: this.orderInformation.jobDistributions[0].agencyName!, tooltip: '' };
      case numberOfAgency === 2:
        return { name: agenciesWithSeparator, tooltip: '' };
      case numberOfAgency >= 3:
        return { name: `Multiple Agencies ${numberOfAgency}`, tooltip: agenciesWithSeparator };
      default:
        return { name: 'All', tooltip: '' };
    }
  }

  public moveToPerDiem(): void {
    const { isAgencyArea } = this.store.selectSnapshot(AppState.isOrganizationAgencyArea);

    if (isAgencyArea) {
      // this.store.dispatch(new GetOrderById(this.orderInformation.id, this.orderInformation.organizationId!, {} as any));
    } else {
      this.store.dispatch(new GetSelectedOrderById(this.orderInformation?.reOrderFromId!));
    }
  }

  private getOrderPerDiemId({ id, reOrderFromId }: Order): number {
    const { isAgencyArea } = this.store.selectSnapshot(AppState.isOrganizationAgencyArea);
    return isAgencyArea ? id! : reOrderFromId!;
  }
}
