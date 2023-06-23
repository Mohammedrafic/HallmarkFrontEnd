import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule, CheckBoxModule, RadioButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DatePickerModule, TimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { GridModule, PagerModule } from '@syncfusion/ej2-angular-grids';
import { NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { TreeViewModule } from '@syncfusion/ej2-angular-navigations';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { FeatherModule } from 'angular-feather';
import { Edit, Sliders, Trash2, Upload } from 'angular-feather/icons';

import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { SharedModule } from '@shared/shared.module';

import { AssignSkillComponent } from './assign-skill/assign-skill.component';
import { SkillsComponent } from './skills.component';
import { SkillsService } from './skills.service';
import { SkillsRoutingModule } from './skills-routing.module';

const icons = {
  Sliders,
  Upload,
  Edit,
  Trash2,
};

@NgModule({
  declarations: [
    SkillsComponent,
    AssignSkillComponent,
  ],
  imports: [
    CommonModule,
    SkillsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    PagerModule,
    GridModule,
    ButtonModule,
    DropDownListModule,
    CheckBoxModule,
    RadioButtonModule,
    NumericTextBoxModule,
    DatePickerModule,
    DialogModule,
    TimePickerModule,
    DropDownButtonModule,
    TooltipContainerModule,
    TreeViewModule,
    FeatherModule.pick(icons),
  ],
  providers: [SkillsService],
})
export class SkillsModule { }
