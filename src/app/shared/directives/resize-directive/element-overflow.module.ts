import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ElementOverflowDirective } from './element-overflow.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [ElementOverflowDirective],
  exports: [ElementOverflowDirective],
})
export class ElemetOverflowDirectiveModule {}