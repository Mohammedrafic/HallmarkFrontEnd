import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextareaComponent } from './textarea.component';
import { TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { FormControlWrapperModule } from '@shared/components/form-controls/form-control-wrapper/form-control-wrapper.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ValidateDirectiveModule } from '@shared/directives/validate-directive/validate-directive.module';
import { ErrorMessageModule } from '@shared/components/error-message/error-message.module';


@NgModule({
  declarations: [
    TextareaComponent
  ],
  exports: [
    TextareaComponent
  ],
  imports: [
    CommonModule,
    TextBoxModule,
    FormControlWrapperModule,
    ReactiveFormsModule,
    ValidateDirectiveModule,
    ErrorMessageModule
  ]
})
export class TextareaModule {
}
