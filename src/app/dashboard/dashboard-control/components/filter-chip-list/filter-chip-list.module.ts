import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ChipListAllModule } from '@syncfusion/ej2-angular-buttons';
import { FilterChipListComponent } from './filter-chip-list.component';

@NgModule({
  declarations: [FilterChipListComponent],
  exports: [FilterChipListComponent],
  imports: [CommonModule, ChipListAllModule],
})
export class FilterChipListModule {}
