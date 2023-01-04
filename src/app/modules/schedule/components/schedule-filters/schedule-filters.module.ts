import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";

import { MultiSelectAllModule } from "@syncfusion/ej2-angular-dropdowns";

import { FilterDialogModule } from "@shared/components/filter-dialog/filter-dialog.module";
import { ScheduleFiltersComponent } from './schedule-filters.component';
import { ScheduleFiltersService } from '../../services/schedule-filters.service';

@NgModule({
  declarations: [
    ScheduleFiltersComponent,
  ],
  imports: [
    CommonModule,
    MultiSelectAllModule,
    FilterDialogModule,
    ReactiveFormsModule,
  ],
  exports: [ScheduleFiltersComponent],
  providers: [ScheduleFiltersService],
})
export class ScheduleFiltersModule {}
