import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeatherModule } from 'angular-feather';
import { Download } from 'angular-feather/icons';

import { CredentialFileCellComponent } from './credential-file-cell.component';

@NgModule({
  declarations: [CredentialFileCellComponent],
  imports: [
    CommonModule,
    FeatherModule.pick({ Download }),
  ],
})
export class CredentialFileCellModule { }
