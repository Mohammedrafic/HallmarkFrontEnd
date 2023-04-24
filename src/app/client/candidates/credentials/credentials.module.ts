import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeatherModule } from 'angular-feather';
import { Copy, Paperclip, AlertTriangle, XCircle } from 'angular-feather/icons';

import { CredentialsComponent } from './credentials.component';
import { CredentialsGridModule } from '@shared/components/credentials-grid/credentials-grid.module';


@NgModule({
  declarations: [
    CredentialsComponent,
  ],
  imports: [
    CommonModule,
    CredentialsGridModule,
    FeatherModule.pick({ Copy, Paperclip, AlertTriangle, XCircle }),
  ],
})
export class CredentialsModule { }
