import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { Subject } from 'rxjs';
import { CandidatesService } from '../services/candidates.service';
import { CandidateWorkCommitment } from './models/candidate-work-commitment.model';

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
    private cdr: ChangeDetectorRef,
    public candidateService: CandidatesService
  ) {
    super();
  }

  public ngOnInit(): void {

  }
}
