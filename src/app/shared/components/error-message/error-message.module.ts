import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ValidationErrorModule } from "@shared/pipes/validation-error/validation.error.module";
import { ErrorMessageComponent } from "./error-message.component";

@NgModule({
  declarations: [ErrorMessageComponent],
  exports: [ErrorMessageComponent],
  imports: [CommonModule, ValidationErrorModule],
})
export class ErrorMessageModule {}
