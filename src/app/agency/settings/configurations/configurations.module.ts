import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';

import { SwitchAllModule } from '@syncfusion/ej2-angular-buttons';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { FilterDialogModule } from '@shared/components/filter-dialog/filter-dialog.module';
import { CanManageSettingModule } from '@shared/pipes/can-manage-setting/can-manage-setting.module';
import { ButtonGroupModule } from '@shared/components/button-group/button-group.module';
import { ValidateDirectiveModule } from '@shared/directives/validate-directive/validate-directive.module';

import { ConfigurationsComponent } from './configurations.component';
import { ConfigurationsRoutingModule } from './configurations-routing.module';
import { ConfigurationGridModule } from '@shared/components/configuration-grid/configuration-grid.module';
import { ConfigurationsService } from './services/configurations.service';

@NgModule({
  declarations: [ConfigurationsComponent],
  imports: [
    CommonModule,
    SharedModule,
    ConfigurationsRoutingModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonGroupModule,
    ValidateDirectiveModule,
    FilterDialogModule,
    CanManageSettingModule,
    SwitchAllModule,
    ConfigurationGridModule,
  ],
  providers: [ConfigurationsService],
})
export class ConfigurationsModule { }
