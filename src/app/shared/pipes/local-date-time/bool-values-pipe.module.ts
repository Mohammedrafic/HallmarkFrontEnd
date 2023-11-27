import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LocalDateTimePipe } from './local-date-time.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [LocalDateTimePipe],
  exports: [LocalDateTimePipe],
})
export class LocalDateTimePipeModule {}