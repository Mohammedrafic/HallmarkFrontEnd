import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { FeatherModule } from 'angular-feather';
import { Compass, Flag } from 'angular-feather/icons';

import { CandidateCardComponent } from './candidate-card.component';
import { TextElipsisPipeModule } from '@shared/pipes/text-elipsis';

const icons = {
  Compass,
  Flag,
};

@NgModule({
  declarations: [
    CandidateCardComponent,
  ],
  imports: [
    CommonModule,
    FeatherModule.pick(icons),
    TooltipModule,
    TextElipsisPipeModule,
  ],
  exports: [CandidateCardComponent],
})
export class CandidateCardModule { }
