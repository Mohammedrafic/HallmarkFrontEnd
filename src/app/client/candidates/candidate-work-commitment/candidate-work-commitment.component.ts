import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { CandidatesService } from '../services/candidates.service';
import { CandidateWorkCommitment } from './models/candidate-work-commitment.model';

@Component({
  selector: 'app-candidate-work-commitment',
  templateUrl: './candidate-work-commitment.component.html',
  styleUrls: ['./candidate-work-commitment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandidateWorkCommitmentComponent implements OnDestroy {
  public dialogSubject$ = new Subject<{ isOpen: boolean, isEdit: boolean, commitment?: CandidateWorkCommitment }>();
  public refreshSubject$ = new Subject<void>();

  constructor(
    public candidateService: CandidatesService
  ) { }

  public ngOnDestroy(): void {
    this.candidateService.setActiveEmployeeWorkCommitment(null);
  }
}
