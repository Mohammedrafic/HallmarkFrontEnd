import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';
import { DatesPeriods } from '../../constants/schedule-grid.conts';
import { DatePeriodId } from '../../enums/schedule';

@Component({
  selector: 'app-schedule-grid',
  templateUrl: './schedule-grid.component.html',
  styleUrls: ['./schedule-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleGridComponent implements OnInit {
  datesPeriods: ItemModel[] = DatesPeriods;
  activePeriod: DatePeriodId = DatePeriodId.TwoWeeks;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  changeActiveDatePeriod(id: string | undefined): void {
    this.activePeriod = id as DatePeriodId;
    this.cdr.detectChanges();
  }
}
