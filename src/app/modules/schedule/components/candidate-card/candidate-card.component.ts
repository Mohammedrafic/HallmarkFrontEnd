import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { ScheduleCandidate } from '../../interface/schedule.interface';
import { CandidateIconName } from '../../constants/schedule-grid.constant';

@Component({
  selector: 'app-candidate-card',
  templateUrl: './candidate-card.component.html',
  styleUrls: ['./candidate-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandidateCardComponent implements OnInit {
  @Input() candidate: ScheduleCandidate;

  candidateIconName: string;

  iconTooltipMessage = '';

  ngOnInit(): void {
    this.iconTooltipMessage = this.candidate.isOriented ? this.candidate.employeeNote : 'Not Oriented';
    this.candidateIconName = CandidateIconName(this.candidate);
  }
}
