import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';

import { LoginRoutingModule } from './login-routing.module';
import { LoginPageComponent } from './login-page/login-page.component';
import { CheckBoxModule } from "@syncfusion/ej2-angular-buttons";

@NgModule({
  declarations: [LoginPageComponent],
  imports: [
    CommonModule,
    DropDownListModule,
    LoginRoutingModule,
    ReactiveFormsModule,
    CheckBoxModule,
  ],
})
export class LoginModule {}
