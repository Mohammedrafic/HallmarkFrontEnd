import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Order } from '@shared/models/order-management.model';
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
import { JobDistributionModel } from '@shared/models/job-distribution.model';

@Component({
  selector: 'app-general-reorder-info',
  templateUrl: './general-reorder-info.component.html',
  styleUrls: ['../general-order-info/general-order-info.component.scss'],
})
export class GeneralReorderInfoComponent extends DestroyableDirective implements OnChanges {
  @Input() public orderInformation: Order;

  @Input() system: OrderManagementIRPSystemId;

  @Select(AppState.isOrganizationAgencyArea)
  public isOrganizationOrAgencyArea$: Observable<IsOrganizationAgencyAreaStateModel>;

  public orderType = OrderType;
  public agencies: { name: string; tooltip: string };
  public orderPerDiemId: number;
  public readonly systemType = OrderManagementIRPSystemId;

  constructor(
    private store: Store,
    private orderManagementService: OrderManagementService,
    private orderManagementAgencyService: OrderManagementAgencyService
  ) {
    super();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    const { orderInformation } = changes;

    if (orderInformation) {
      this.agencies = this.getAgencyNames();
    }
  }
  
  public getAgencyNames(): { name: string; tooltip: string } {
    const numberOfAgency = this.orderInformation.jobDistributions?.length;
    const agenciesWithSeparator = this.orderInformation.jobDistributions
      ?.map(({ agencyName }: any) => agencyName)
      .join(', ');
    const hasAgency = this.isJobDistributionHasAgency(this.orderInformation.jobDistributions);

    switch (true) {
      case numberOfAgency === 1 && hasAgency:
        return { name: this.orderInformation.jobDistributions[0].agencyName!, tooltip: '' };
      case numberOfAgency === 2 && hasAgency:
        return { name: agenciesWithSeparator, tooltip: '' };
      case numberOfAgency >= 3 && hasAgency:
        return { name: `Multiple Agencies ${numberOfAgency}`, tooltip: agenciesWithSeparator };
      default:
        return { name: 'All', tooltip: '' };
    }
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

  private isJobDistributionHasAgency(jobDistributions: JobDistributionModel[]): boolean {
    return jobDistributions.every((distribution: JobDistributionModel) => {
      return distribution.agencyName !== null;
    });
  }
}
