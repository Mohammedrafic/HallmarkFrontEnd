import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from "@angular/forms";

import { ButtonModule, CheckBoxModule, RadioButtonModule } from '@syncfusion/ej2-angular-buttons';
import { TimePickerModule } from "@syncfusion/ej2-angular-calendars";
import { DropDownListModule } from "@syncfusion/ej2-angular-dropdowns";
import { TabAllModule } from '@syncfusion/ej2-angular-navigations';
import { DialogModule } from "@syncfusion/ej2-angular-popups";
import { FeatherModule } from 'angular-feather';
import { Plus } from 'angular-feather/icons';

import { DatepickerModule } from '@shared/components/form-controls/datepicker/datepicker.module';
import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { ReplacementOrderDialogModule } from '../replacement-order-dialog/replacement-order-dialog.module';
import { EditScheduleService } from './edit-schedule.service';
import { EditScheduleComponent } from './edit-schedule.component';


@NgModule({
  declarations: [
    EditScheduleComponent,
  ],
  imports: [
    CommonModule,
    ButtonModule,
    RadioButtonModule,
    ReactiveFormsModule,
    DialogModule,
    DropDownListModule,
    TimePickerModule,
    TooltipContainerModule,
    DatepickerModule,
    CheckBoxModule,
    TabAllModule,
    ReplacementOrderDialogModule,
    FeatherModule.pick({ Plus }),
  ],
  exports: [EditScheduleComponent],
  providers: [EditScheduleService],
})
export class EditScheduleModule { }
