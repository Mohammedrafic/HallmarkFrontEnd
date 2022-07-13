import { PagerModule } from '@syncfusion/ej2-angular-grids';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DropdownModule } from '@shared/components/form-controls/dropdown/dropdown.module';
import { GridPaginationComponent } from './grid-pagination.component';
import { NumericTextboxModule } from '@shared/components/form-controls/numeric-textbox/numeric-textbox.module';
import { FeatherModule } from 'angular-feather';
import { Download } from 'angular-feather/icons';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';

const gridIcons = {
  Download,
};

@NgModule({
  declarations: [GridPaginationComponent],
  exports: [GridPaginationComponent],
  imports: [CommonModule, NumericTextboxModule, PagerModule, DropdownModule, FeatherModule.pick(gridIcons), ButtonModule]
})
export class GridPaginationModule {}
