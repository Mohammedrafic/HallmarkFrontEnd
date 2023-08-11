import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { DropDownListModule, MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';

import { DatepickerModule } from '@shared/components/form-controls/datepicker/datepicker.module';
import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { ValidateDirectiveModule } from '@shared/directives/validate-directive/validate-directive.module';

import { EmployeeProfileFormService } from './services/employee-profile-form.service';
import { EmployeeProfileFormComponent } from './employee-profile-form.component';

@NgModule({
  declarations: [EmployeeProfileFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatepickerModule,
    ValidateDirectiveModule,
    DropDownListModule,
    MultiSelectModule,
    TooltipContainerModule,
  ],
  exports: [
    EmployeeProfileFormComponent,
  ],
  providers: [EmployeeProfileFormService],
})
export class EmployeeProfileFormModule { }
