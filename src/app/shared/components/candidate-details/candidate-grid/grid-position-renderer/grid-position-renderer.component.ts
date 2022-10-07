import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { AppState } from '../../../../../store/app.state';
import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { OrderManagementAgencyService } from '@agency/order-management/order-management-agency.service';
import { UserState } from '../../../../../store/user.state';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { SetLastSelectedOrganizationAgencyId } from '../../../../../store/user.actions';
import { OrderManagementService } from '@client/order-management/order-management-content/order-management.service';
import { CandidatesDetailsModel } from '@shared/components/candidate-details/models/candidate.model';
import { AgencyStatus } from '@shared/enums/status';

@Component({
  selector: 'app-grid-position-renderer',
  templateUrl: './grid-position-renderer.component.html',
  styleUrls: ['./grid-position-renderer.component.scss'],
})
export class GridPositionRendererComponent implements ICellRendererAngularComp {
  public cellValue: CandidatesDetailsModel;
  public readonly agencyStatus = AgencyStatus;

  constructor(
    private store: Store,
    private router: Router,
    private orderManagementAgencyService: OrderManagementAgencyService,
    private orderManagementService: OrderManagementService
  ) {}

  public agInit(params: ICellRendererParams): void {
    this.cellValue = params.data;
  }

  public refresh(params: ICellRendererParams): boolean {
    this.cellValue = params.data;
    return true;
  }

  public onCandidateNavigation(): void {
    const { isAgencyArea } = this.store.selectSnapshot(AppState.isOrganizationAgencyArea);
    this.setBusinessUnit(isAgencyArea);

    if (isAgencyArea) {
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
