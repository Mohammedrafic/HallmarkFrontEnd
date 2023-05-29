import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  TrackByFunction,
  OnInit,
} from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

import { takeUntil } from 'rxjs';

import { Destroyable } from '@core/helpers';
import { MonthPickerService } from '@shared/components/month-date-picker';
import * as ScheduleInt from '../../interface';
import { CardClickEvent, DatesByWeekday, DroppedEvent, PositionDragEvent, ScheduleDateItem } from '../../interface';
import { GetGroupedDatesByWeekday } from './month-view.helper';
import { OpenPositionService } from '../../services';

@Component({
  selector: 'app-month-view-grid',
  templateUrl: './month-view-grid.component.html',
  styleUrls: ['./month-view-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthViewGridComponent extends Destroyable implements OnInit{
  @Input() scheduleData: ScheduleInt.ScheduleModelPage | null;
  @Input() selectedFilters: ScheduleInt.ScheduleFilters;
  @Input() selectedCandidatesSlot: Map<number, ScheduleInt.ScheduleDateSlot>;

  @Input() set datesRange(range: ScheduleInt.DateRangeOption[]) {
    const selectedMonth = this.monthPickerService.getSelectedMonth();
    const ranges: string[] = range.map((option) => option.dateText);
    this.dateList = GetGroupedDatesByWeekday(ranges, selectedMonth);
    this.cdr.markForCheck();
  }

  @Output() handleSelectCandidate: EventEmitter<ScheduleInt.ScheduleCandidate | null>
    = new EventEmitter<ScheduleInt.ScheduleCandidate | null>();
  @Output() monthClick: EventEmitter<CardClickEvent> = new EventEmitter<CardClickEvent>();
  @Output() dropElement: EventEmitter<CdkDragDrop<DroppedEvent>> = new EventEmitter<CdkDragDrop<DroppedEvent>>();

  public dateList: DatesByWeekday[][];
  public dragEvent:PositionDragEvent | null = null;

  trackByScheduleData: TrackByFunction<ScheduleInt.ScheduleModel> =
    (_: number, scheduleData: ScheduleInt.ScheduleModel) => scheduleData.id;
  trackByDateList: TrackByFunction<DatesByWeekday[]> =
    (_: number, date: DatesByWeekday[]) => date[0].dateSlot;
  trackByDateItem: TrackByFunction<DatesByWeekday> =
    (_: number, date: DatesByWeekday) => date.dateSlot;

  constructor(
    private cdr: ChangeDetectorRef,
    private monthPickerService: MonthPickerService,
    private openPositionService: OpenPositionService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.watchForDragEvent();
  }

  public selectDateSlot(
    date: string,
    candidate: ScheduleInt.ScheduleCandidate,
    isActive: boolean,
    cellDate?: ScheduleDateItem
  ): void {
    if(isActive) {
      this.monthClick.emit({ date, candidate, cellDate });
    }
  }

  public handleDroppedElement(event: CdkDragDrop<DroppedEvent>): void {
    this.dropElement.emit(event);
  }

  private watchForDragEvent(): void {
    this.openPositionService.getDragEventStream().pipe(
      takeUntil(this.componentDestroy()),
    ).subscribe((event: PositionDragEvent) => {
      this.dragEvent = {
        ...event,
      };
      this.cdr.markForCheck();
    });
  }
}
