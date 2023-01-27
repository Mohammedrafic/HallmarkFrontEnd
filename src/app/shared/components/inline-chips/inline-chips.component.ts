import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output,
} from '@angular/core';

import { ChipDeletedEventArgs } from '@syncfusion/ej2-angular-buttons';

import { ChipDeleteEventType, ChipItem } from './inline-chips.interface';

/**
 * TODO: think of making chips not a plain text.
 */
@Component({
  selector: 'app-inline-chips',
  templateUrl: './inline-chips.component.html',
  styleUrls: ['./inline-chips.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InlineChipsComponent {
  @Input() set setChips(chips: ChipItem[]) {
    this.showClearAllBtn = chips && !!chips.length;
    this.chipsData = chips;
  }
  
  @Output() filterChipDelted: EventEmitter<ChipDeleteEventType> = new EventEmitter();

  chipsExpanded = false;

  chipsData: ChipItem[];

  showClearAllBtn = false;

  expandBtnText = 'Show more';

  contentOverflowed = false;

  constructor(
    private cd: ChangeDetectorRef,
  ) {}

  deleteFilterChip(event: ChipDeletedEventArgs, groupField: string): void {
    this.filterChipDelted.emit({
      field: groupField,
      value: event.data as string,
    });

    if (this.chipsExpanded && !this.contentOverflowed) {
      this.chipsExpanded = false;
    }
  }

  toggleExpandMode(): void {
    this.chipsExpanded = !this.chipsExpanded;
    this.expandBtnText = this.chipsExpanded ? 'Show less' : 'Show more';
  }

  toggleShowButton(event: boolean): void {
    this.contentOverflowed = event;
  }

  clearAllChips(): void {
    this.chipsExpanded = false;
    this.filterChipDelted.emit(null);
  }

  trackByText(index: number, item: string): string {
    return item;
  }

  trackByField(index: number, item: ChipItem): string {
    return item.groupField;
  }
}
