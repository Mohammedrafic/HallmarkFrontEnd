import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MsalModule } from '@azure/msal-angular';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { ButtonModule, CheckBoxModule } from '@syncfusion/ej2-angular-buttons';

import { LoginPageComponent } from './login-page/login-page.component';
import { SharedModule } from '@shared/shared.module';
import { LoggedOutPageComponent } from './logged-out-page/logged-out-page.component';
import { RouterModule } from '@angular/router';
import { FeatherModule } from 'angular-feather';

@NgModule({
  declarations: [LoginPageComponent, LoggedOutPageComponent],
  imports: [
    CommonModule,
    SharedModule,
    DropDownListModule,
    ReactiveFormsModule,
    CheckBoxModule,
    MsalModule,
    RouterModule,
    FeatherModule,
    ButtonModule,
  ],
})
export class B2cModule {}

