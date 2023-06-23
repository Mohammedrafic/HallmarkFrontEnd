import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule, SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { TimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { GridModule, PagerModule } from '@syncfusion/ej2-angular-grids';
import { NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { FeatherModule } from 'angular-feather';
import { Edit, Trash2, Upload } from 'angular-feather/icons';

import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { SharedModule } from '@shared/shared.module';

import { ShiftsService } from './shifts.service';
import { ShiftsComponent } from './shifts.component';
import { ShiftsRoutingModule } from './shifts-routing.module';

const icons = {
  Upload,
  Edit,
  Trash2,
};

@NgModule({
  declarations: [ShiftsComponent],
  imports: [
    CommonModule,
    ShiftsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    PagerModule,
    GridModule,
    ButtonModule,
    DropDownListModule,
    NumericTextBoxModule,
    DialogModule,
    TimePickerModule,
    DropDownButtonModule,
    TooltipContainerModule,
    SwitchModule,
    FeatherModule.pick(icons),
  ],
  providers: [ShiftsService],
})
export class ShiftsModule { }
