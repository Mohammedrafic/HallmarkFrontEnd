
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonModule, SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { TextBoxModule, UploaderModule } from '@syncfusion/ej2-angular-inputs';
import { ContextMenuModule, MenuModule, SidebarModule, TreeViewModule } from '@syncfusion/ej2-angular-navigations';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { FeatherModule } from 'angular-feather';
import {
  AlertCircle,
  Bell,
  BookOpen,
  Clipboard,
  Clock,
  DollarSign,
  File,
  FileText,
  HelpCircle,
  Home,
  Info,
  Lock,
  Mail,
  MessageSquare,
  Package,
  PieChart,
  Search,
  Server,
  Settings,
  Sidebar,
  Trello,
  TrendingUp,
  Truck,
  Twitch,
  User,
  UserX,
  Users,
} from 'angular-feather/icons';

import { AdminGuard, AgencyGuard, EmployeeGuard } from '@core/guards';
import { OrganizationGuard } from '@core/guards/organization.guard';
import { AnalyticByClickModule } from '@shared/directives/analytics/analytics-by-click/analytic-by-click.module';
import { BoolValuePipeModule } from '@shared/pipes/bool-values/bool-values-pipe.module';
import { HelpNavigationService } from '@shared/services';
import { UserChatModule } from '../modules/chat/chat.module';
import { SharedModule } from '../shared/shared.module';
import { ContactusComponent } from './components/contactus/contactus.component';
import {
  OrganizationAgencySelectorComponent,
} from './components/organization-agency-selector/organization-agency-selector.component';
import { SearchMenuComponent } from './components/search-menu/search-menu.component';
import { ShellRoutingModule } from './shell-routing.module';
import { ShellPageComponent } from './shell.component';


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
  MessageSquare,
  File,
  UserX,
  Server,
  Twitch,
  TrendingUp,
};

@NgModule({
  declarations: [OrganizationAgencySelectorComponent, ShellPageComponent, SearchMenuComponent, ContactusComponent],
  imports: [
    TextBoxModule,
    UploaderModule,
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
    AnalyticByClickModule,
    BoolValuePipeModule,
  ],
  providers: [
    AdminGuard,
    OrganizationGuard,
    AgencyGuard,
    EmployeeGuard,
    HelpNavigationService,
  ],
})
export class ShellModule {}
