import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ContextMenuModule, MenuModule, SidebarModule, TreeViewModule } from '@syncfusion/ej2-angular-navigations';
import { ButtonModule, SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
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
  Lock,
  Truck,
  Bell,
  Search,
  HelpCircle,
  PieChart,
  AlertCircle,
  Mail,
} from 'angular-feather/icons';

import { ShellRoutingModule } from './shell-routing.module';
import { ShellPageComponent } from './shell.component';
import { SharedModule } from '../shared/shared.module';

import { OrganizationAgencySelectorComponent } from './components/organization-agency-selector/organization-agency-selector.component';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { SearchMenuComponent } from './components/search-menu/search-menu.component';
import { UserChatModule } from '../modules/chat/chat.module';

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
  Lock,
  Truck,
  Bell,
  Search,
  HelpCircle,
  PieChart,
  AlertCircle,
  Mail,
};

@NgModule({
  declarations: [OrganizationAgencySelectorComponent, ShellPageComponent, SearchMenuComponent],
  imports: [
    CommonModule,
    ShellRoutingModule,
    ButtonModule,
    SidebarModule,
    SwitchModule,
    MenuModule,
    TreeViewModule,
    ContextMenuModule,
    DialogModule,
    SharedModule,
    FeatherModule.pick(sidebarIcons),
    DropDownListModule,
    ReactiveFormsModule,
    DropDownButtonModule,
    FormsModule,
    FontAwesomeModule,
    UserChatModule,
  ],
  providers: [],
})
export class ShellModule {}
