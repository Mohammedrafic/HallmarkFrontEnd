import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { ChipListModule, ButtonModule } from '@syncfusion/ej2-angular-buttons';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FilterDialogComponent } from '@shared/components/filter-dialog/filter-dialog.component';

@NgModule({
  imports: [CommonModule, DialogModule, ChipListModule, ButtonModule],
  exports: [FilterDialogComponent],
  declarations: [FilterDialogComponent],
})
export class FilterDialogModule {}
