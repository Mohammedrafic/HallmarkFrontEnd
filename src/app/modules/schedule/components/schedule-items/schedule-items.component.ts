import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { filter, takeUntil } from 'rxjs';

import { DateTimeHelper, Destroyable } from '@core/helpers';
import { DatePickerLimitations } from '@shared/components/icon-multi-date-picker/icon-multi-date-picker.interface';
import { ScheduleItemsService } from '../../services/schedule-items.service';
import { DateItem, CreateScheduleItem } from './schedule-items.interface';
import { ScheduleType } from '../../enums';
import { ScheduleBookingErrors, ScheduleSelectedSlots } from '../../interface';
import { GetCountErrors, ScheduleItemsWithErrors } from '../../helpers';
import { ScheduleItemType } from '../../constants';
import { IrpOrderType } from '@shared/enums/order-type';

@Component({
  selector: 'app-schedule-items',
  templateUrl: './schedule-items.component.html',
  styleUrls: ['./schedule-items.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleItemsComponent extends Destroyable implements OnInit {
  @Input() datePickerLimitations: DatePickerLimitations;
  @Input() set selectedScheduleType(value: ScheduleItemType | null) {
    if(value !== null) {
      this.setScheduleType(value);
    }
  }

  @Input() set scheduleSelectedSlots(scheduleSelectedSlots: ScheduleSelectedSlots) {
    if (scheduleSelectedSlots.candidates.length) {
      this.setScheduleItems(scheduleSelectedSlots);
    }
  }
  @Output() isEmpty: EventEmitter<void> = new EventEmitter<void>();

  scheduleItems: CreateScheduleItem[] = [];
  itemsErrorCounter: number;
  ltaOrder: IrpOrderType = IrpOrderType.LongTermAssignment;

  readonly scheduleType = ScheduleType;
  selectedType: ScheduleItemType = ScheduleItemType.Book;

  private scheduleSelectedSlot: ScheduleSelectedSlots;

  constructor(
    private scheduleItemsService: ScheduleItemsService,
    private cdr: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit(): void {
    this.watchForScheduleItemsError();
  }

  trackByCandidateId(index: number, item: CreateScheduleItem): number {
    return item.candidateId;
  }

  trackByDate(index: number, item: DateItem): string {
    return item.dateValue;
  }

  removeScheduleItem(candidateId: number): void {
    this.scheduleItems = this.scheduleItems.filter((item: CreateScheduleItem) => item.candidateId !== candidateId);

    if (!this.scheduleItems.length) {
      this.isEmpty.emit();
    }
  }

  removeDateItem(candidateId: number, dateValue: string, id: number | null): void {
    const scheduleItem = this.scheduleItems.find((item: CreateScheduleItem) => item.candidateId === candidateId);

    if (!scheduleItem) {
      return;
    }

    if (id) {
      scheduleItem.dateItems = scheduleItem.dateItems.filter((item: DateItem) => item.id !== id);
    } else {
      scheduleItem.dateItems = scheduleItem.dateItems.filter((item: DateItem) => item.dateValue !== dateValue);
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

  private setScheduleType(value: ScheduleItemType): void {
    this.selectedType = value;
    this.scheduleItems = this.scheduleItemsService.getScheduleItems(this.scheduleSelectedSlot, value);
  }

  private setScheduleItems(scheduleSelectedSlots: ScheduleSelectedSlots): void {
    this.scheduleSelectedSlot = scheduleSelectedSlots;
    this.scheduleItems = this.scheduleItemsService.getScheduleItems(scheduleSelectedSlots, ScheduleItemType.Book);
  }

  private watchForScheduleItemsError(): void {
    this.scheduleItemsService.getErrorsStream().pipe(
      filter(Boolean),
      takeUntil(this.componentDestroy())
    ).subscribe((errors: ScheduleBookingErrors[]) => {
      this.itemsErrorCounter = GetCountErrors(errors);
      this.scheduleItems = ScheduleItemsWithErrors(this.scheduleItems, errors);
      this.cdr.markForCheck();
    });
  }
}
