import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-navigation-panel',
  templateUrl: './navigation-panel.component.html',
  styleUrls: ['./navigation-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationPanelComponent {
  @Input()
  public isMobile = false;

  @Input()
  public prevLabel = 'Previous';

  @Input()
  public nextLabel = 'Next';

  @Input()
  public prevDisabled = false;

  @Input()
  public nextDisabled = false;

  @Output()
  public readonly prevClick: EventEmitter<void> = new EventEmitter<void>();

  @Output()
  public readonly nextClick: EventEmitter<void> = new EventEmitter<void>();
}
