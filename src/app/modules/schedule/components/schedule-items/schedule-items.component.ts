import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { DateTimeHelper } from '@core/helpers';
import { ScheduleItemsService } from 'src/app/modules/schedule/services/schedule-items.service';
import { DateItem, CreateScheduleItem } from '../schedule-items/schedule-items.interface';
import { ScheduleSelectedSlots } from '../../interface/schedule.model';
import { ScheduleType } from '../../enums';

@Component({
  selector: 'app-schedule-items',
  templateUrl: './schedule-items.component.html',
  styleUrls: ['./schedule-items.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleItemsComponent {
  @Input() minDate: Date;
  @Input() maxDate: Date;
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

  removeDateItem(candidateId: number, dateString: string): void {
    const scheduleItem = this.scheduleItems.find((item: CreateScheduleItem) => item.candidateId === candidateId);

    if (!scheduleItem) {
      return;
    }

    scheduleItem.dateItems = scheduleItem.dateItems.filter((item: DateItem) => item.dateString !== dateString);
    scheduleItem.selectedDates = scheduleItem.dateItems.map((item: DateItem) => item.date);

    if (!scheduleItem.dateItems.length) {
      this.removeScheduleItem(candidateId);
    }
  }

  updateDateItems(dates: Date[], candidateId: number): void {
    const scheduleItem = this.scheduleItems.find((item: CreateScheduleItem) => item.candidateId === candidateId);
    const dateItems: DateItem[] = [];

    if (!scheduleItem) {
      return;
    }

    if (!dates.length) {
      this.removeScheduleItem(candidateId);
      return;
    }

    dates.forEach((date: Date) => {
      const dateString = DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(date));
      const dateItem = scheduleItem.dateItems.find((item: DateItem) => item.dateString === dateString);

      if (dateItem) {
        dateItems.push(dateItem);
      } else {
        dateItems.push({ dateString, date });
      }
    });

    scheduleItem.selectedDates = dates;
    scheduleItem.dateItems = dateItems;
  }
}
