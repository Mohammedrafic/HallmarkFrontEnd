import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { ScheduleExportCard } from '../../../helpers/schedule-export.helper';
import { Schedules } from '../../../interface';

@Component({
  selector: 'app-export-month-card',
  templateUrl: './export-month-card.component.html',
  styleUrls: ['./export-month-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportMonthCardComponent extends ScheduleExportCard {

  @Input() isDateActive: boolean;
  @Input() currentDate: string;
}
