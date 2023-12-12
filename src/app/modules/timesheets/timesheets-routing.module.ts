import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TimesheetHistoricalDataResolver } from './resolvers/timesheet-historical-data.resolver';
import { TimesheetsContainerComponent } from './containers/timesheets-container/timesheets-container.component';
import { AgencyVisibilityFlagResolverService } from '@core/resolvers/agency-visibility-flag.resolver';

const routes: Routes = [
  {
    path: '',
    component: TimesheetsContainerComponent,
    resolve: [TimesheetHistoricalDataResolver,AgencyVisibilityFlagResolverService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TimesheetsRoutingModule {}
