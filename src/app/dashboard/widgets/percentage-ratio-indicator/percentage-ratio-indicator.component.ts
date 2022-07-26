import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-percentage-ratio-indicator',
  templateUrl: './percentage-ratio-indicator.component.html',
  styleUrls: ['./percentage-ratio-indicator.component.scss']
})
export class PercentageRatioIndicatorComponent {
  @Input() public percentageRatio: number;
}
