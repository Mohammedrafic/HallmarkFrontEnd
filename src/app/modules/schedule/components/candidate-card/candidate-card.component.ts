import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { ScheduleCandidate, ScheduleFilters, ScheduleModel } from '../../interface';
import { CandidateIconName } from '../../constants';
import { GetCandidateTypeTooltip } from './candidate-card.helper';

@Component({
  selector: 'app-candidate-card',
  templateUrl: './candidate-card.component.html',
  styleUrls: ['./candidate-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandidateCardComponent implements OnInit, OnChanges {
  @Input() set candidate(schedule: ScheduleModel) {
    if (schedule.candidate.workCommitments && schedule.candidate.workCommitments.length) {
      schedule.candidate.workCommitmentText = 'Work Commitment: ' + schedule.candidate.workCommitments.join(', ');
    } else {
      schedule.candidate.workCommitmentText = 'Work Commitment';
    }

    this.candidateData = schedule.candidate;
  }
  @Input() selectedFilters: ScheduleFilters;

  candidateData: ScheduleCandidate;
  candidateIconName: string;
  iconTooltipMessage = '';
  candidateTypeTooltip: string;

  ngOnInit(): void {
    this.iconTooltipMessage = this.candidateData.isOriented ? this.candidateData.employeeNote : 'Not Oriented';
    this.candidateIconName = CandidateIconName(this.candidateData);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedFilters']?.currentValue && changes['candidate']?.currentValue) {
      this.createToolTipForSchedule(changes['candidate'].currentValue, changes['selectedFilters'].currentValue);
    }
  }

  private createToolTipForSchedule(schedule: ScheduleModel, filters: ScheduleFilters ): void {
    this.candidateTypeTooltip = GetCandidateTypeTooltip(
      schedule.candidate.ltaAssignment,
      filters.startDate as string,
      filters.endDate as string,
    );
  }
}
