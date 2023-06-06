import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseExportComponent } from './components/base-export/base-export.component';
import { ScheduleExportRoutingModule } from './schedule-export-routing.module';

@NgModule({
  declarations: [BaseExportComponent],
  exports: [],
  imports: [ScheduleExportRoutingModule, CommonModule],
})
export class ScheduleExportModule {}
