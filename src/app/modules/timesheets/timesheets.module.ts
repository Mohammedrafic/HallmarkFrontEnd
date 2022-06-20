import { TimesheetsRoutingModule } from './timesheets-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimesheetsContainerComponent } from './containers/timesheets-container/timesheets-container.component';
import { TimesheetsTableComponent } from './components/timesheets-table/timesheets-table.component';
import { NgxsModule } from '@ngxs/store';
import { TimesheetsState } from './store/state/timesheets.state';
import { TimesheetsApiService } from './services/timesheets-api.service';




@NgModule({
  declarations: [
    TimesheetsContainerComponent,
    TimesheetsTableComponent,
  ],
  imports: [
    CommonModule,
    TimesheetsRoutingModule,
    NgxsModule.forFeature([TimesheetsState])
  ],
  exports: [TimesheetsContainerComponent],
  providers: [TimesheetsApiService]
})
export class TimesheetsModule {}
