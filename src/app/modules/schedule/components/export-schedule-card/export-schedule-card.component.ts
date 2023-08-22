import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ScheduleExportCard } from '../../helpers/schedule-export.helper';

@Component({
  selector: 'app-export-schedule-card',
  templateUrl: './export-schedule-card.component.html',
  styleUrls: ['./export-schedule-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportScheduleCardComponent extends ScheduleExportCard {}
