import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ContextMenuModule, MenuModule, SidebarModule, TreeViewModule } from '@syncfusion/ej2-angular-navigations';
import { SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { FeatherModule } from 'angular-feather';
import {
  DollarSign,
  Clock,
  FileText,
  BookOpen,
  Home,
  Info,
  Sidebar,
  Users,
  Clipboard,
  Settings,
  User,
  Package,
  Trello,
  Lock
} from 'angular-feather/icons';

import { ShellRoutingModule } from './shell-routing.module';
import { ShellPageComponent } from './shell.component';
import { SharedModule } from '../shared/shared.module';

const sidebarIcons = {
  Sidebar,
  BookOpen,
  Info,
  Home,
  FileText,
  Clock,
  Users,
  DollarSign,
  Clipboard,
  Settings,
  User,
  Package,
  Trello,
  Lock
};

@NgModule({
  declarations: [ShellPageComponent],
  imports: [
    CommonModule,
    ShellRoutingModule,
    SidebarModule,
    SwitchModule,
    MenuModule,
    TreeViewModule,
    ContextMenuModule,
    DialogModule,
    SharedModule,
    FeatherModule.pick(sidebarIcons),
  ],
  providers: [],
})
export class ShellModule {}
