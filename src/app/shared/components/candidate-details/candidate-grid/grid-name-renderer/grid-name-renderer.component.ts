import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { GridHelper } from '@shared/helpers/grid.helper';
import { AppState } from 'src/app/store/app.state';
import { UserState } from 'src/app/store/user.state';
import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { SetLastSelectedOrganizationAgencyId } from 'src/app/store/user.actions';
import { disabledBodyOverflow } from '@shared/utils/styles.utils';
import { CandidatesDetailsModel } from '@shared/components/candidate-details/models/candidate.model';

@Component({
  selector: 'app-grid-name-renderer',
  templateUrl: './grid-name-renderer.component.html',
  styleUrls: ['./grid-name-renderer.component.scss'],
})
export class GridNameRendererComponent implements ICellRendererAngularComp {
  public cellValue: CandidatesDetailsModel;
  public valueHelper = new GridHelper();

  constructor(private store: Store, private router: Router) {}

  public agInit(params: ICellRendererParams): void {
    this.cellValue = params.data;
  }

  public refresh(params: ICellRendererParams): boolean {
    this.cellValue = params.data;
    return true;
  }

  public onViewNavigation(): void {
    const user = this.store.selectSnapshot(UserState.user);
    const isOrganizationAgencyArea = this.store.selectSnapshot(AppState.isOrganizationAgencyArea);
    const url =
      user?.businessUnitType === BusinessUnitType.Organization ? '/agency/candidates' : '/agency/candidates/edit';
    const pageToBack = this.router.url;

    if (user?.businessUnitType === BusinessUnitType.Hallmark || user?.businessUnitType === BusinessUnitType.MSP) {
      this.store.dispatch(
        new SetLastSelectedOrganizationAgencyId({
          lastSelectedAgencyId: this.cellValue.agencyId,
          lastSelectedOrganizationId: null,
        })
      );
    }
    debugger;
    this.router.navigate([url, this.cellValue.candidateProfileId], {
      state: {
        orderId: this.cellValue.orderId,
        candidateStatus: this.cellValue.status,
        pageToBack,
        isNavigateFromCandidateDetails: true,
        isNavigatedFromOrganizationArea: isOrganizationAgencyArea.isOrganizationArea,
        readonly: isOrganizationAgencyArea.isOrganizationArea,
      },
    });
    disabledBodyOverflow(false);
  }
}
