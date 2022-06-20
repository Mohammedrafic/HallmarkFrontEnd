import { TimesheetsRoutingModule } from './timesheets-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimesheetsContainerComponent } from './containers/timesheets-container/timesheets-container.component';
import { TimesheetsTableComponent } from './components/timesheets-table/timesheets-table.component';




@NgModule({
  declarations: [
    TimesheetsContainerComponent,
    TimesheetsTableComponent,
  ],
  imports: [
    CommonModule,
    TimesheetsRoutingModule,
  ],
  exports: [TimesheetsContainerComponent],
})
export class TimesheetsModule {}
