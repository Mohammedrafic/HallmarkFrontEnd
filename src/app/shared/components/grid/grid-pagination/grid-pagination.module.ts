import { PagerModule } from '@syncfusion/ej2-angular-grids';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DropdownModule } from '@shared/components/form-controls/dropdown/dropdown.module';
import { GridPaginationComponent } from './grid-pagination.component';
import { NumericTextboxModule } from '@shared/components/form-controls/numeric-textbox/numeric-textbox.module';

@NgModule({
  declarations: [GridPaginationComponent],
  exports: [GridPaginationComponent],
  imports: [CommonModule, NumericTextboxModule, PagerModule, DropdownModule],
})
export class GridPaginationModule {}
