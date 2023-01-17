import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollToTopComponent } from './scroll-to-top.component';
import { FeatherModule } from 'angular-feather';
import { ButtonModule } from '../button/button.module';

@NgModule({
  declarations: [ScrollToTopComponent],
  imports: [CommonModule, ButtonModule, FeatherModule],
  exports: [ScrollToTopComponent],
})
export class ScrollToTopModule {}
