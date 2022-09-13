import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppState } from '../../../../../store/app.state';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { IsOrganizationAgencyAreaStateModel } from '@shared/models/is-organization-agency-area-state.model';
import { disabledBodyOverflow } from '@shared/utils/styles.utils';
import { OrderManagementService } from '@client/order-management/order-management-content/order-management.service';
import { OrderManagementAgencyService } from '@agency/order-management/order-management-agency.service';

@Component({
  selector: 'app-extension-edit-icon',
  templateUrl: './extension-grid-actions-renderer.component.html',
  styleUrls: ['./extension-grid-actions-renderer.component.scss'],
})
export class ExtensionGridActionsRendererComponent implements ICellRendererAngularComp {
  @Select(AppState.isOrganizationAgencyArea)
  public isOrganizationAgencyArea$: Observable<IsOrganizationAgencyAreaStateModel>;

  private params: ICellRendererParams;

  public constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private orderManagementService: OrderManagementService,
    private orderManagementAgencyService: OrderManagementAgencyService
  ) {}

  public agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  public refresh(params: ICellRendererParams): boolean {
    return false;
  }

  public onEdit(): void {
    disabledBodyOverflow(false);
    this.router.navigate(['./edit', this.params.data.id], { relativeTo: this.activatedRoute });
  }

  public onOpen(): void {
    this.orderManagementService.orderId$.next({
      id: this.params.data?.publicId,
      prefix: this.params.data?.organizationPrefix,
    });
    this.orderManagementAgencyService.orderId$.next({
      id: this.params.data?.publicId,
      prefix: this.params.data?.organizationPrefix,
    });

    this.orderManagementService.selectedTab$.next(0);
  }
}
