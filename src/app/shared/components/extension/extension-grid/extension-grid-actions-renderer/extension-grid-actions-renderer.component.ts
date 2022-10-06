import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppState } from '../../../../../store/app.state';
import { Select } from '@ngxs/store';
import { first, Observable } from 'rxjs';
import { IsOrganizationAgencyAreaStateModel } from '@shared/models/is-organization-agency-area-state.model';
import { disabledBodyOverflow } from '@shared/utils/styles.utils';
import { OrderManagementService } from '@client/order-management/order-management-content/order-management.service';
import { OrderManagementAgencyService } from '@agency/order-management/order-management-agency.service';
import { filter } from 'rxjs/operators';
import { PermissionTypes } from '@shared/enums/permissions-types.enum';
import { UserState } from '../../../../../store/user.state';

@Component({
  selector: 'app-extension-edit-icon',
  templateUrl: './extension-grid-actions-renderer.component.html',
  styleUrls: ['./extension-grid-actions-renderer.component.scss'],
})
export class ExtensionGridActionsRendererComponent implements ICellRendererAngularComp, OnInit {
  @Select(AppState.isOrganizationAgencyArea)
  public isOrganizationAgencyArea$: Observable<IsOrganizationAgencyAreaStateModel>;

  @Select(UserState.currentUserPermissions)
  public currentUserPermissions$: Observable<any[]>;

  public canCreateOrder: boolean;

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

  public ngOnInit(): void {
    this.subscribeOnPermissions();
  }

  public onEdit(): void {
    if (!this.canCreateOrder) {
      return;
    }
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

  private subscribeOnPermissions(): void {
    this.currentUserPermissions$
      .pipe(
        filter((permissions) => !!permissions?.length),
        first()
      )
      .subscribe((permissions) => {
        const permissionIds = permissions.map(({ permissionId }) => permissionId);
        this.canCreateOrder = permissionIds.includes(PermissionTypes.CanCreateOrder);
      });
  }
}
