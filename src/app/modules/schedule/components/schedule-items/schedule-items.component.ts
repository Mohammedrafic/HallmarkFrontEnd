import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { DateTimeHelper } from '@core/helpers';
import { DatePickerLimitations } from '@shared/components/icon-multi-date-picker/icon-multi-date-picker.interface';
import { ScheduleItemsService } from '../../services/schedule-items.service';
import { DateItem, CreateScheduleItem } from './schedule-items.interface';
import { ScheduleType } from '../../enums';
import { ScheduleSelectedSlots } from '../../interface';

@Component({
  selector: 'app-schedule-items',
  templateUrl: './schedule-items.component.html',
  styleUrls: ['./schedule-items.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleItemsComponent {
  @Input() datePickerLimitations: DatePickerLimitations;
  @Input() set scheduleSelectedSlots(scheduleSelectedSlots: ScheduleSelectedSlots) {
    if (scheduleSelectedSlots.candidates.length) {
      this.scheduleItems = this.scheduleItemsService.getScheduleItems(scheduleSelectedSlots);
    }
  }

  @Output() isEmpty: EventEmitter<void> = new EventEmitter<void>();

  scheduleItems: CreateScheduleItem[] = [];

  readonly scheduleType = ScheduleType;

  constructor(private scheduleItemsService: ScheduleItemsService) { }

  trackByCandidateId(index: number, item: CreateScheduleItem): number {
    return item.candidateId;
  }

  trackByDate(index: number, item: DateItem): string {
    return item.dateString;
  }

  removeScheduleItem(candidateId: number): void {
    this.scheduleItems = this.scheduleItems.filter((item: CreateScheduleItem) => item.candidateId !== candidateId);

    if (!this.scheduleItems.length) {
      this.isEmpty.emit();
    }
  }

  removeDateItem(candidateId: number, dateString: string, id: number | null): void {
    const scheduleItem = this.scheduleItems.find((item: CreateScheduleItem) => item.candidateId === candidateId);

    if (!scheduleItem) {
      return;
    }

    if (id) {
      scheduleItem.dateItems = scheduleItem.dateItems.filter((item: DateItem) => item.id !== id);
    } else {
      scheduleItem.dateItems = scheduleItem.dateItems.filter((item: DateItem) => item.dateString !== dateString);
    }

    scheduleItem.selectedDates = this.scheduleItemsService.getSelectedDates(scheduleItem);

    if (!scheduleItem.dateItems.length) {
      this.removeScheduleItem(candidateId);
    }
  }

  updateDateItems(dates: Date[], candidateId: number): void {
    const scheduleItem = this.scheduleItems.find((item: CreateScheduleItem) => item.candidateId === candidateId);

    if (!scheduleItem) {
      return;
    }

    if (!dates.length) {
      this.removeScheduleItem(candidateId);
      return;
    }

    scheduleItem.selectedDates = dates;
    scheduleItem.dateItems = this.scheduleItemsService.getScheduleDateItems(
      dates.map((date: Date) => DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(date))),
      candidateId
    );
  }
}
