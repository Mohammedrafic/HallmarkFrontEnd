import { ChangeDetectionStrategy, Component, Input} from '@angular/core';

import { REQUIRED_PERMISSIONS } from "@shared/constants";
import { Position } from '@syncfusion/ej2-popups/src/tooltip/tooltip';

@Component({
  selector: 'app-tooltip-container',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipComponent {
  @Input() public message: string = REQUIRED_PERMISSIONS;
  @Input() public showToolTip: boolean;
  @Input() public position: Position = 'BottomCenter';
}
