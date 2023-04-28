import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvailableEmployeeComponent } from './available-employee.component';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { WidgetWrapperModule } from '../widget-wrapper/widget-wrapper.module';
import { FeatherModule } from 'angular-feather';
import { Info } from 'angular-feather/icons';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DropDownListModule, MultiSelectAllModule, MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { MultiselectDropdownModule } from '@shared/components/form-controls/multiselect-dropdown/multiselect-dropdown.module';
import { ReactiveFormsModule } from '@angular/forms';
// import { RnUtilizationFormService } from './rn-utilization-widget-service';
import { ProgressBarAllModule } from '@syncfusion/ej2-angular-progressbar';
import { GridModule } from '@syncfusion/ej2-angular-grids';
import { AgGridModule } from '@ag-grid-community/angular';
import {
  Grid
} from 'angular-feather/icons';

const Icon = {
  Grid
};

@NgModule({
  imports: [ProgressBarAllModule, WidgetWrapperModule,CommonModule,MultiSelectModule,MultiSelectAllModule,
    GridModule,AgGridModule,
    MultiselectDropdownModule,DropDownListModule,FeatherModule.pick(Icon)],
   exports: [AvailableEmployeeComponent],
   declarations: [AvailableEmployeeComponent]
    
})
export class AvailableEmployeeModule { }


