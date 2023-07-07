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
import { CardClickEvent, DatesByWeekday, DroppedEvent, PositionDragEvent, ScheduleDateItem, ScheduleExport } from '../../interface';
import { OpenPositionService } from '../../services';
import { GetGroupedDatesByWeekday } from '../month-view-grid';

@Component({
  selector: 'app-export-month-view',
  templateUrl: './export-month-view.component.html',
  styleUrls: ['./export-month-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportMonthViewComponent extends Destroyable implements OnInit {
  @Input() scheduleData: ScheduleExport[];
  @Input() selectedCandidatesSlot: Map<number, ScheduleInt.ScheduleDateSlot>;

  @Input() set datesRange(range: ScheduleInt.DateRangeOption[]) {
    const selectedMonth = this.monthPickerService.getSelectedMonth();
    const ranges: string[] = range.map((option) => option.dateText);
    this.dateList = GetGroupedDatesByWeekday(ranges, selectedMonth);
    this.cdr.markForCheck();
  }

  public dateList: DatesByWeekday[][];
  public dragEvent:PositionDragEvent | null = null;

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
  }

}
