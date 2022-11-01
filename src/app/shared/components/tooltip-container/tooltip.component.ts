import { ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
  selector: 'app-tooltip-container',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipComponent {
  @Input() public message: string;
  @Input() public showToolTip: boolean;
}
