import { TimesheetsModule } from './../modules/timesheets/timesheets.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GridModule, ResizeService, PagerModule, PageService } from '@syncfusion/ej2-angular-grids';
import { ButtonModule, ChipListModule, CheckBoxModule, RadioButtonModule, SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { DropDownListModule, ListBoxModule, MultiSelectAllModule } from '@syncfusion/ej2-angular-dropdowns';
import { UploaderModule, TextBoxModule, NumericTextBoxModule, MaskedTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { SidebarModule, TabModule, TabAllModule } from '@syncfusion/ej2-angular-navigations';
import { DatePickerModule, TimePickerModule, DateTimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { FeatherModule } from 'angular-feather';
import {
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
  Copy
} from 'angular-feather/icons';

import { ClientManagementContentComponent } from './client-management/client-management-content/client-management-content.component';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { AddEditOrganizationComponent } from './client-management/add-edit-organization/add-edit-organization.component';
import { NgxsModule } from '@ngxs/store';
import { AdminState } from './store/admin.state';
import { SharedModule } from '../shared/shared.module';
import { MasterDataContentComponent } from './master-data/master-data-content.component';
import { SkillsCategoriesComponent } from './master-data/skills/skills-categories.component';
import { SkillsGridComponent } from './master-data/skills/skills-grid/skills-grid.component';
import { SkillCategoriesGridComponent } from './master-data/skills/skill-categories-grid/skill-categories-grid.component';
import {
  MasterCredentialsTypesComponent
} from './master-data/master-credentials/master-credentials-types/master-credentials-types.component';
import { MasterHolidaysComponent } from './master-data/holidays/holidays.component';
import { HolidaysState } from './store/holidays.state';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { RejectReasonMasterComponent } from './master-data/reject-reason-master/reject-reason-master.component';
import { RejectReasonMasterState } from "@admin/store/reject-reason-mater.state";
import { ManualInvoiceReasonsComponent } from '@admin/master-data/manual-invoice-reasons/manual-invoice-reasons.component';
import { ManualInvoiceReasonsState } from '@admin/store/manual-invoice-reasons.state';

const sidebarIcons = {
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
  Copy
};
@NgModule({
  declarations: [
    ClientManagementContentComponent,
    AddEditOrganizationComponent,
    AdminComponent,
    MasterDataContentComponent,
    SkillsCategoriesComponent,
    SkillsGridComponent,
    SkillCategoriesGridComponent,
    MasterCredentialsTypesComponent,
    MasterHolidaysComponent,
    RejectReasonMasterComponent,
    ManualInvoiceReasonsComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ListBoxModule,
    PagerModule,
    GridModule,
    ButtonModule,
    ChipListModule,
    DropDownListModule,
    CheckBoxModule,
    UploaderModule,
    RadioButtonModule,
    TextBoxModule,
    NumericTextBoxModule,
    SidebarModule,
    DatePickerModule,
    DialogModule,
    TabModule,
    TabAllModule,
    TimePickerModule,
    DateTimePickerModule,
    MultiSelectAllModule,
    SwitchModule,
    MaskedTextBoxModule,
    MultiSelectAllModule,
    DropDownButtonModule,
    TimesheetsModule,
    FeatherModule.pick(sidebarIcons),

    //STORE
    NgxsModule.forFeature([
      AdminState,
      HolidaysState,
      RejectReasonMasterState,
      ManualInvoiceReasonsState,
    ]),
  ],
  providers: [
    ResizeService,
    PageService
  ]
})
export class AdminModule { }
