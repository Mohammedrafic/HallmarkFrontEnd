import { NgModule } from '@angular/core';
import { FeatherModule } from 'angular-feather';

import { AlertCircle, CheckCircle, allIcons } from 'angular-feather/icons';
import { UploaderModule } from "@syncfusion/ej2-angular-inputs";
import { ListBoxModule } from '@syncfusion/ej2-angular-dropdowns';

import { PageToolbarComponent } from './components/page-toolbar/page-toolbar.component';
import { ValidateDirective } from './directives/validate.directive';
import { ErrorMessageComponent } from './components/error-message/error-message.component';
import { ValidationErrorPipe } from './pipes/validation-error.pipe';
import { CommonModule, DatePipe } from '@angular/common';
import { MessageToastComponent } from './components/message-toast/message-toast.component';
import { ToastModule } from '@syncfusion/ej2-angular-notifications';
import { ImageUploaderComponent } from './components/image-uploader/image-uploader.component';
import { FileUploadDialogComponent } from './components/file-upload-dialog/file-upload-dialog.component';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { ButtonModule, ChipListAllModule, RadioButtonAllModule } from '@syncfusion/ej2-angular-buttons';
import { SideDialogComponent } from './components/side-dialog/side-dialog.component';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { SearchComponent } from './components/search/search.component';
import { FilterDialogComponent } from './components/filter-dialog/filter-dialog.component';
import { ExportDialogComponent } from './components/export-dialog/export-dialog.component';
import { FormsModule } from '@angular/forms';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';

const icons = {AlertCircle, CheckCircle};

const COMPONENTS = [
  PageToolbarComponent,
  ValidationErrorPipe,
  ValidateDirective,
  ImageUploaderComponent,
  SideDialogComponent,
  FilterDialogComponent,
  MessageToastComponent,
  FileUploadDialogComponent,
  ExportDialogComponent,
  SideMenuComponent,
  SearchComponent
];

@NgModule({
  imports: [FeatherModule.pick(icons), CommonModule, UploaderModule, ToastModule, DialogModule, ButtonModule, ListBoxModule, RadioButtonAllModule, ChipListAllModule, FormsModule, DropDownButtonModule],
  exports: [...COMPONENTS],
  declarations: [...COMPONENTS, ErrorMessageComponent],
  providers: [DatePipe],
})
export class SharedModule {}
