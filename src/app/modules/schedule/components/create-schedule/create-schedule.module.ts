import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from "@angular/forms";

import { ButtonModule, RadioButtonModule } from '@syncfusion/ej2-angular-buttons';
import { TimePickerModule } from "@syncfusion/ej2-angular-calendars";
import { DropDownListModule } from "@syncfusion/ej2-angular-dropdowns";
import { DialogModule } from "@syncfusion/ej2-angular-popups";

import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { ScheduleItemsModule } from '../schedule-items/schedule-items.module';
import { CreateScheduleService } from "../../services/create-schedule.service";
import { CreateScheduleComponent } from "./create-schedule.component";

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
  ],
  exports: [CreateScheduleComponent],
  providers: [CreateScheduleService],
})
export class CreateScheduleModule { }
