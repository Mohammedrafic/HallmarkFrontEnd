import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CandidateCardComponent } from './candidate-card.component';
import { FeatherModule } from 'angular-feather';
import { Compass, Flag } from 'angular-feather/icons';

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
  ],
  exports: [CandidateCardComponent],
})
export class CandidateCardModule { }
