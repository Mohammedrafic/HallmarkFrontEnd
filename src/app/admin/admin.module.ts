import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GridModule, ResizeService } from '@syncfusion/ej2-angular-grids';
import { ButtonModule, ChipListModule } from '@syncfusion/ej2-angular-buttons';

import { ClientManagementContentComponent } from './client-management/client-management-content/client-management-content.component';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { FeatherModule } from 'angular-feather';
import {
  Download,
  Sliders,
  Edit,
  Trash2,
  AlignJustify,
  Menu
} from 'angular-feather/icons';

const sidebarIcons = {
  Download,
  Sliders,
  Edit,
  Trash2,
  AlignJustify,
  Menu
};
@NgModule({
  declarations: [
    ClientManagementContentComponent,
    AdminComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,

    GridModule,
    ButtonModule,
    ChipListModule,

    FeatherModule.pick(sidebarIcons)
  ],
  providers: [
    ResizeService
  ]
})
export class AdminModule { }
