import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { ScheduleCandidate, ScheduleFilters, ScheduleModel } from '../../interface';
import { CandidateIconName } from '../../constants';
import { CreateTooltipForOrientation, GetCandidateTypeTooltip, PrepareCandidate } from './candidate-card.helper';

@Component({
  selector: 'app-candidate-card',
  templateUrl: './candidate-card.component.html',
  styleUrls: ['./candidate-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandidateCardComponent implements OnInit, OnChanges {
  @Input() set candidate(schedule: ScheduleModel) {
    this.candidateData = PrepareCandidate(schedule.candidate);
  }
  
  @Input() selectedFilters: ScheduleFilters;
  @Input() showScheduledHours = true;

  candidateData: ScheduleCandidate;
  candidateIconName: string;
  iconTooltipMessage = '';
  candidateTypeTooltip: string;

  ngOnInit(): void {
    this.candidateIconName = CandidateIconName(this.candidateData, this.selectedFilters);
    this.iconTooltipMessage = this.candidateIconName === 'compass' ?
      CreateTooltipForOrientation(this.candidateData) : this.candidateData.employeeNote;
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
