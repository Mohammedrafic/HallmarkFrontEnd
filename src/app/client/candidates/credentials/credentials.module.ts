import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CredentialsComponent } from './credentials.component';
import { CredentialsGridModule } from '@shared/components/credentials-grid/credentials-grid.module';
import { FeatherModule } from 'angular-feather';
import { Copy, Paperclip } from 'angular-feather/icons';


@NgModule({
  declarations: [
    CredentialsComponent
  ],
  imports: [
    CommonModule,
    CredentialsGridModule,
    FeatherModule.pick({Copy, Paperclip}),
  ]
})
export class CredentialsModule { }
