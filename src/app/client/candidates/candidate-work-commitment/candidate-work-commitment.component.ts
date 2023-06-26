import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, filter, takeUntil } from 'rxjs';
import { CandidatesService } from '../services/candidates.service';
import { CandidateWorkCommitment } from './models/candidate-work-commitment.model';
import { CandidateTabsEnum } from '@client/candidates/enums';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';

@Component({
  selector: 'app-candidate-work-commitment',
  templateUrl: './candidate-work-commitment.component.html',
  styleUrls: ['./candidate-work-commitment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandidateWorkCommitmentComponent extends DestroyableDirective implements OnInit, OnDestroy {
  public dialogSubject$ = new Subject<{ isOpen: boolean, isEdit: boolean, commitment?: CandidateWorkCommitment }>();
  public refreshSubject$ = new Subject<void>();

  constructor(
    public candidateService: CandidatesService
  ) {
    super();
  }

  ngOnInit(): void {
    this.watchOnTabChange();
  }

  private watchOnTabChange(): void {
    this.candidateService
      .getSelectedTab$()
      .pipe(
        filter((tab) => tab === CandidateTabsEnum.WorkCommitment),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.refreshSubject$.next();
      });
  }

  public override ngOnDestroy(): void {
    this.candidateService.setActiveEmployeeWorkCommitment(null);
    super.ngOnDestroy();
  }
}
