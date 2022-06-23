import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ITabConfigInterface } from '../../interface/i-tab-config.interface';
import { SelectingEventArgs } from '@syncfusion/ej2-angular-navigations';

@Component({
  selector: 'app-tab-dynamic-navigation',
  templateUrl: './tab-dynamic-navigation.component.html',
  styleUrls: ['./tab-dynamic-navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabDynamicNavigationComponent {
  @Input() tabConfig: ITabConfigInterface[];
  @Output() changeTab: EventEmitter<number> = new EventEmitter<number>();

  public trackByFn(idx: number): number {
    return idx;
  }

  public onSelect(selectEvent: SelectingEventArgs): void {
    this.changeTab.emit(selectEvent.selectingIndex);
  }
}
