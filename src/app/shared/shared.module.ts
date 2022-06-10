import { NgModule } from '@angular/core';
import { FeatherModule } from 'angular-feather';

import { AlertCircle, CheckCircle, allIcons, User, Briefcase, Folder, MapPin, Calendar, ArrowLeft, ArrowRight } from 'angular-feather/icons';
import { NumericTextBoxAllModule, UploaderModule } from "@syncfusion/ej2-angular-inputs";
import { DropDownListModule, ListBoxModule } from '@syncfusion/ej2-angular-dropdowns';

import { PageToolbarComponent } from './components/page-toolbar/page-toolbar.component';
import { ValidateDirective } from './directives/validate.directive';
import { ErrorMessageComponent } from './components/error-message/error-message.component';
import { ValidationErrorPipe } from './pipes/validation-error.pipe';
import { CommonModule, DatePipe } from '@angular/common';
import { MessageToastComponent } from './components/message-toast/message-toast.component';
import { ToastModule } from '@syncfusion/ej2-angular-notifications';
import { ImageUploaderComponent } from './components/image-uploader/image-uploader.component';
import { DocumentUploaderComponent } from './components/document-uploader/document-uploader.component';
import { FileUploadDialogComponent } from './components/file-upload-dialog/file-upload-dialog.component';
import { DialogModule, TooltipModule } from '@syncfusion/ej2-angular-popups';
import { ButtonModule, ChipListAllModule, RadioButtonAllModule } from '@syncfusion/ej2-angular-buttons';
import { SideDialogComponent } from './components/side-dialog/side-dialog.component';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { SearchComponent } from './components/search/search.component';
import { FilterDialogComponent } from './components/filter-dialog/filter-dialog.component';
import { ExportDialogComponent } from './components/export-dialog/export-dialog.component';
import { FormsModule } from '@angular/forms';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { ChipsCssClass } from '@shared/pipes/chips-css-class.pipe';
import { DialogNextPreviousComponent } from './components/dialog-next-previous/dialog-next-previous.component';
import { OrderDetailsComponent } from './components/order-details/order-details.component';
import { AccordionModule } from '@syncfusion/ej2-angular-navigations';
import { OrderTypeName } from '@shared/pipes/order-type-name.pipe';
import { GeneralOrderInfoComponent } from './components/general-order-info/general-order-info.component';
import { GridAllModule, PagerAllModule } from "@syncfusion/ej2-angular-grids";
import { OrderCandidatesListComponent } from './components/order-candidates-list/order-candidates-list.component';
import { CustomProgressBarComponent } from './components/custom-progress-bar/custom-progress-bar.component';

const icons = {
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  User,
  Briefcase,
  Folder,
  MapPin,
  Calendar
};

const COMPONENTS = [
  PageToolbarComponent,
  ValidationErrorPipe,
  ChipsCssClass,
  OrderTypeName,
  ValidateDirective,
  ImageUploaderComponent,
  DocumentUploaderComponent,
  SideDialogComponent,
  FilterDialogComponent,
  MessageToastComponent,
  FileUploadDialogComponent,
  ExportDialogComponent,
  SideMenuComponent,
  SearchComponent,
  DialogNextPreviousComponent,
  OrderDetailsComponent,
  SearchComponent,
  GeneralOrderInfoComponent,
  OrderCandidatesListComponent,
  CustomProgressBarComponent
];

@NgModule({
  imports: [FeatherModule.pick(icons), 
    CommonModule, 
    UploaderModule, 
    ToastModule, 
    DialogModule, 
    ButtonModule, 
    ListBoxModule, 
    RadioButtonAllModule, 
    ChipListAllModule, 
    FormsModule, 
    DropDownButtonModule, 
    AccordionModule, 
    TooltipModule,
    NumericTextBoxAllModule,
    GridAllModule, PagerAllModule,
    DropDownListModule
  ],
  exports: [...COMPONENTS],
  declarations: [...COMPONENTS, ErrorMessageComponent],
  providers: [DatePipe],
})
export class SharedModule {}
