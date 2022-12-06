import { NgModule } from '@angular/core';

import { ValidateDirective } from './validate.directive';

@NgModule({
  declarations: [ValidateDirective],
  exports: [ValidateDirective],
})
export class ValidateDirectiveModule {}