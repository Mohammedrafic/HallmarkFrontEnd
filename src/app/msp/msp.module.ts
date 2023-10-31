import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MspRoutingModule } from './msp-routing.module';
import { MspListComponent } from './msp-list/msp-list.component';
import { MspComponent } from './msp.component';
import { SharedModule } from '@shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule, CheckBoxModule, ChipListModule, RadioButtonModule, SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { GridAllModule, GridModule, PagerModule } from '@syncfusion/ej2-angular-grids';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { DropDownListModule, ListBoxModule, MultiSelectAllModule } from '@syncfusion/ej2-angular-dropdowns';
import { AccordionModule, SidebarModule, TabAllModule, TabModule } from '@syncfusion/ej2-angular-navigations';
import { DialogAllModule, DialogModule, TooltipModule } from '@syncfusion/ej2-angular-popups';
import { MaskedTextBoxModule, NumericTextBoxModule, TextBoxModule, UploaderModule } from '@syncfusion/ej2-angular-inputs';
import { DatePickerModule, DateTimePickerModule, TimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { MultiselectDropdownModule } from '@shared/components/form-controls/multiselect-dropdown/multiselect-dropdown.module';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { ScrollToTopModule } from '@shared/components/scroll-to-top/scroll-to-top.module';
import { ValidateDirectiveModule } from '@shared/directives/validate-directive/validate-directive.module';
import { GridPaginationModule } from '@shared/components/grid/grid-pagination/grid-pagination.module';
import { BoolValuePipeModule } from '@shared/pipes/bool-values/bool-values-pipe.module';
import { NgxMaskModule } from 'ngx-mask';
import { NgxsModule } from '@ngxs/store';
import { AgGridModule } from '@ag-grid-community/angular';
import { MspState } from './store/state/msp.state';
import { MspService } from './services/msp.services';
import { MspactionCellrenderComponent } from './cell-render/mspaction-cellrender/mspaction-cellrender.component';
import { FeatherModule } from 'angular-feather';
import { 
  Edit,
  Download,
  Upload,
  Sliders,
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
} from 'angular-feather/icons';
import { AddEditMspComponent } from './add-edit-msp/add-edit-msp.component';
import { AddEditOrganizationService } from '@admin/client-management/services/add-edit-organization.service';
import { AddEditMSPService } from './services/msp-addedit.service';
import { AdminState } from '@admin/store/admin.state';
import {

} from 'angular-feather/icons';
import { AdminRoutingModule } from '@admin/admin-routing.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CredentialListModule } from '@shared/components/credentials-list/credential-list.module';
import { InputModule } from '@shared/components/form-controls/input/input.module';
import { TimesheetsModule } from '../modules/timesheets/timesheets.module';
const sidebarIcons = {    
  Edit ,
  Download,
  Upload,
  Sliders,
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
};
@NgModule({
  declarations: [
    MspComponent,
    MspListComponent,
    MspactionCellrenderComponent,
    AddEditMspComponent
  ],  
  imports: [
    CommonModule,
    FormsModule,
    MspRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FeatherModule.pick(sidebarIcons),
    SwitchModule,
    GridModule,
    PdfViewerModule,
    ListBoxModule,
    ButtonModule,
    AccordionModule,
    DropDownListModule,
    CheckBoxModule,
    GridAllModule,
    ChipListModule,
    PagerModule,
    TooltipModule,
    NumericTextBoxModule,
    TextBoxModule,
    DatePickerModule,
    UploaderModule,
    TabAllModule,
    DialogAllModule,
    MultiSelectAllModule,
    MultiselectDropdownModule,
    MaskedTextBoxModule,
    DropDownButtonModule,   
    RadioButtonModule,
    TooltipContainerModule,
    ScrollToTopModule,
    DropDownButtonModule,
    NgxMaskModule.forChild(),
    NgxsModule.forFeature([MspState,AdminState]),
    BoolValuePipeModule,
    GridPaginationModule,
    ValidateDirectiveModule,
    GridModule,
    AgGridModule,
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
        TooltipContainerModule,
        CredentialListModule,
        AgGridModule,
        InputModule,
        FontAwesomeModule,
    
  ],
  providers: [
    MspService,AddEditMSPService
  ],
})
export class MspModule { }
