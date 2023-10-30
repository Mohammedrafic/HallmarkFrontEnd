import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MspRoutingModule } from './msp-routing.module';
import { MspListComponent } from './msp-list/msp-list.component';
import { MspComponent } from './msp.component';
import { SharedModule } from '@shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule, CheckBoxModule, ChipListModule, RadioButtonModule, SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { GridAllModule, GridModule, PagerModule } from '@syncfusion/ej2-angular-grids';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { DropDownListModule, ListBoxModule, MultiSelectAllModule } from '@syncfusion/ej2-angular-dropdowns';
import { AccordionModule, TabAllModule } from '@syncfusion/ej2-angular-navigations';
import { DialogAllModule, TooltipModule } from '@syncfusion/ej2-angular-popups';
import { MaskedTextBoxModule, NumericTextBoxModule, TextBoxModule, UploaderModule } from '@syncfusion/ej2-angular-inputs';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
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
  Edit 
} from 'angular-feather/icons';

const sidebarIcons = {    
  Edit  
};
@NgModule({
  declarations: [
    MspComponent,
    MspListComponent,
    MspactionCellrenderComponent
  ],  
  imports: [
    CommonModule,
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
    NgxMaskModule.forChild(),
    NgxsModule.forFeature([MspState]),
    BoolValuePipeModule,
    GridPaginationModule,
    ValidateDirectiveModule,
    GridModule,
    AgGridModule,
    
  ],
  providers: [
    MspService
  ],
})
export class MspModule { }
