import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipComponent } from './tooltip.component';
import { TooltipModule } from "@syncfusion/ej2-angular-popups";

@NgModule({
  declarations: [TooltipComponent],
  exports: [TooltipComponent],
  imports: [
    CommonModule,
    TooltipModule,
  ],
})
export class TooltipContainerModule { }
