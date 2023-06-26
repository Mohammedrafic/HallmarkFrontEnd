import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule, CheckBoxModule, SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { GridModule, PagerModule } from '@syncfusion/ej2-angular-grids';
import { NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { FeatherModule } from 'angular-feather';
import { Edit, Sliders, Trash2, Upload } from 'angular-feather/icons';

import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { SharedModule } from '@shared/shared.module';

import { PayRateComponent } from './pay-rate.component';
import { PayrateSetupComponent } from './payrate-setup/payrate-setup.component';
import { PayRateRoutingModule } from './pay-rate-routing.module';

const icons = {
  Upload,
  Sliders,
  Edit,
  Trash2,
};

@NgModule({
  declarations: [
    PayRateComponent,
    PayrateSetupComponent,
  ],
  imports: [
    CommonModule,
    PayRateRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    PagerModule,
    GridModule,
    ButtonModule,
    DropDownListModule,
    CheckBoxModule,
    NumericTextBoxModule,
    DatePickerModule,
    SwitchModule,
    DropDownButtonModule,
    TooltipContainerModule,
    FeatherModule.pick(icons),
  ],
})
export class PayRateModule { }
