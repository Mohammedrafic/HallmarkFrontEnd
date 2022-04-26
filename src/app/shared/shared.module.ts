import { NgModule } from '@angular/core';
import { FeatherModule } from 'angular-feather';

import { AlertCircle, CheckCircle } from 'angular-feather/icons';

import { PageToolbarComponent } from './components/page-toolbar/page-toolbar.component';
import { ValidateDirective } from './directives/validate.directive';
import { ErrorMessageComponent } from './components/error-message/error-message.component';
import { ValidationErrorPipe } from './pipes/validation-error.pipe';
import { CommonModule } from '@angular/common';
import { SuccessErrorToastComponent } from './components/success-error-toast/success-error-toast.component';
import { ToastModule } from '@syncfusion/ej2-angular-notifications';

const icons = {AlertCircle, CheckCircle};

const COMPONENTS = [PageToolbarComponent, ValidationErrorPipe, ValidateDirective];

@NgModule({
  imports: [FeatherModule.pick(icons), CommonModule, ToastModule],
  exports: [...COMPONENTS, SuccessErrorToastComponent],
  declarations: [...COMPONENTS, ValidateDirective, ErrorMessageComponent, SuccessErrorToastComponent],
  providers: [],
})
export class SharedModule {}
