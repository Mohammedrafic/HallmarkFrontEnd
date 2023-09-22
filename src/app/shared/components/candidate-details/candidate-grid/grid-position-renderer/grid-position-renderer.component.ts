import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { AppState } from '../../../../../store/app.state';
import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { OrderManagementAgencyService } from '@agency/order-management/order-management-agency.service';
import { UserState } from '../../../../../store/user.state';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { SetLastSelectedOrganizationAgencyId } from '../../../../../store/user.actions';
import {
  OrderManagementService,
} from '@client/order-management/components/order-management-content/order-management.service';
import { CandidatesDetailsModel } from '@shared/components/candidate-details/models/candidate.model';
import { AbstractPermission } from '@shared/helpers/permissions';

@Component({
  selector: 'app-grid-position-renderer',
  templateUrl: './grid-position-renderer.component.html',
  styleUrls: ['./grid-position-renderer.component.scss'],
})
export class GridPositionRendererComponent extends AbstractPermission implements ICellRendererAngularComp, OnInit {
  public cellValue: CandidatesDetailsModel;
  public canViewOrder: boolean;
  private isAgencyArea: boolean; 

  constructor(
    protected override store: Store,
    private router: Router,
    private orderManagementAgencyService: OrderManagementAgencyService,
    private orderManagementService: OrderManagementService
  ) {
    super(store);
  }

  public override ngOnInit(): void {
    super.ngOnInit();
    this.isAgencyArea = this.store.selectSnapshot(AppState.isOrganizationAgencyArea)?.isAgencyArea;
    this.canViewOrder = this.isAgencyArea ? 
      this.userPermission[this.userPermissions.CanAgencyViewOrders] : 
      this.userPermission[this.userPermissions.CanOrganizationViewOrders];
  }

  public agInit(params: ICellRendererParams): void {
    this.cellValue = params.data;
  }

  public refresh(params: ICellRendererParams): boolean {
    this.cellValue = params.data;
    return true;
  }

  public onCandidateNavigation(): void {
    if (!this.canViewOrder) {
      return;
    }

    this.setBusinessUnit(this.isAgencyArea);

    if (this.isAgencyArea) {
      this.router.navigate(['/agency/order-management']);
      this.orderManagementAgencyService.selectedOrderAfterRedirect$.next({
        orderId: this.cellValue.publicId,
        candidateId: this.cellValue.candidateProfileId,
        orderType: this.cellValue.orderType,
        prefix: this.cellValue.organizationPrefix,
      });
    } else {
      this.router.navigate(['/client/order-management']);
      this.orderManagementService.selectedOrderAfterRedirect$.next({
        orderId: this.cellValue.publicId,
        candidateId: this.cellValue.candidateProfileId,
        orderType: this.cellValue.orderType,
        prefix: this.cellValue.organizationPrefix,
      });
    }
  }

  private setBusinessUnit(isAgencyArea: boolean): void {
    const user = this.store.selectSnapshot(UserState.user);
    const lastSelectedAgencyId = isAgencyArea ? this.cellValue.agencyId : null;
    const lastSelectedOrganizationId = !isAgencyArea ? this.cellValue.organizationId : null;

    if (user?.businessUnitType === BusinessUnitType.Hallmark || user?.businessUnitType === BusinessUnitType.MSP) {
      this.store.dispatch(
        new SetLastSelectedOrganizationAgencyId({
          lastSelectedAgencyId,
          lastSelectedOrganizationId,
        })
      );
    }
  }
}
