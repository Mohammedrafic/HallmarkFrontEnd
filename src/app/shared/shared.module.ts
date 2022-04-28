import { NgModule } from '@angular/core';
import { FeatherModule } from 'angular-feather';

import { AlertCircle, CheckCircle } from 'angular-feather/icons';
import { UploaderModule } from "@syncfusion/ej2-angular-inputs";

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

const icons = {AlertCircle, CheckCircle};

const COMPONENTS = [
  PageToolbarComponent,
  ValidationErrorPipe,
  ValidateDirective,
  ImageUploaderComponent,
  SideDialogComponent,
  MessageToastComponent,
  FileUploadDialogComponent
];

@NgModule({
  imports: [FeatherModule.pick(icons), CommonModule, UploaderModule, ToastModule, DialogModule, ButtonModule],
  exports: [...COMPONENTS],
  declarations: [...COMPONENTS, ErrorMessageComponent],
  providers: [],
})
export class SharedModule {}
