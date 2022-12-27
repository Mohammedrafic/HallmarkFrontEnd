import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ScheduleCandidate } from '../../interface/schedule.model';
import { CandidateIconNameMap } from '../../constants/schedule-grid.conts';
import { ScheduleCandidateType } from '../../enums';

@Component({
  selector: 'app-candidate-card',
  templateUrl: './candidate-card.component.html',
  styleUrls: ['./candidate-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandidateCardComponent {
  @Input() candidate: ScheduleCandidate;

  candidateIconNameMap: Map<ScheduleCandidateType, string> = CandidateIconNameMap;
}
