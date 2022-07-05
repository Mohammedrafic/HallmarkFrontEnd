import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-navigation-panel',
  templateUrl: './navigation-panel.component.html',
  styleUrls: ['./navigation-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationPanelComponent {
  @Input()
  public prevLabel: string = 'Previous';

  @Input()
  public nextLabel: string = 'Next';

  @Input()
  public prevDisabled: boolean = false;

  @Input()
  public nextDisabled: boolean = false;

  @Output()
  public readonly prevClick: EventEmitter<void> = new EventEmitter<void>();

  @Output()
  public readonly nextClick: EventEmitter<void> = new EventEmitter<void>();
}
