import { NgModule } from '@angular/core';
import { FeatherModule } from 'angular-feather';

import { AlertCircle } from 'angular-feather/icons';

import { PageToolbarComponent } from './components/page-toolbar/page-toolbar.component';
import { ValidateDirective } from './directives/validate.directive';
import { ErrorMessageComponent } from './components/error-message/error-message.component';
import { ValidationErrorPipe } from './pipes/validation-error.pipe';
import { CommonModule } from '@angular/common';

const icons = {AlertCircle};

const COMPONENTS = [PageToolbarComponent, ValidationErrorPipe, ValidateDirective];

@NgModule({
  imports: [FeatherModule.pick(icons), CommonModule],
  exports: [...COMPONENTS],
  declarations: [...COMPONENTS, ValidateDirective, ErrorMessageComponent],
  providers: [],
})
export class SharedModule {}
