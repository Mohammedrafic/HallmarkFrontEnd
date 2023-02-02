import { NgModule } from '@angular/core';
import { ValidationErrorPipe } from './validation-error.pipe';

@NgModule({
  declarations: [ValidationErrorPipe],
  exports: [ValidationErrorPipe],
})
export class ValidationErrorModule {}
