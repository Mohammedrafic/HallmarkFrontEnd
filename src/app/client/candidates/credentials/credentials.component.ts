import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { Store } from '@ngxs/store';
import { Observable, take, filter } from 'rxjs';

import { AbstractPermission } from '@shared/helpers/permissions';
import { CredentialStorageFacadeService } from '@agency/services/credential-storage-facade.service';
import { CandidatesService } from '@client/candidates/services/candidates.service';
import { CandidateTabsEnum } from '../enums';

@Component({
  selector: 'app-credentials',
  templateUrl: './credentials.component.html',
  styleUrls: ['./credentials.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CredentialsComponent extends AbstractPermission implements OnInit {
  public isNavigatedFromOrganizationArea: boolean;
  public orderId: number | null = null;

  public candidateName$: Observable<string> = this.candidatesService.getCandidateName();
  public selectedTab$: Observable<CandidateTabsEnum>;

  public readonly candidateTabsEnum: typeof CandidateTabsEnum = CandidateTabsEnum;
  public renderCredentialGrid: boolean = false;

  constructor(
    protected override store: Store,
    private credentialStorage: CredentialStorageFacadeService,
    public candidatesService: CandidatesService,
    private cdr: ChangeDetectorRef
  ) {
    super(store);
  }

  public override ngOnInit() {
    super.ngOnInit();
    this.setCredentialParams();
    this.selectedTab$ = this.candidatesService.getSelectedTab$();
    this.showCredentialGrid();
  }

  private setCredentialParams(): void {
    const { isNavigatedFromOrganizationArea } = this.credentialStorage.getCredentialParams();

    this.isNavigatedFromOrganizationArea = isNavigatedFromOrganizationArea as boolean;
  }

  private showCredentialGrid(): void {
    this.selectedTab$
      .pipe(
        filter((tab) => tab === this.candidateTabsEnum.Credentials),
        take(1)
      )
      .subscribe(() => {
        this.renderCredentialGrid = true;
        this.cdr.markForCheck();
      });
  }
}
