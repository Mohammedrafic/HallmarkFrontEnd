import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChipListModule } from '@syncfusion/ej2-angular-buttons';

import { CredentialStatusCellComponent } from './credential-status-cell.component';

@NgModule({
  declarations: [CredentialStatusCellComponent],
  imports: [
    CommonModule,
    ChipListModule,
  ],
})
export class CredentialStatusCellModule { }
