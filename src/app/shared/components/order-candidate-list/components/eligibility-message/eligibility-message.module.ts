import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeatherModule } from 'angular-feather';
import { AlertCircle } from 'angular-feather/icons';

import { EligibilityMessageComponent } from './eligibility-message.component';

@NgModule({
  declarations: [
    EligibilityMessageComponent,
  ],
  imports: [
    CommonModule,
    FeatherModule.pick({ AlertCircle }),
  ],
  exports: [
    EligibilityMessageComponent
  ]
})
export class EligibilityMessageModule { }
