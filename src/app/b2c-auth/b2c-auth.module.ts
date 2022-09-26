import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MsalModule } from '@azure/msal-angular';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';

import { LoginPageComponent } from './login-page/login-page.component';
import { SharedModule } from '@shared/shared.module';
import { LoginFormComponent } from './login-form/login-form.component';

@NgModule({
  declarations: [LoginPageComponent, LoginFormComponent],
  imports: [CommonModule, SharedModule,  DropDownListModule, ReactiveFormsModule, CheckBoxModule, MsalModule],
})
export class B2cModule {}

