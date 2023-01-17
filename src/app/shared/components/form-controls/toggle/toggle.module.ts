import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToggleComponent } from './toggle.component';
import { SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { SharedModule } from '@shared/shared.module';


@NgModule({
  declarations: [
    ToggleComponent
  ],
  exports: [
    ToggleComponent
  ],
  imports: [
    CommonModule,
    SwitchModule,
    SharedModule
  ],
  schemas: [
    NO_ERRORS_SCHEMA
  ]
})
export class ToggleModule { }
