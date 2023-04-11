import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeeksEndDirective } from 'src/app/modules/schedule/directives/weeks-end/weeks-end.directive';



@NgModule({
  declarations: [
    WeeksEndDirective,
  ],
  exports: [
    WeeksEndDirective,
  ],
  imports: [
    CommonModule,
  ],
})
export class WeeksEndModule { }
