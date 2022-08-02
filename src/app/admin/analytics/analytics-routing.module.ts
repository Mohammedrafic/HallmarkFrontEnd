import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnalyticsComponent } from './analytics.component';
import { CandidateStatsComponent } from './candidate-stats/candidate-stats.component';
import { StateWiseSkillsComponent } from './state-wise-skills/state-wise-skills.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: '',
    component: AnalyticsComponent,
    children: [
      
      {
        path: 'state-wise-skills',
        component: StateWiseSkillsComponent,
      },
      {
        path: 'candidate-stats',
        component: CandidateStatsComponent,
      },
      
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnalyticsRoutingModule {}
