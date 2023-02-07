import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ButtonModule, CheckBoxModule, RadioButtonModule } from '@syncfusion/ej2-angular-buttons';
import { SplitButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
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
import { IrpContainerStateService } from '@client/order-management/containers/irp-container/irp-container-state.service';
import { OrderCredentialsService } from "@client/order-management/services";
import { OrganizationStructureService } from '@shared/services';
import { PartilSearchService } from '@shared/services/partial-search.service';

@NgModule({
  declarations: [
    CreateEditOrderComponent,
    IrpContainerComponent,
    OrderDetailsIrpComponent,
    AddEditOrderComponent,
    OrderDetailsFormComponent,
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
  ],
  providers: [
    OrderDetailsIrpService,
    IrpContainerStateService,
    OrderCredentialsService,
    OrganizationStructureService,
    PartilSearchService,
  ],
})
export class CreateEditOrderModule { }
