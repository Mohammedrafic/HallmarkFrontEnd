import { TimesheetsRoutingModule } from './timesheets-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxsModule } from '@ngxs/store';
import { SharedModule } from '@shared/shared.module';
import { ButtonModule, ChipListModule } from '@syncfusion/ej2-angular-buttons';

import { FeatherModule } from 'angular-feather';
import { TimesheetsContainerComponent } from './containers/timesheets-container/timesheets-container.component';
import { TimesheetsTableComponent } from './components/timesheets-table/timesheets-table.component';
import { TimesheetsState } from './store/state/timesheets.state';
import { TimesheetsApiService } from './services/timesheets-api.service';
import { TabDynamicNavigationComponent } from './components/tab-dynamic-navigation/tab-dynamic-navigation.component';
import { TabAllModule } from '@syncfusion/ej2-angular-navigations';
import {
  AlertTriangle,
  AlignJustify, Briefcase, Calendar, CheckCircle,
  ChevronDown, Copy,
  Download, Edit, Edit3, Folder,
  Lock, MapPin,
  Menu,
  MessageSquare,
  MoreVertical, Plus,
  Search,
  Sliders, Trash2,
  Upload, User, X, XCircle
} from 'angular-feather/icons';
import { GridAllModule, PagerModule } from '@syncfusion/ej2-angular-grids';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { DropDownListModule, MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { DatePickerModule, MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { ReactiveFormsModule } from '@angular/forms';
import { ControlConverterPipe } from './pipes/control-converter.pipe';

const gridIcons = {
  MessageSquare,
  Lock,
  ChevronDown,
  AlignJustify,
  Menu,
  Sliders,
  Download,
  Search,
  MoreVertical,
  Upload,
  Plus,
  Edit,
  Copy,
  XCircle,
  Edit3,
  Trash2,
  X,
  User,
  MapPin,
  Briefcase,
  Calendar,
  Folder,
  CheckCircle,
  AlertTriangle
};


@NgModule({
  declarations: [
    TimesheetsContainerComponent,
    TimesheetsTableComponent,
    TabDynamicNavigationComponent,
    ControlConverterPipe
  ],
  imports: [
    CommonModule,
    TimesheetsRoutingModule,
    NgxsModule.forFeature([TimesheetsState]),
    SharedModule,
    FeatherModule.pick(gridIcons),
    ButtonModule,
    TabAllModule,
    GridAllModule,
    ChipListModule,
    DropDownButtonModule,
    DropDownListModule,
    NumericTextBoxModule,
    PagerModule,
    DatePickerModule,
    ReactiveFormsModule,
    MultiSelectModule
  ],
  exports: [TimesheetsContainerComponent],
  providers: [TimesheetsApiService, MaskedDateTimeService]
})
export class TimesheetsModule {}
