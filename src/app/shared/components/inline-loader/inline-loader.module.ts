import { FeatherModule } from 'angular-feather';
import { Loader } from 'angular-feather/icons';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InlineLoaderComponent } from './inline-loader.component';

@NgModule({
  declarations: [InlineLoaderComponent],
  imports: [CommonModule, FeatherModule.pick({ Loader })],
  exports: [InlineLoaderComponent],
})
export class InlineLoaderModule {}
