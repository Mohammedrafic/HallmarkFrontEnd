import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { ScheduleCandidate } from '../../interface/schedule.model';
import { CandidateIconNameMap } from '../../constants/schedule-grid.conts';
import { ScheduleCandidateType } from '../../enums';

@Component({
  selector: 'app-candidate-card',
  templateUrl: './candidate-card.component.html',
  styleUrls: ['./candidate-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandidateCardComponent implements OnInit {
  @Input() candidate: ScheduleCandidate;

  candidateIconNameMap: Map<ScheduleCandidateType, string> = CandidateIconNameMap;

  iconTooltipMessage = '';

  ngOnInit(): void {
    this.iconTooltipMessage = this.candidate.type === ScheduleCandidateType.NotFilled ? 'Not Oriented' : 'General Note';
  }
}
