import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PageToolbarComponent } from '@shared/components/page-toolbar/page-toolbar.component';

@NgModule({
  imports: [CommonModule],
  exports: [PageToolbarComponent],
  declarations: [PageToolbarComponent],
})
export class PageToolbarModule {}
