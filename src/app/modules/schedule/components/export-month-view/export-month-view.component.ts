import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
  TrackByFunction,
} from '@angular/core';
import { MonthPickerService } from '@shared/components/month-date-picker';
import * as ScheduleInt from '../../interface';
import { DatesByWeekday, PositionDragEvent, ScheduleExport } from '../../interface';
import { GetGroupedDatesByWeekday } from '../month-view-grid';

@Component({
  selector: 'app-export-month-view',
  templateUrl: './export-month-view.component.html',
  styleUrls: ['./export-month-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportMonthViewComponent {
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
    private monthPickerService: MonthPickerService
  ) {
  }

}
