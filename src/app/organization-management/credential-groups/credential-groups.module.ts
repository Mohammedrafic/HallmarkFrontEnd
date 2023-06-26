import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule, CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { GridModule, PagerModule } from '@syncfusion/ej2-angular-grids';
import { NumericTextBoxModule, TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { FeatherModule } from 'angular-feather';
import { Edit, Trash2 } from 'angular-feather/icons';

import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { IrpSystemGridTextPipeModule } from '@shared/pipes/irp-system-grid-text/irp-system-grid-text.module';
import { SharedModule } from '@shared/shared.module';

import { GroupSetupService } from './services/group-setup.service';
import { GroupSetupComponent } from './components/group-setup/group-setup.component';
import { GroupComponent } from './group/group.component';
import { CredentialGroupsRoutingModule } from './credential-groups-routing.module';

const icons = {
  Edit,
  Trash2,
};

@NgModule({
  declarations: [
    GroupComponent,
    GroupSetupComponent,
  ],
  imports: [
    CommonModule,
    CredentialGroupsRoutingModule,
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
    DropDownButtonModule,
    TooltipContainerModule,
    IrpSystemGridTextPipeModule,
    FeatherModule.pick(icons),
  ],
  providers: [GroupSetupService],
})
export class CredentialGroupsModule { }
