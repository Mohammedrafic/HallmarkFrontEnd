import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-percentage-ratio-indicator',
  templateUrl: './percentage-ratio-indicator.component.html',
  styleUrls: ['./percentage-ratio-indicator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PercentageRatioIndicatorComponent {
  @Input() public percentageRatio: number;
  @Input() public slideBar: any = false;
}
