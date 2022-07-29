import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsComponent } from './analytics.component';
import { StateWiseSkillsComponent } from './state-wise-skills/state-wise-skills.component';
import { CandidateStatsComponent } from './candidate-stats/candidate-stats.component';
import { AnalyticsRoutingModule } from './analytics-routing.module';



@NgModule({
  declarations: [
    AnalyticsComponent,
    StateWiseSkillsComponent,
    CandidateStatsComponent],
  imports: [
    CommonModule,
    AnalyticsRoutingModule
  ]
})
export class AnalyticsModule { }
