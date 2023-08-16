import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule, CheckBoxModule, SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { GridModule, PagerModule } from '@syncfusion/ej2-angular-grids';
import { NumericTextBoxModule, TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { TabAllModule, TabModule } from '@syncfusion/ej2-angular-navigations';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { FeatherModule } from 'angular-feather';
import { Edit, Info, Sliders, Trash2, Upload } from 'angular-feather/icons';

import { CredentialListModule } from '@shared/components/credentials-list/credential-list.module';
import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { IrpSystemGridTextPipeModule } from '@shared/pipes/irp-system-grid-text/irp-system-grid-text.module';
import { SharedModule } from '@shared/shared.module';
import { CredentialsComponent } from './credentials.component';
import {
  CredentialGroupsModule,
} from '@organization-management/credentials/components/credential-groups/credential-groups.module';
import {
  CredentialsSetupService,
  MapCredentialsService,
} from '@organization-management/credentials/services';
import { CredentialRoutingModule } from '@organization-management/credentials/credential-routing.module';
import { CredentialListService } from '@shared/components/credentials-list/services';
import {
  CredentialSetupModule,
} from '@organization-management/credentials/components/credentials-setup/credential-setup.module';

const icons = {
  Upload,
  Sliders,
  Edit,
  Trash2,
  Info,
};

@NgModule({
  declarations: [
    CredentialsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    CredentialRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    PagerModule,
    GridModule,
    ButtonModule,
    DropDownListModule,
    CheckBoxModule,
    TextBoxModule,
    NumericTextBoxModule,
    DatePickerModule,
    TabModule,
    TabAllModule,
    SwitchModule,
    DropDownButtonModule,
    TooltipContainerModule,
    CredentialListModule,
    IrpSystemGridTextPipeModule,
    CredentialGroupsModule,
    CredentialSetupModule,
    FeatherModule.pick(icons),
  ],
  providers: [
    MapCredentialsService,
    CredentialsSetupService,
    CredentialListService,
  ],
})
export class CredentialsModule { }
