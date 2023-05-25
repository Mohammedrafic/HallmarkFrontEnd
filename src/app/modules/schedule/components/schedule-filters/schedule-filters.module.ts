import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";

import { MultiSelectAllModule } from "@syncfusion/ej2-angular-dropdowns";

import { FilterDialogModule } from "@shared/components/filter-dialog/filter-dialog.module";
import { ScheduleFiltersComponent } from './schedule-filters.component';
import { SwitchModule } from '@syncfusion/ej2-angular-buttons';

@NgModule({
  declarations: [
    ScheduleFiltersComponent,
  ],
  imports: [
    CommonModule,
    MultiSelectAllModule,
    FilterDialogModule,
    ReactiveFormsModule,
    SwitchModule
  ],
  exports: [ScheduleFiltersComponent],
})
export class ScheduleFiltersModule {}
