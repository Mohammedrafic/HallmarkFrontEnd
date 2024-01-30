import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { OrderManagementAgencyService } from '@agency/order-management/order-management-agency.service';
import {
  OrderManagementService,
} from '@client/order-management/components/order-management-content/order-management.service';
import { AppState } from '../../../../store/app.state';
import { GridCellRenderer } from '@shared/components/grid/models';
import { OrderType } from '@shared/enums/order-type';
import { BaseInvoice } from '../../interfaces';
import { ManualInvoiceAdapter } from '../../helpers';

@Component({
  selector: 'app-grid-order-id-cell',
  templateUrl: './grid-order-id-cell.component.html',
  styleUrls: ['./grid-order-id-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridOrderIdCellComponent extends GridCellRenderer {
  public data: BaseInvoice;

  constructor(
    private store: Store,
    private router: Router,
    private orderManagementAgencyService: OrderManagementAgencyService,
    private orderManagementService: OrderManagementService
  ) {
    super();
  }

  public override agInit(params: ICellRendererParams) {
    super.agInit(params);
    this.data = this.params.data as BaseInvoice;
  }

  public onCandidateNavigation(): void {
    const { isAgencyArea } = this.store.selectSnapshot(AppState.isOrganizationAgencyArea);
    const url = isAgencyArea ? '/agency/order-management' : '/client/order-management';
    const service = isAgencyArea ? this.orderManagementAgencyService : this.orderManagementService;
    const { formattedOrderIdFull, candidateId } = this.data;

    if (formattedOrderIdFull) {
      const [prefix, orderId] = ManualInvoiceAdapter.parseOrderId(formattedOrderIdFull) as [string, number, number];

      this.router.navigate([url]);
      service.selectedOrderAfterRedirect$.next({
        orderId,
        candidateId: candidateId,
        orderType: OrderType.ContractToPerm,
        prefix,
        isReorder: this.params.data.isBasedOnPdTimesheet,
      });
    }
  }
}
