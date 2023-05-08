import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';

import { ButtonModule, CheckBoxModule, SwitchAllModule } from '@syncfusion/ej2-angular-buttons';
import { DatePickerModule, TimePickerAllModule } from '@syncfusion/ej2-angular-calendars';
import { GridModule, PagerModule } from '@syncfusion/ej2-angular-grids';
import { NumericTextBoxModule, TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { DropDownListModule, MultiSelectAllModule } from '@syncfusion/ej2-angular-dropdowns';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { FeatherModule } from 'angular-feather';
import {
  AlertCircle,
  AlertTriangle,
  AlignJustify,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  Edit,
  Edit3,
  FileText,
  MapPin,
  Menu,
  Plus,
  Search,
  Sliders,
  Trash2,
  Upload,
} from 'angular-feather/icons';

import { FilterDialogModule } from '@shared/components/filter-dialog/filter-dialog.module';
import { CanManageSettingModule } from '@shared/pipes/can-manage-setting/can-manage-setting.module';
import { ButtonGroupModule } from '@shared/components/button-group/button-group.module';
import { ValidateDirectiveModule } from '@shared/directives/validate-directive/validate-directive.module';

import { SettingsComponent } from './settings.component';
import { SettingsRoutingModule } from './settings-routing.module';

const icons = {
  Download,
  Upload,
  Sliders,
  Edit,
  Trash2,
  AlignJustify,
  Menu,
  FileText,
  MapPin,
  Plus,
  AlertCircle,
  Edit3,
  ChevronDown,
  ChevronRight,
  Copy,
  Search,
  AlertTriangle,
};

@NgModule({
  declarations: [SettingsComponent],
  imports: [
    CommonModule,
    SharedModule,
    SettingsRoutingModule,
    FeatherModule.pick(icons),
    ReactiveFormsModule,
    PagerModule,
    GridModule,
    ButtonModule,
    DropDownListModule,
    CheckBoxModule,
    TextBoxModule,
    NumericTextBoxModule,
    DialogModule,
    MultiSelectAllModule,
    ButtonGroupModule,
    ValidateDirectiveModule,
    FilterDialogModule,
    CanManageSettingModule,
    SwitchAllModule,
    TimePickerAllModule,
    DatePickerModule,
  ],
})
export class SettingsModule { }
