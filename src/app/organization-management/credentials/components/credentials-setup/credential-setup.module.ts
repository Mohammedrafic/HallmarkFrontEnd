import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FeatherModule } from 'angular-feather';

import { ButtonModule, CheckBoxModule, SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { GridModule, PagerModule } from '@syncfusion/ej2-angular-grids';
import { NumericTextBoxModule, TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';

import { IrpSystemGridTextPipeModule } from '@shared/pipes/irp-system-grid-text/irp-system-grid-text.module';
import { SharedModule } from '@shared/shared.module';
import {
  CredentialSetupContainerComponent,
} from '@organization-management/credentials/components/credentials-setup/containers/credential-setup-container.component';
import { SetupGridFiltersComponent } from './components/setup-grid-filters/setup-grid-filters.component';
import {
  CredentialGridComponent,
} from '@organization-management/credentials/components/credentials-setup/components/credentials-grid/credential-grid.component';
import {
  MapCredentialsDialogComponent,
} from '@organization-management/credentials/components/credentials-setup/components/map-credentials-dialog/map-credentials-dialog.component';
import { EditCredentialDialogComponent } from './components/edit-credential-dialog/edit-credential-dialog.component';
import {
  Icons,
} from '@organization-management/credentials/components/credentials-setup/constants';
import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';

@NgModule({
  declarations: [
    CredentialSetupContainerComponent,
    SetupGridFiltersComponent,
    CredentialGridComponent,
    MapCredentialsDialogComponent,
    EditCredentialDialogComponent,
  ],
  imports: [
    CommonModule,
    ButtonModule,
    DropDownListModule,
    ReactiveFormsModule,
    PagerModule,
    GridModule,
    NumericTextBoxModule,
    IrpSystemGridTextPipeModule,
    SharedModule,
    SwitchModule,
    CheckBoxModule,
    TextBoxModule,
    DatePickerModule,
    FeatherModule.pick(Icons),
    TooltipContainerModule,
  ],
  exports: [
    CredentialSetupContainerComponent,
    SetupGridFiltersComponent,
    CredentialGridComponent,
    MapCredentialsDialogComponent,
  ],
})
export class CredentialSetupModule {}
