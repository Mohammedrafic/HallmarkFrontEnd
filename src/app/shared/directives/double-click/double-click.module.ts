import { NgModule } from '@angular/core';

import { DoubleClickDirective } from './double-click.directive';

@NgModule({
  declarations: [DoubleClickDirective],
  exports: [DoubleClickDirective],
})
export class DoubleClickModule {}
