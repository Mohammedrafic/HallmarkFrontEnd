import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { GridHelper } from '@shared/helpers/grid.helper';
import { UserState } from '../../../../../store/user.state';
import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { SetLastSelectedOrganizationAgencyId } from '../../../../../store/user.actions';
import { disabledBodyOverflow } from '@shared/utils/styles.utils';
import { CandidatesDetailsModel } from '@shared/components/candidate-details/models/candidate.model';
import { SetCandidateMessage } from '@shared/components/candidate-details/store/candidate.actions';

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
    const url =
      user?.businessUnitType === BusinessUnitType.Organization ? '/agency/candidates' : '/agency/candidates/edit';
    const pageToBack = this.router.url;
    const readonly =
      user?.businessUnitType === BusinessUnitType.Organization || user?.businessUnitType === BusinessUnitType.MSP;

    if (readonly) {
      this.store.dispatch(
        new SetLastSelectedOrganizationAgencyId({
          lastSelectedAgencyId: this.cellValue.agencyId,
          lastSelectedOrganizationId: null,
        })
      );
    }

    this.store.dispatch(new SetCandidateMessage(this.cellValue.jobTitle, this.cellValue.positionId));

    this.router.navigate([url, this.cellValue.candidateProfileId], {
      state: { orderId: this.cellValue.orderId, pageToBack, isNavigateFromCandidateDetails: true, readonly },
    });
    disabledBodyOverflow(false);
  }
}
