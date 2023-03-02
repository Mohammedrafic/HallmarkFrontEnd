import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AbstractPermission } from '@shared/helpers/permissions';
import { Store } from '@ngxs/store';
import { CredentialStorageFacadeService } from '@agency/services/credential-storage-facade.service';
import { CandidatesService } from '@client/candidates/services/candidates.service';
import { Observable } from 'rxjs';
import { CandidateTabsEnum } from '../enums';

@Component({
  selector: 'app-credentials',
  templateUrl: './credentials.component.html',
  styleUrls: ['./credentials.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CredentialsComponent extends AbstractPermission implements OnInit {
  public isNavigatedFromOrganizationArea: boolean;
  public orderId: number | null = null;

  public candidateName$: Observable<string> = this.candidatesService.getCandidateName();
  public selectedTab$: Observable<CandidateTabsEnum>;

  public readonly candidateTabsEnum: typeof CandidateTabsEnum = CandidateTabsEnum;

  constructor(
    protected override store: Store,
    private credentialStorage: CredentialStorageFacadeService,
    public candidatesService: CandidatesService
  ) {
    super(store);
  }

  public override ngOnInit() {
    super.ngOnInit();
    this.setCredentialParams();
    this.selectedTab$ = this.candidatesService.getSelectedTab$();
  }

  private setCredentialParams(): void {
    const { isNavigatedFromOrganizationArea } = this.credentialStorage.getCredentialParams();

    this.isNavigatedFromOrganizationArea = isNavigatedFromOrganizationArea as boolean;
  }

}
