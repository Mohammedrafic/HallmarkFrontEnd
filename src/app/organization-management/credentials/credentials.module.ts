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
import { Edit, Sliders, Trash2, Upload } from 'angular-feather/icons';

import { CredentialListModule } from '@shared/components/credentials-list/credential-list.module';
import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { IrpSystemGridTextPipeModule } from '@shared/pipes/irp-system-grid-text/irp-system-grid-text.module';
import { SharedModule } from '@shared/shared.module';

import { CredentialsSetupComponent } from './credentials-setup/credentials-setup.component';
import { FilteredCredentialsComponent } from './credentials-setup/filtered-credentials/filtered-credentials.component';
import { MapCredentialsFormComponent } from './credentials-setup/map-credentials-form/map-credentials-form.component';
import { CredentialsSetupService } from './services/credentials-setup.service';
import { MapCredentialsService } from './services/map-credentials.service';
import { CredentialsComponent } from './credentials.component';
import { CredentialsRoutingModule } from './credentials-routing.module';

const icons = {
  Upload,
  Sliders,
  Edit,
  Trash2,
};

@NgModule({
  declarations: [
    CredentialsComponent,
    CredentialsSetupComponent,
    MapCredentialsFormComponent,
    FilteredCredentialsComponent,
  ],
  imports: [
    CommonModule,
    CredentialsRoutingModule,
    FormsModule,
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
    FeatherModule.pick(icons),
  ],
  providers: [
    MapCredentialsService,
    CredentialsSetupService,
  ],
})
export class CredentialsModule { }
