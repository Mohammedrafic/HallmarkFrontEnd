import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";

import { ListBoxModule, MultiSelectAllModule } from "@syncfusion/ej2-angular-dropdowns";

import { FilterDialogModule } from "@shared/components/filter-dialog/filter-dialog.module";
import { ScheduleFiltersComponent } from './schedule-filters.component';
import { ButtonModule, ChipListModule, SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { TimePickerAllModule } from '@syncfusion/ej2-angular-calendars';
import { ScheduleSortFiltersComponent } from './schedule-sort-filters/schedule-sort-filters.component';
import { DialogModule, TooltipModule } from '@syncfusion/ej2-angular-popups';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FeatherModule } from 'angular-feather';
import { ChevronDown, Info, Trash2 } from 'angular-feather/icons';
const sidebarIcons = {
  ChevronDown,
  Trash2,
  Info
};
@NgModule({
  declarations: [
    ScheduleFiltersComponent,
    ScheduleSortFiltersComponent,
  ],
  imports: [
    CommonModule,
    MultiSelectAllModule,
    FilterDialogModule,
    ReactiveFormsModule,
    TimePickerAllModule,
    SwitchModule,
    DialogModule, ChipListModule, ButtonModule,
    ListBoxModule,
    DragDropModule,
    FeatherModule.pick(sidebarIcons),
    TooltipModule
  ],
  exports: [ScheduleFiltersComponent,ScheduleSortFiltersComponent],

})
export class ScheduleFiltersModule {}
