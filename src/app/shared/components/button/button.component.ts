import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input } from '@angular/core';

import { ButtonTypeEnum } from '@shared/components/button/enums/button-type.enum';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  @Input() public badgeText: number | undefined;
  @Input() public iconName: string;
  @Input() public tabindex: number;
  @Input() public text: string;
  @Input() public type: ButtonTypeEnum;

  @Output() public readonly clickEmitter: EventEmitter<void> = new EventEmitter();
}
