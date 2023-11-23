import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule, CheckBoxModule, RadioButtonModule, SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { TabAllModule } from '@syncfusion/ej2-angular-navigations';
import { DropDownListModule, MultiSelectAllModule } from '@syncfusion/ej2-angular-dropdowns';
import { DatePickerModule, TimePickerModule } from '@syncfusion/ej2-angular-calendars';

import { CreateEditOrderComponent } from './create-edit-order.component';
import { ButtonGroupModule } from '@shared/components/button-group/button-group.module';
import { IrpContainerComponent } from './containers/irp-container/irp-container.component';
import { OrderDetailsIrpComponent } from './components/irp-tabs/order-details/order-details-irp.component';
import { MaskedTextBoxModule, NumericTextBoxModule, TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { FeatherModule } from 'angular-feather';
import { AddEditOrderComponent } from '@client/order-management/components/add-edit-order/add-edit-order.component';
import {
  OrderDetailsFormComponent,
} from '@client/order-management/components/order-details-form/order-details-form.component';
import { OrderCredentialsModule } from '@order-credentials/order-credentials.module';
import { SharedModule } from '@shared/shared.module';
import {
  SaveTemplateDialogModule,
} from '@client/order-management/components/save-template-dialog/save-template-dialog.module';
import {
  OrderDetailsIrpService,
} from '@client/order-management/components/irp-tabs/services/order-details-irp.service';
import { MultiDatePickerModule } from '@shared/components/multi-date-picker/multi-date-picker.module';
import { GridIcons } from '@client/order-management/constants';
import {
  IrpContainerStateService,
} from '@client/order-management/containers/irp-container/services/irp-container-state.service';
import { OrderCredentialsService } from "@client/order-management/services";
import {OrganizationStructureService, SettingsViewService} from '@shared/services';
import { PartialSearchService } from '@shared/services/partial-search.service';
import {
  TableTypeCellComponent,
} from '@client/order-management/components/order-management-content/sub-grid-components/table-type-cell';
import {
  CriticalCellComponent,
} from '@client/order-management/components/order-management-content/sub-grid-components/critical-cell';
import{
  TableSystemCellComponent
}
from '@client/order-management/components/order-management-content/sub-grid-components/table-system-cell'
import { ValidateDirectiveModule } from '@shared/directives/validate-directive/validate-directive.module';
import { IrpContainerApiService } from '@client/order-management/containers/irp-container/services';
import { DocumentUploaderModule } from '@shared/components/document-uploader/document-uploader.module';
import { SplitButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from '@syncfusion/ej2-angular-notifications';

@NgModule({
  declarations: [
    CreateEditOrderComponent,
    IrpContainerComponent,
    OrderDetailsIrpComponent,
    AddEditOrderComponent,
    OrderDetailsFormComponent,
    TableTypeCellComponent,
    CriticalCellComponent,
    TableSystemCellComponent
  ],
  imports: [
    FeatherModule.pick(GridIcons),
    CommonModule,
    ButtonModule,
    SplitButtonModule,
    ButtonGroupModule,
    TabAllModule,
    ReactiveFormsModule,
    DropDownListModule,
    DatePickerModule,
    TimePickerModule,
    MultiSelectAllModule,
    CheckBoxModule,
    TextBoxModule,
    RadioButtonModule,
    OrderCredentialsModule,
    SharedModule,
    SaveTemplateDialogModule,
    NumericTextBoxModule,
    MaskedTextBoxModule,
    MultiDatePickerModule,
    ValidateDirectiveModule,
    DocumentUploaderModule,
    SwitchModule,
    ToastModule,
  ],
  providers: [
    OrderDetailsIrpService,
    IrpContainerStateService,
    OrderCredentialsService,
    OrganizationStructureService,
    PartialSearchService,
    IrpContainerApiService,
    SettingsViewService,
  ],
})
export class CreateEditOrderModule { }
