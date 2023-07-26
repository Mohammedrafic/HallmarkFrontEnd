import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SideMenuModule } from '@shared/components/side-menu/side-menu.module';
import { AgencySettingsComponent } from './agency-settings.component';
import { AgencySettingsRoutingModule } from './agency-settings-routing.module';
import { ConfigurationsModule } from './configurations/configurations.module';

@NgModule({
  declarations: [AgencySettingsComponent],
  imports: [
    CommonModule,
    AgencySettingsRoutingModule,
    SideMenuModule,
    ConfigurationsModule,
  ],
  providers: [],
})
export class AgencySettingsModule {}
