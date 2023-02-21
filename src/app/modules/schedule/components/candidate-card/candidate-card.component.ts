import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { ScheduleCandidate } from '../../interface';
import { CandidateIconName } from '../../constants';

@Component({
  selector: 'app-candidate-card',
  templateUrl: './candidate-card.component.html',
  styleUrls: ['./candidate-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandidateCardComponent implements OnInit {
  @Input() set candidate(candidate: ScheduleCandidate) {
    if (candidate.workCommitments && candidate.workCommitments.length) {
      candidate.workCommitmentText = 'Work Commitment: ' + candidate.workCommitments.join(', ');
    } else {
      candidate.workCommitmentText = 'Work Commitment';
    }


    this.candidateData = candidate;
  }

  candidateData: ScheduleCandidate;

  candidateIconName: string;

  iconTooltipMessage = '';

  ngOnInit(): void {
    this.iconTooltipMessage = this.candidateData.isOriented ? this.candidateData.employeeNote : 'Not Oriented';
    this.candidateIconName = CandidateIconName(this.candidateData);
  }
}
