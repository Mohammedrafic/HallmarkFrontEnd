import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormatBytesPipe } from './format-bytes.pipe';



@NgModule({
  declarations: [
    FormatBytesPipe,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    FormatBytesPipe,
  ],
})
export class FormatBytesModule { }
