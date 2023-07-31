import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { ScheduleExportCard } from '../../../helpers/schedule-export.helper';

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
