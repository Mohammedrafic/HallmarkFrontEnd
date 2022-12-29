import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-agency-name',
  templateUrl: './agency-name.component.html',
  styleUrls: ['./agency-name.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgencyNameComponent {
  @Input() public agencyName: string;
  @Input() public isMsp: boolean;
}
