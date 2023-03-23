import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RnUtilizationWidgetComponent } from './rn-utilization-widget.component';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { WidgetWrapperModule } from '../widget-wrapper/widget-wrapper.module';
import { FeatherModule } from 'angular-feather';
import { Info } from 'angular-feather/icons';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DropDownListModule, MultiSelectAllModule, MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { MultiselectDropdownModule } from '@shared/components/form-controls/multiselect-dropdown/multiselect-dropdown.module';



@NgModule({
  imports: [WidgetWrapperModule,CommonModule,MultiSelectModule,MultiSelectAllModule,MultiselectDropdownModule,DropDownListModule,DatePickerModule,TooltipModule,FeatherModule.pick({ Info })],
   exports: [RnUtilizationWidgetComponent],
    declarations: [RnUtilizationWidgetComponent],
})
export class RnUtilizationWidgetModule { }


