import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from "@angular/forms";

import { FeatherModule } from 'angular-feather';
import { ButtonModule, RadioButtonModule } from '@syncfusion/ej2-angular-buttons';
import { TimePickerModule } from "@syncfusion/ej2-angular-calendars";
import { DropDownListModule } from "@syncfusion/ej2-angular-dropdowns";
import { DialogModule } from "@syncfusion/ej2-angular-popups";

import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { ReplacementOrderDialogModule } from '../replacement-order-dialog/replacement-order-dialog.module';
import { ScheduleItemsModule } from '../schedule-items/schedule-items.module';
import { CreateScheduleComponent } from "./create-schedule.component";
import { Icons } from './create-schedules.constant';

@NgModule({
  declarations: [
    CreateScheduleComponent,
  ],
  imports: [
    CommonModule,
    ButtonModule,
    RadioButtonModule,
    ReactiveFormsModule,
    DialogModule,
    DropDownListModule,
    TimePickerModule,
    ScheduleItemsModule,
    TooltipContainerModule,
    ReplacementOrderDialogModule,
    FeatherModule.pick(Icons),
  ],
  exports: [CreateScheduleComponent],
})
export class CreateScheduleModule { }
