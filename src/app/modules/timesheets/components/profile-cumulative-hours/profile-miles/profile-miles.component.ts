import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { CandidateMilesData } from '../../../interface';

@Component({
  selector: 'app-profile-miles',
  templateUrl: './profile-miles.component.html',
  styleUrls: ['./profile-miles.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileMilesComponent {
  @Input()
  public milesData: CandidateMilesData;
}
