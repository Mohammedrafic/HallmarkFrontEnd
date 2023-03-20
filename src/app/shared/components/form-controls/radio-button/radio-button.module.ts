import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { RadioButtonModule as SyncfusionRadioButtonModule } from '@syncfusion/ej2-angular-buttons';

import { FormControlWrapperModule } from '../form-control-wrapper/form-control-wrapper.module';
import { RadioButtonComponent } from './radio-button.component';

@NgModule({
  declarations: [RadioButtonComponent],
  imports: [SyncfusionRadioButtonModule, ReactiveFormsModule, FormControlWrapperModule],
  exports: [RadioButtonComponent],
})
export class RadioButtonModule {}
