import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccordionModule } from '@syncfusion/ej2-angular-navigations';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { FeatherModule } from 'angular-feather';
import {
  Sliders,
} from 'angular-feather/icons';

import { AgencyComponent } from './agency.component';
import { AgencyRoutingModule } from './agency-routing.module';
import { AgencyListComponent } from './agency-list/agency-list.component';
import { AddEditAgencyComponent } from './agency-list/add-edit-agency/add-edit-agency.component';
import { SharedModule } from '../shared/shared.module';

const sidebarIcons = {
  Sliders,
};

@NgModule({
  declarations: [
    AgencyComponent,
    AgencyListComponent,
    AddEditAgencyComponent
  ],
  imports: [
    CommonModule,
    AgencyRoutingModule,
    SharedModule,

    ButtonModule,
    AccordionModule,
    FeatherModule.pick(sidebarIcons)
  ]
})
export class AgencyModule { }
