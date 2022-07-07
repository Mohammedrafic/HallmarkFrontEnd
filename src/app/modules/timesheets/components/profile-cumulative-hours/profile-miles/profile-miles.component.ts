import { Component, Input } from '@angular/core';

import { CandidateMilesData } from '../../../interface';

@Component({
  selector: 'app-profile-miles',
  templateUrl: './profile-miles.component.html',
  styleUrls: ['./profile-miles.component.scss']
})
export class ProfileMilesComponent {
  @Input()
  public milesData: CandidateMilesData | null;
}
