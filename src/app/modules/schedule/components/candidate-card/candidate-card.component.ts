import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';

import { take } from 'rxjs';

import { DateWeekService } from '@core/services';
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
  startDate: string;

  constructor(
    private dateWeekService:DateWeekService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.watchForDateRangeChanges();

    this.candidateIconName = CandidateIconName(this.candidateData, this.selectedFilters);
    this.iconTooltipMessage = this.candidateIconName === 'compass' ?
      CreateTooltipForOrientation(this.candidateData, this.startDate) : this.candidateData.employeeNote;
  }

  private watchForDateRangeChanges(): void {
    this.dateWeekService.getRangeStream().pipe(
      take(1),
    ).subscribe((range: string[]) => {
      const [startDate] = range;
      this.startDate = startDate;
      this.cdr.markForCheck();
    });
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
