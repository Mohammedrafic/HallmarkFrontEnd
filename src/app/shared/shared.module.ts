import { NgModule } from '@angular/core';
import { FeatherModule } from 'angular-feather';

import { AlertCircle, CheckCircle, allIcons } from 'angular-feather/icons';
import { UploaderModule } from "@syncfusion/ej2-angular-inputs";
import { ListBoxModule } from '@syncfusion/ej2-angular-dropdowns';

import { PageToolbarComponent } from './components/page-toolbar/page-toolbar.component';
import { ValidateDirective } from './directives/validate.directive';
import { ErrorMessageComponent } from './components/error-message/error-message.component';
import { ValidationErrorPipe } from './pipes/validation-error.pipe';
import { CommonModule } from '@angular/common';
import { MessageToastComponent } from './components/message-toast/message-toast.component';
import { ToastModule } from '@syncfusion/ej2-angular-notifications';
import { ImageUploaderComponent } from './components/image-uploader/image-uploader.component';
import { FileUploadDialogComponent } from './components/file-upload-dialog/file-upload-dialog.component';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { SideDialogComponent } from './components/side-dialog/side-dialog.component';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { SearchComponent } from '@shared/components/search/search.component';
import { FilterDialogComponent } from './components/filter-dialog/filter-dialog.component';

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
  SideMenuComponent,
  SearchComponent
];

@NgModule({
  imports: [FeatherModule.pick(icons), CommonModule, UploaderModule, ToastModule, DialogModule, ButtonModule, ListBoxModule],
  exports: [...COMPONENTS],
  declarations: [...COMPONENTS, ErrorMessageComponent],
  providers: [],
})
export class SharedModule {}
