import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule, CheckBoxModule, ChipListModule, SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { GridModule, PagerModule } from '@syncfusion/ej2-angular-grids';
import { NumericTextBoxModule, TextBoxModule, UploaderModule } from '@syncfusion/ej2-angular-inputs';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { FeatherModule } from 'angular-feather';
import { Download, Edit, Sliders, Trash2, Upload } from 'angular-feather/icons';


import { ImportDialogContentModule } from '@shared/components/import-dialog-content/import-dialog-content.module';
import {
  ReplacementOrderConfirmationModule,
} from '@shared/components/replacement-order-confirmation/replacement-order-confirmation.module';
import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { JoinPipeModule } from '@shared/pipes/join.pipe';
import { SharedModule } from '@shared/shared.module';

import { SingleMultipleSkillPipe } from './single-multiple-skill.pipe';
import { ImportDepartmentsComponent } from './import-departments/import-departments.component';
import { DepartmentService } from './services/department.service';
import { DepartmentsComponent } from './departments.component';
import { DepartmentsRoutingModule } from './departments-routing.module';

const icons = {
  Download,
  Upload,
  Sliders,
  Edit,
  Trash2,
};

@NgModule({
  declarations: [
    DepartmentsComponent,
    ImportDepartmentsComponent,
    SingleMultipleSkillPipe,
  ],
  imports: [
    CommonModule,
    DepartmentsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    PagerModule,
    GridModule,
    ButtonModule,
    ChipListModule,
    DropDownListModule,
    CheckBoxModule,
    SwitchModule,
    UploaderModule,
    TextBoxModule,
    NumericTextBoxModule,
    DatePickerModule,
    DropDownButtonModule,
    TooltipContainerModule,
    ReplacementOrderConfirmationModule,
    ImportDialogContentModule,
    JoinPipeModule,
    FeatherModule.pick(icons),
  ],
  providers: [DepartmentService],
})
export class DepartmentsModule { }
