import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { SelectingEventArgs } from '@syncfusion/ej2-angular-navigations';

import { ITabConfigInterface } from '../../interface';

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
