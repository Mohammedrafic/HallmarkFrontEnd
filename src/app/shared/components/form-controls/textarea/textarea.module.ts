import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextareaComponent } from './textarea.component';
import { TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { FormControlWrapperModule } from '@shared/components/form-controls/form-control-wrapper/form-control-wrapper.module';
import { SharedModule } from '@shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ValidateDirectiveModule } from '@shared/directives/validate-directive/validate-directive.module';


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
    SharedModule,
    ValidateDirectiveModule
  ]
})
export class TextareaModule {
}
