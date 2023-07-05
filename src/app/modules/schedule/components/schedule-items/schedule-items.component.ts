import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { filter, takeUntil } from 'rxjs';

import { Destroyable } from '@core/helpers';
import { DatePickerLimitations } from '@shared/components/icon-multi-date-picker/icon-multi-date-picker.interface';
import { ScheduleItemsService } from '../../services/schedule-items.service';
import { DateItem, CreateScheduleItem } from './schedule-items.interface';
import { ScheduleBookingErrors, ScheduleCandidate, ScheduleDay, ScheduleSelectedSlots } from '../../interface';
import { GetCountErrors, ScheduleItemsWithErrors } from '../../helpers';
import { ScheduleCircleType, ScheduleItemType } from '../../constants';
import { IrpOrderType } from '@shared/enums/order-type';
import { CreateScheduleService } from '../../services';

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
    this.setScheduleItems(scheduleSelectedSlots);
  }

  @Output() isEmpty: EventEmitter<void> = new EventEmitter<void>();

  scheduleItems: CreateScheduleItem[] = [];
  itemsErrorCounter: number;
  ltaOrder: IrpOrderType = IrpOrderType.LongTermAssignment;

  readonly scheduleCircleType: Record<string, string> = ScheduleCircleType;
  selectedType: ScheduleItemType = ScheduleItemType.Book;

  public scheduleSelectedSlot: ScheduleSelectedSlots;

  constructor(
    private scheduleItemsService: ScheduleItemsService,
    private createScheduleService:CreateScheduleService,
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
    const selectedCandidate =
      this.scheduleItemsService.getSelectedCandidate(this.scheduleSelectedSlot.candidates, candidateId);
    this.scheduleItems = this.scheduleItems.filter((item: CreateScheduleItem) => item.candidateId !== candidateId);
    this.scheduleItemsService.removeCandidateItem.next({
      date: null,
      candidate: selectedCandidate as ScheduleCandidate,
    });

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
    this.setRemovedItem(dateValue, candidateId, id);

    if (!scheduleItem.dateItems.length) {
      this.removeScheduleItem(candidateId);
    }
  }

  private setRemovedItem(dateValue: string, candidateId: number, id: number | null): void {
    const formatDate = dateValue.split('T');
    const selectedCandidate =
      this.scheduleItemsService.getSelectedCandidate(this.scheduleSelectedSlot.candidates, candidateId);

    if(id) {
      selectedCandidate.days = [...selectedCandidate.days].filter((day: ScheduleDay) => day.id !== id);
    }

    this.scheduleItemsService.removeCandidateItem.next({
      date: formatDate[0],
      candidate: selectedCandidate as ScheduleCandidate,
    });
  }

  /*todo: uncomment in future implementation -->*/
  /*updateDateItems(dates: Date[], candidateId: number): void {
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
      dates.map((date: Date) => DateTimeHelper.setInitHours(DateTimeHelper.setUtcTimeZone(date))),
      candidateId
    );
  }*/

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
