import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { ScheduleCandidate, ScheduleModel } from '../../interface';
import { CandidateIconName } from '../../constants';
import { GetCandidateTypeTooltip } from './candidate-card.helper';

@Component({
  selector: 'app-candidate-card',
  templateUrl: './candidate-card.component.html',
  styleUrls: ['./candidate-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandidateCardComponent implements OnInit {
  @Input() set candidate(schedule: ScheduleModel) {
    if (schedule.candidate.workCommitments && schedule.candidate.workCommitments.length) {
      schedule.candidate.workCommitmentText = 'Work Commitment: ' + schedule.candidate.workCommitments.join(', ');
    } else {
      schedule.candidate.workCommitmentText = 'Work Commitment';
    }

    this.createToolTipForSchedule(schedule);
    this.candidateData = schedule.candidate;
  }

  candidateData: ScheduleCandidate;
  candidateIconName: string;
  iconTooltipMessage = '';
  candidateTypeTooltip: string;

  ngOnInit(): void {
    this.iconTooltipMessage = this.candidateData.isOriented ? this.candidateData.employeeNote : 'Not Oriented';
    this.candidateIconName = CandidateIconName(this.candidateData);
  }

  private createToolTipForSchedule(schedule: ScheduleModel): void {
    this.candidateTypeTooltip = GetCandidateTypeTooltip(schedule.candidate.ltaAssignment);
  }
}
