import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AnalyticByClickDirective } from '@shared/directives/analytics/analytics-by-click/analytic-by-click.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [AnalyticByClickDirective],
  exports: [AnalyticByClickDirective]
})
export class AnalyticByClickModule {}
